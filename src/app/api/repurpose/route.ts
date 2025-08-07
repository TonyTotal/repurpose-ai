import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

// --- Initialize AI Client ---
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request: Request) {
  console.log("Repurpose API endpoint hit (v6 - All Platforms)");
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
    // --- THE NEW MASTER PROMPT ---
    const prompt = `You are a viral marketing strategist and expert content creator. Your task is to extract the most valuable content from the following article and create a complete package of social media content for multiple platforms.

    **Content Package Requirements:**

    1.  **twitterTweets:** Generate 5 distinct, high-impact, standalone tweets.
        - Tweet 1: A compelling question.
        - Tweet 2: The most surprising takeaway.
        - Tweet 3: A practical, actionable tip.
        - Tweet 4: A powerful statistic or data point.
        - Tweet 5: An inspiring quote.

    2.  **linkedInPost:** Write one professional, insightful LinkedIn post based on the article's main themes. Use professional language and include 3-5 relevant hashtags.

    3.  **instagramCaption:** Write one engaging Instagram caption. It should be visually descriptive, use emojis, and include a strong call to action and relevant hashtags.

    4.  **facebookPost:** Write one slightly longer, more narrative-style Facebook post that tells a small story or provides deeper context from the article.

    5.  **tikTokScript:** Write a script for a short (15-30 second) TikTok video. The script should have two parts: "visual" (a description of the on-screen action or text) and "voiceover" (the spoken audio).

    **IMPORTANT:** Your entire response must be a single, valid JSON object. The object should have the keys: "twitterTweets", "linkedInPost", "instagramCaption", "facebookPost", and "tikTokScript".

    **Article Text:**
    ---
    ${articleText.substring(0, 30000)} 
    ---
    `;
    console.log("Generating content with new 'Master' prompt...");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("AI content generated successfully.");

    return NextResponse.json({ repurposedContent: text });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("Error generating AI content:", errorMessage);
    return NextResponse.json({ error: `Failed to generate AI content: ${errorMessage}` }, { status: 500 });
  }
}