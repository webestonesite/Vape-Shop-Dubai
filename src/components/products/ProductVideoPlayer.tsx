"use client";

import React, { useState } from "react";
import { Play } from "lucide-react";
import { getYouTubeDetails, detectVideoType } from "@/lib/youtube";

interface ProductVideoPlayerProps {
  videoUrl: string;
  title?: string;
  fallbackImage?: string;
  autoPlay?: boolean;
}

export function ProductVideoPlayer({
  videoUrl,
  title = "Product Video",
  fallbackImage,
  autoPlay = false,
}: ProductVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const videoType = detectVideoType(videoUrl);
  const ytDetails = videoType === "youtube" ? getYouTubeDetails(videoUrl) : null;

  // 1. YouTube Video Embed (Facade Pattern matching site design system)
  if (videoType === "youtube" && ytDetails) {
    if (!isPlaying) {
      const posterSrc = fallbackImage || ytDetails.maxResThumbnailUrl || ytDetails.thumbnailUrl;

      return (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Play video for ${title}`}
          onClick={() => setIsPlaying(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsPlaying(true);
            }
          }}
          className="group relative w-full aspect-video cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl bg-black border border-border/80 shadow-md select-none transition-all duration-300 hover:border-primary/60 hover:shadow-xl"
        >
          {/* Background Poster Image */}
          {posterSrc && (
            <img
              src={posterSrc}
              alt={title}
              loading="eager"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover filter brightness-95 group-hover:scale-102 transition-transform duration-500"
            />
          )}

          {/* Light Ambient Overlay */}
          <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors duration-300" />

          {/* Central Pulsing Play Button Matching Mockup */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#f97316] text-white shadow-2xl transition-all duration-300 group-hover:scale-110 ring-4 ring-white/50">
              <Play className="ml-1 h-6 w-6 sm:h-9 sm:w-9 fill-white text-white" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full aspect-video overflow-hidden rounded-2xl sm:rounded-3xl bg-black border border-border/80 shadow-md">
        <iframe
          src={ytDetails.embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full border-0 rounded-2xl sm:rounded-3xl"
        />
      </div>
    );
  }

  // 2. Direct MP4 / WebM Native Video
  if (videoType === "mp4" || (!videoType && videoUrl)) {
    return (
      <div className="relative w-full aspect-video overflow-hidden rounded-[2rem] bg-black/5 border border-border/80 shadow-md flex items-center justify-center">
        <video
          controls
          playsInline
          autoPlay={isPlaying}
          preload="metadata"
          poster={fallbackImage}
          className="h-full w-full object-contain rounded-[2rem]"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>
      </div>
    );
  }

  return null;
}

