"use client";

import React, { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";

interface BlogImageWithSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export function BlogImageWithSkeleton({
  src,
  alt,
  className = "",
  containerClassName = "",
}: BlogImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-muted/70 ${containerClassName}`}>
      {/* Skeleton Pulse animation shown while loading */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-muted/80 animate-pulse flex items-center justify-center z-10">
          <div className="w-7 h-7 rounded-full border-2 border-primary/20 border-t-primary animate-spin opacity-40" />
        </div>
      )}

      {src && !error ? (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`${className} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        />
      ) : null}

      {/* Clean CSS skeleton state if image fails or missing (NO fallback image used) */}
      {(error || !src) && (
        <div className="w-full h-full bg-gradient-to-br from-muted/50 via-muted/30 to-muted/60 flex flex-col items-center justify-center p-4 text-center">
          <BookOpen className="w-7 h-7 text-primary/30 mb-2 animate-pulse" />
          <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
            Vape Shop Dubai
          </span>
        </div>
      )}
    </div>
  );
}
