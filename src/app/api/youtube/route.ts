import { NextRequest, NextResponse } from 'next/server'

interface YouTubeVideoData {
  title?: string
  duration?: string
  transcript?: string
  error?: string
}

// Extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

// Convert YouTube duration format to ISO 8601
function convertDuration(duration: string): string {
  // YouTube returns duration like "PT5M30S"
  // This is already ISO 8601 format, so we can return as-is
  return duration
}

async function fetchYouTubeData(videoId: string): Promise<YouTubeVideoData> {
  const apiKey = process.env.YOUTUBE_API_KEY
  
  if (!apiKey) {
    return { error: 'YouTube API key not configured' }
  }

  try {
    // Fetch video details from YouTube Data API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`
    )

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('YouTube API data:', data)

    if (!data.items || data.items.length === 0) {
      return { error: 'Video not found or not accessible' }
    }

    const video = data.items[0]
    const snippet = video.snippet
    const contentDetails = video.contentDetails

    let transcript = ''
    
    // Try to fetch transcript (this requires additional permissions and may not always work)
    try {
      const captionsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&part=snippet&key=${apiKey}`
      )
      
      if (captionsResponse.ok) {
        const captionsData = await captionsResponse.json()
        if (captionsData.items && captionsData.items.length > 0) {
          // Note: Actually downloading captions requires OAuth and additional permissions
          // For now, we'll just indicate that captions are available
          transcript = 'Captions available - please manually review and add transcript for best SEO results'
        }
      }
    } catch (captionError) {
      // Caption fetching failed, continue without transcript
      console.log('Caption fetching failed:', captionError)
    }

    return {
      title: snippet.title,
      duration: convertDuration(contentDetails.duration),
      transcript: transcript || undefined
    }

  } catch (error) {
    console.error('Error fetching YouTube data:', error)
    return { error: 'Failed to fetch video data from YouTube' }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const videoId = extractVideoId(url)

    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }

    const videoData = await fetchYouTubeData(videoId)

    return NextResponse.json(videoData)

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'YouTube API endpoint - use POST with { url: "youtube_url" }' 
  })
} 