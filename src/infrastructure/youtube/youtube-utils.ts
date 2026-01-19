// Server-side YouTube utilities for schema generation
// Direct YouTube API integration for SSR and schema markup

interface YouTubeMetadata {
  title?: string;
  duration?: string;
  transcript?: string;
  error?: string;
}

export function getYouTubeId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

// Convert YouTube duration format to ISO 8601 (copied from API route)
function convertDuration(duration: string): string {
  return duration; // YouTube API already returns ISO 8601 format
}

// Direct YouTube API call for server-side schema generation
async function fetchYouTubeDataDirect(videoId: string): Promise<YouTubeMetadata> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    return { error: 'YouTube API key not configured' };
  }

  try {
    // Fetch video details from YouTube Data API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return { error: 'Video not found or not accessible' };
    }

    const video = data.items[0];
    const snippet = video.snippet;
    const contentDetails = video.contentDetails;

    let transcript = '';
    
    // Try to fetch transcript (same logic as API route)
    try {
      const captionsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&part=snippet&key=${apiKey}`
      );
      
      if (captionsResponse.ok) {
        const captionsData = await captionsResponse.json();
        if (captionsData.items && captionsData.items.length > 0) {
          transcript = 'Captions available - please manually review and add transcript for best SEO results';
        }
      }
    } catch (captionError) {
      // Caption fetching failed, continue without transcript
      console.log('Caption fetching failed:', captionError);
    }

    return {
      title: snippet.title,
      duration: convertDuration(contentDetails.duration),
      transcript: transcript || undefined
    };

  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    return { error: 'Failed to fetch video data from YouTube' };
  }
}

// Use direct API call for SSR to avoid circular requests
export async function fetchYouTubeMetadata(url: string): Promise<YouTubeMetadata> {
  const videoId = getYouTubeId(url);
  
  if (!videoId) {
    return { error: 'Invalid YouTube URL' };
  }

  try {
    // For SSR, call YouTube API directly to avoid circular requests
    return await fetchYouTubeDataDirect(videoId);
  } catch (error) {
    return { error: `${error}` };
  }
}

export function generateVideoSchema(
  videoId: string,
  metadata: YouTubeMetadata,
  overrides: {
    title?: string;
    description?: string;
    transcript?: string;
    keyMoments?: Array<{ time: number; title: string; description?: string }>;
  } = {}
) {
  return {
    '@type': 'VideoObject',
    '@id': `https://www.youtube.com/watch?v=${videoId}`,
    name: overrides.title || metadata.title,
    description: overrides.description,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    duration: metadata.duration,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    // Use manual transcript override first, then API transcript, then none
    ...(overrides.transcript && { transcript: overrides.transcript }),
    ...(!overrides.transcript && metadata.transcript && { transcript: metadata.transcript }),
    ...(overrides.keyMoments && {
      hasPart: overrides.keyMoments.map((moment) => ({
        '@type': 'Clip',
        name: moment.title,
        description: moment.description,
        startOffset: moment.time,
        url: `https://www.youtube.com/watch?v=${videoId}&t=${moment.time}s`
      }))
    })
  };
} 