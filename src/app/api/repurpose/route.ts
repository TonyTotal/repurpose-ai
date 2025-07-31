import { GoogleGenerativeAI } from "@google/generative-ai";
import ytdl from '@distube/ytdl-core';
import { NextResponse } from 'next/server';

// --- Initialize AI Client ---
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Helper function to parse XML and extract text ---
function parseTranscript(xml: string): string {
    const lines = xml
        .replace(/<text start="[^"]+" dur="[^"]+">/g, '\n')
        .replace(/<\/text>/g, '')
        .replace(/&amp;#39;/g, "'")
        .replace(/&quot;/g, '"')
        .split('\n');
    
    return lines.map(line => line.trim()).join(' ');
}

export async function POST(request: Request) {
  console.log("Repurpose API endpoint hit (v4 - @distube/ytdl-core)");
  const { contentUrl } = await request.json();

  if (!contentUrl || !ytdl.validateURL(contentUrl)) {
    return NextResponse.json({ error: 'A valid YouTube URL is required' }, { status: 400 });
  }

  let transcript = '';

  try {
    console.log(`Fetching info for: ${contentUrl}`);
    const info = await ytdl.getInfo(contentUrl);

    const captionTracks = info.player_response?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!captionTracks || captionTracks.length === 0) {
        throw new Error("No caption tracks found for this video.");
    }

    const englishTrack = captionTracks.find(track => track.languageCode === 'en');
    if (!englishTrack || !englishTrack.baseUrl) {
        throw new Error("English captions not available for this video.");
    }
    
    console.log("Found English caption track. Fetching content...");
    const transcriptResponse = await fetch(englishTrack.baseUrl);
    const xmlTranscript = await transcriptResponse.text();

    transcript = parseTranscript(xmlTranscript);

    if (!transcript) throw new Error("Could not extract text from captions.");
    console.log("Transcript fetched successfully.");

  } catch (error) { // <-- FIX #1
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("Error fetching transcript with @distube/ytdl-core:", errorMessage);
    return NextResponse.json({ error: `Failed to fetch transcript: ${errorMessage}` }, { status: 500 });
  }

  try {
    const prompt = `You are a world-class social media expert. Based on the following video transcript, create an engaging and viral-style Twitter thread of 5 tweets. The thread should capture the key points and be easy to read.

    Transcript:
    ---
    ${transcript.substring(0, 100000)} 
    ---

    Twitter Thread:`;
    console.log("Generating content with AI...");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("AI content generated successfully.");

    return NextResponse.json({ repurposedContent: text });

  } catch (error) { // <-- FIX #2
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("Error generating AI content:", errorMessage);
    return NextResponse.json({ error: `Failed to generate AI content: ${errorMessage}` }, { status: 500 });
  }
}