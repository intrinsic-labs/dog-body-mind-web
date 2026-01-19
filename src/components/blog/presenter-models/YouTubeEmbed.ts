export interface YouTubeEmbed {
  _type: "youtube";
  url: string;
  title?: string;
  description?: string;
  transcript?: string;
  keyMoments?: Array<{
    time: number;
    title: string;
    description?: string;
  }>;
}
