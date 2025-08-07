'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"

export default function Dashboard() {
  const [contentUrl, setContentUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast.success("Tweet copied to clipboard!")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setResults([]);
    setError(null);

    try {
      const response = await fetch('/api/repurpose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contentUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      console.log("Raw AI Response:", data.repurposedContent);

      // --- THE NEW, MORE ROBUST FIX IS HERE ---
      const rawResponse = data.repurposedContent;
      
      // Find the start and end of the JSON object
      const jsonStart = rawResponse.indexOf('{');
      const jsonEnd = rawResponse.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("Could not find a valid JSON object in the AI's response.");
      }

      // Extract only the JSON part of the string
      const jsonString = rawResponse.substring(jsonStart, jsonEnd + 1);
      
      const parsedData = JSON.parse(jsonString);
      setResults(parsedData.twitterThread);

    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to process AI response: ${err.message}`);
      } else {
        setError('An unexpected error occurred.');
      }
      console.error(err);
    }

    setIsLoading(false)
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
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
                  placeholder="[https://your-favorite-blog.com/article](https://your-favorite-blog.com/article)"
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
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {results.length > 0 && (
        <div className="w-full max-w-xl mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Generated Twitter Thread</h2>
          {results.map((tweet, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex justify-between items-start">
                <p className="text-sm mr-4">{tweet}</p>
                <Button variant="outline" size="sm" onClick={() => handleCopy(tweet)}>
                  Copy
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}