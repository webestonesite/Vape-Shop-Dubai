"use client";

import React, { useState, useEffect, useRef } from "react";
import { BookOpen } from "lucide-react";

interface BlogImageWithSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}

export function BlogImageWithSkeleton({
  src,
  alt,
  className = "",
  containerClassName = "",
  priority = false,
}: BlogImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(priority);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  // Lazy load image only when visible on active page / viewport
  useEffect(() => {
    if (priority || isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isVisible]);

  const isDummyImage =
    !src ||
    src.includes("juul_menthol") ||
    src.includes("juul_device") ||
    src.includes("vape_kit") ||
    src.includes("lost_mary") ||
    src.includes("premium_liquid") ||
    src.includes("hero_vape") ||
    src.includes("blog_juul") ||
    src.includes("blog_disposable") ||
    src.includes("blog_eliquid") ||
    src.includes("blog_pod") ||
    src.includes("blog_authenticity");

  return (
    <div ref={containerRef} className={`relative overflow-hidden bg-muted/70 ${containerClassName}`}>
      {/* Skeleton Pulse animation shown while loading */}
      {!loaded && !error && !isDummyImage && (
        <div className="absolute inset-0 bg-muted/80 animate-pulse flex items-center justify-center z-10 pointer-events-none">
          <div className="w-7 h-7 rounded-full border-2 border-primary/20 border-t-primary animate-spin opacity-40" />
        </div>
      )}

      {!isDummyImage && !error && isVisible ? (
        <img
          ref={(el) => {
            imgRef.current = el;
            if (el && el.complete) {
              if (el.naturalWidth === 0) {
                setError(true);
              } else {
                setLoaded(true);
              }
            }
          }}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`${className} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        />
      ) : null}

      {/* Clean CSS skeleton state if image fails or missing or legacy dummy (NO fallback image used) */}
      {(error || isDummyImage) && (
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
