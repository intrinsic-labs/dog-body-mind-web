export interface InlineImage {
  _type: "inlineImage";
  asset: {
    url: string;
    metadata?: {
      dimensions?: {
        width: number;
        height: number;
      };
    };
  };
  alt: string;
  caption?: string;
  size?: "full" | "large" | "medium" | "small";
  loading?: "lazy" | "eager";
  enableOverflow?: boolean;
}
