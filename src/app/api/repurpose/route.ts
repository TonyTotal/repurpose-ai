import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

// --- Initialize AI Client ---
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request: Request) {
  console.log("Repurpose API endpoint hit (v5 - Article Scraper)");
  const { contentUrl } = await request.json();

  if (!contentUrl) {
    return NextResponse.json({ error: 'Article URL is required' }, { status: 400 });
  }

  let articleText = '';

  try {
    console.log(`Fetching article from: ${contentUrl}`);
    const response = await fetch(contentUrl);
    const html = await response.text();
    const $ = cheerio.load(html);

    $('article, .post, .entry-content, main').find('p, h1, h2, h3, li').each((i, elem) => {
        articleText += $(elem).text() + '\n';
    });

    if (!articleText) {
        throw new Error("Could not extract article text.");
    }
    console.log("Article text fetched successfully.");

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("Error fetching article:", errorMessage);
    return NextResponse.json({ error: `Failed to fetch article: ${errorMessage}` }, { status: 500 });
  }

  try {
    const prompt = `You are a world-class social media expert. Based on the following article text, create an engaging Twitter thread of 5 tweets.

    IMPORTANT: Your entire response must be a single, valid JSON object. The object should have a single key called "twitterThread", and its value should be an array of strings, where each string is a single tweet.

    Article Text:
    ---
    ${articleText.substring(0, 30000)} 
    ---
    `;
    console.log("Generating content with AI...");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("AI content generated successfully.");

    // The AI now returns a JSON string, so we send it directly
    return NextResponse.json({ repurposedContent: text });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("Error generating AI content:", errorMessage);
    return NextResponse.json({ error: `Failed to generate AI content: ${errorMessage}` }, { status: 500 });
  }
}