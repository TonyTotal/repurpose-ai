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
        throw new Error("Could not extract article text. The site might be heavily JavaScript-based or have an unusual structure.");
    }
    console.log("Article text fetched successfully.");

  } catch (error: any) {
    console.error("Error fetching article:", error.message);
    return NextResponse.json({ error: `Failed to fetch article: ${error.message}` }, { status: 500 });
  }

  try {
    const prompt = `You are a world-class social media expert. Based on the following article text, create an engaging and viral-style Twitter thread of 5 tweets. The thread should capture the key points and be easy to read.

    Article Text:
    ---
    ${articleText.substring(0, 30000)} 
    ---

    Twitter Thread:`;
    console.log("Generating content with AI...");

    // THE FIX IS HERE: Use the new, correct model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); 
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("AI content generated successfully.");

    return NextResponse.json({ repurposedContent: text });

  } catch (error: any) {
    console.error("Error generating AI content:", error.message);
    return NextResponse.json({ error: `Failed to generate AI content: ${error.message}` }, { status: 500 });
  }
}