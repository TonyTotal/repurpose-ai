'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { ThemeToggle } from '@/components/theme-toggle'
import type { User } from '@supabase/supabase-js'

// --- Define a type for our expanded results ---
// This type now accepts any string key for the tweet object
type TweetObject = {
  [key: string]: string;
}

type RepurposeResults = {
  twitterTweets: TweetObject[];
  linkedInPost: string;
  instagramCaption: string;
  facebookPost: string;
  tikTokScript: {
    visual: string;
    voiceover: string;
  };
}

export default function DashboardClient({ user }: { user: User }) {
  const [contentUrl, setContentUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<RepurposeResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast.success("Content copied to clipboard!")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setResults(null);
    setError(null);

    try {
      const response = await fetch('/api/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      const rawResponse = data.repurposedContent;
      const jsonStart = rawResponse.indexOf('{');
      const jsonEnd = rawResponse.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("Could not find a valid JSON object in the AI's response.");
      }

      const jsonString = rawResponse.substring(jsonStart, jsonEnd + 1);
      const parsedData: RepurposeResults = JSON.parse(jsonString);
      setResults(parsedData);

    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to process AI response: ${err.message}`);
      } else {
        setError('An unexpected error occurred.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-background p-4">
      <div className="absolute top-4 right-4 flex items-center space-x-4">
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl">RepurposeAI</CardTitle>
          <CardDescription>
            Enter a Blog Post or Article URL to generate a social media campaign.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Input
                  id="contentUrl"
                  placeholder="https://your-favorite-blog.com/article"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? 'Repurposing...' : 'Create Campaign'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="w-full max-w-xl mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <Tabs defaultValue="twitter" className="w-full max-w-xl mt-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="twitter">Twitter</TabsTrigger>
            <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
            <TabsTrigger value="facebook">Facebook</TabsTrigger>
            <TabsTrigger value="tiktok">TikTok</TabsTrigger>
          </TabsList>
          
          <TabsContent value="twitter" className="space-y-4 mt-4">
            {results.twitterTweets.map((item, index) => {
              // --- THE FIX IS HERE ---
              const tweetText = Object.values(item)[0]; // Get the first (and only) value from the object
              return (
                <Card key={`tweet-${index}`}>
                  <CardContent className="p-4 flex justify-between items-start">
                    <p className="text-sm mr-4">{tweetText}</p>
                    <Button variant="outline" size="sm" onClick={() => handleCopy(tweetText)}>Copy</Button>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="linkedin">
            <Card>
              <CardContent className="p-4 flex justify-between items-start">
                <p className="text-sm whitespace-pre-wrap mr-4">{results.linkedInPost}</p>
                <Button variant="outline" size="sm" onClick={() => handleCopy(results.linkedInPost)}>Copy</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="instagram">
            <Card>
              <CardContent className="p-4 flex justify-between items-start">
                <p className="text-sm whitespace-pre-wrap mr-4">{results.instagramCaption}</p>
                <Button variant="outline" size="sm" onClick={() => handleCopy(results.instagramCaption)}>Copy</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="facebook">
            <Card>
              <CardContent className="p-4 flex justify-between items-start">
                <p className="text-sm whitespace-pre-wrap mr-4">{results.facebookPost}</p>
                <Button variant="outline" size="sm" onClick={() => handleCopy(results.facebookPost)}>Copy</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tiktok">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">TikTok Script</CardTitle>
                </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                    <h4 className="font-semibold mb-2">Visual:</h4>
                    <p className="text-sm whitespace-pre-wrap">{results.tikTokScript.visual}</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Voiceover:</h4>
                    <p className="text-sm whitespace-pre-wrap">{results.tikTokScript.voiceover}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleCopy(`Visual: ${results.tikTokScript.visual}\n\nVoiceover: ${results.tikTokScript.voiceover}`)}>Copy Script</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
