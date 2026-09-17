"use client";

import React from "react";
import { Copy, Check, MessageCircle } from "lucide-react";

export function ShareButtons() {
  const [copied, setCopied] = React.useState(false);
  const [url, setUrl] = React.useState("");

  React.useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 text-xs font-bold bg-background border border-border/60 hover:border-primary px-4 py-2 rounded-full transition-colors cursor-pointer"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-primary" />
        )}
        {copied ? "Copied!" : "Copy Link"}
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-bold bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        WhatsApp
      </a>
    </div>
  );
}
