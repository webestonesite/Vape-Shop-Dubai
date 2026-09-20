"use client";

import Image, { type ImageProps } from "next/image";
import React, { useState, useCallback } from "react";

const OPTIMIZED_HOSTS = ["cdn.shopify.com"];

function canOptimize(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("/")) return true;
  try {
    return OPTIMIZED_HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}

type SmartImageProps = Omit<ImageProps, "src"> & {
  src: string;
  fallbackSrc?: string;
};

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  fallbackSrc,
  alt,
  width,
  height,
  className = "",
  sizes,
  priority,
  fetchPriority,
  draggable,
  ...rest
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setError(true);
    event.currentTarget.style.opacity = "0";
  }, []);

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

  if (isDummyImage || error) {
    return (
      <div className={`bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl flex items-center justify-center p-2 ${className}`}>
        <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">Vape Shop</span>
      </div>
    );
  }

  const effectiveSizes =
    sizes ||
    (typeof width === "number" && width <= 80
      ? "(max-width: 640px) 64px, 80px"
      : typeof width === "number" && width <= 180
      ? "(max-width: 640px) 140px, 180px"
      : typeof width === "number" && width <= 360
      ? "(max-width: 640px) 240px, 360px"
      : "(max-width: 640px) 360px, 640px");

  return (
    <div className="relative overflow-hidden flex items-center justify-center w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 bg-muted/80 animate-pulse flex items-center justify-center z-10 pointer-events-none rounded-xl" />
      )}

      {canOptimize(src) ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300 mx-auto`}
          sizes={effectiveSizes}
          quality={75}
          priority={priority}
          fetchPriority={fetchPriority}
          draggable={draggable}
          onLoad={() => setLoaded(true)}
          onError={handleError}
          style={{ width: "auto", height: "auto", ...rest.style }}
          {...rest}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={typeof alt === "string" ? alt : ""}
          width={typeof width === "number" ? width : undefined}
          height={typeof height === "number" ? height : undefined}
          className={`${className} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300 mx-auto`}
          draggable={draggable}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={fetchPriority}
          onLoad={() => setLoaded(true)}
          onError={handleError}
        />
      )}
    </div>
  );
};
