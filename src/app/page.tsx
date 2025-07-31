'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert" // Import Alert

export default function Dashboard() {
  const [contentUrl, setContentUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState('');
  const [error, setError] = useState<string | null>(null); // <-- New state for errors

  // First, add the Alert component using shadcn
  // In your terminal, run: npx shadcn-ui@latest add alert

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setResults('');
    setError(null); // <-- Clear previous errors

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
        // If response is not ok, use the error message from the API
        throw new Error(data.error || 'Something went wrong');
      }
      
      setResults(data.repurposedContent);

    } catch (err: any) {
      console.error(err);
      setError(err.message); // <-- Set the error message to display
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

      {error && ( // <-- Display error message if it exists
        <Alert variant="destructive" className="w-full max-w-xl mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {results && (
        <Card className="w-full max-w-xl mt-8">
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {results}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}