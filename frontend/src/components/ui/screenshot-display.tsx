// src/components/ui/ScreenshotDisplay.tsx
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Maximize2, X } from "lucide-react";

interface ScreenshotDisplayProps {
  src: string;
  alt: string;
  tabNumber?: number;
  className?: string;
}

export const ScreenshotDisplay = ({
  src,
  alt,
  tabNumber,
  className,
}: ScreenshotDisplayProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle ESC key to close fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Prevent body scroll when fullscreen is open
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      {/* Image container - removed gradient border effect */}
      <div className="relative bg-secondary-background border border-divider group">
        {/* Image - Using width/height auto instead of fill to preserve aspect ratio */}
        <div className="relative w-full">
          <Image
            src={src}
            alt={alt}
            width={1920}
            height={1080}
            quality={100}
            className="w-full h-auto object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Fullscreen button */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
          aria-label="View fullscreen"
        >
          <Maximize2 className="w-4 h-4 text-primary-cta" />
        </button>
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-primary-background/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className="relative w-full max-w-7xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-lg border border-divider">
              {/* Using img tag for maximum sharpness in fullscreen mode */}
              <img
                src={src}
                alt={alt}
                className="w-full h-auto max-w-none"
                style={{ imageRendering: "auto" }}
              />
            </div>

            {/* More prominent close button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 bg-primary-background/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-secondary-background transition-colors"
              aria-label="Close fullscreen view"
            >
              <X className="w-6 h-6 text-primary-text" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenshotDisplay;
