"use client";

import Image, { type ImageProps } from "next/image";
import React, { useState, useCallback } from "react";

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

  const isDummyImage = !src || src === "";

  if (isDummyImage || error) {
    return (
      <div className={`bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl flex items-center justify-center p-2 w-full h-full`}>
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
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-muted/30 animate-pulse rounded-xl pointer-events-none" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} mx-auto z-10 transition-all duration-300 ${
          loaded ? "opacity-100 blur-0" : "opacity-90"
        }`}
        sizes={effectiveSizes}
        priority={priority}
        fetchPriority={fetchPriority}
        draggable={draggable}
        ref={(node) => {
          if (node?.complete && !loaded) {
            setLoaded(true);
          }
        }}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          handleError(e);
          setLoaded(true);
        }}
        style={rest.style}
        {...rest}
      />
    </div>
  );
};
