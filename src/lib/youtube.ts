export interface YouTubeDetails {
  videoId: string;
  embedUrl: string;
  thumbnailUrl: string;
  maxResThumbnailUrl: string;
}

/**
 * Extracts YouTube video ID and generates privacy-enhanced embed/thumbnail URLs.
 * Supports standard watch, short, embed, and youtu.be links.
 */
export function getYouTubeDetails(url: string): YouTubeDetails | null {
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();

  // Match youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);

  if (!match || !match[1]) return null;

  const videoId = match[1];

  return {
    videoId,
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    maxResThumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  };
}

/**
 * Checks if a given string is a valid video URL (YouTube, Vimeo, or direct MP4/WebM).
 */
export function detectVideoType(url: string): "youtube" | "vimeo" | "mp4" | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim().toLowerCase();

  if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) {
    return "youtube";
  }
  if (trimmed.includes("vimeo.com")) {
    return "vimeo";
  }
  if (trimmed.endsWith(".mp4") || trimmed.includes(".mp4?") || trimmed.endsWith(".webm") || trimmed.includes(".webm?")) {
    return "mp4";
  }
  return null;
}
