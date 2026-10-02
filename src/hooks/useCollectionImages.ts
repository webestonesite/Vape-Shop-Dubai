import { useState, useEffect } from "react";

let cachedImages: Record<string, string> | null = null;
let fetchPromise: Promise<Record<string, string>> | null = null;

export function useCollectionImages() {
  const [images, setImages] = useState<Record<string, string>>(cachedImages || {});

  useEffect(() => {
    if (cachedImages) {
      setImages(cachedImages);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = fetch("/api/collections/images", { next: { revalidate: 3600 } })
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            cachedImages = data;
          }
          return data.error ? {} : data;
        })
        .catch((err) => {
          console.error("Failed to load collection images", err);
          return {};
        });
    }

    fetchPromise.then((data) => {
      setImages(data);
    });
  }, []);

  return images;
}

export function getHandleFromUrl(url: string | undefined): string | null {
  if (!url) return null;
  const match = url.match(/\/collections\/([^/?#]+)/i);
  return match ? match[1] : null;
}
