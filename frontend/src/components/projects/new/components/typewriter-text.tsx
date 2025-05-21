"use client";

import { useState, useEffect } from "react";

interface TypewriterTextProps {
  text: string;
  onComplete?: () => void;
  className?: string;
  speed?: number;
}

export function TypewriterText({
  text,
  onComplete,
  className = "",
  speed = 100, // Characters per second
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Reset when text input changes
    setDisplayedText("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      // Calculate typing speed with a bit of randomness for realism
      const adjustedSpeed = speed + Math.random() * 60 - 10;

      // Set timeout for next character
      const timeout = setTimeout(() => {
        setDisplayedText((current) => current + text[currentIndex]);
        setCurrentIndex((current) => current + 1);
      }, 1000 / adjustedSpeed);

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, isComplete, onComplete]);

  return (
    <div className={className}>
      {displayedText}
      {currentIndex < text.length && (
        <span className="inline-block w-1.5 h-4 bg-primary-cta/80 ml-0.5 animate-pulse" />
      )}
    </div>
  );
}
