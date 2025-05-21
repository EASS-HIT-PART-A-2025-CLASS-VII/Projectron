"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface ComparisonSliderProps {
  beforeLabel: string;
  afterLabel: string;
  beforeContent: React.ReactNode;
  afterContent: React.ReactNode;
}

const ComparisonSlider = ({
  beforeLabel,
  afterLabel,
  beforeContent,
  afterContent,
}: ComparisonSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isInView = useInView(sliderRef, { once: true, margin: "-100px" });

  // Add refs for the content containers for synced scrolling
  const beforeContainerRef = useRef<HTMLDivElement>(null);
  const afterContainerRef = useRef<HTMLDivElement>(null);

  // Simple lock to prevent infinite scroll loops
  const isScrolling = useRef(false);

  // Define handleMouseDown outside of useEffect so it's accessible in JSX
  const handleMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault(); // Prevent text selection
      isDragging.current = true;
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Handle slider interaction
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !sliderRef.current) return;

      // Prevent default behavior to stop text selection
      e.preventDefault();

      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const newPosition = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(newPosition);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || !sliderRef.current) return;

      // Prevent default behavior to stop text selection
      e.preventDefault();

      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.max(
        0,
        Math.min(e.touches[0].clientX - rect.left, rect.width)
      );
      const newPosition = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(newPosition);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchend", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleMouseUp]);

  // Auto-animate slider when first in view
  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        const duration = 2000; // 2 seconds
        const frames = 60;
        const interval = duration / frames;
        let currentFrame = 0;

        const animate = () => {
          if (currentFrame <= frames) {
            // Easing function for smoother animation
            const progress = currentFrame / frames;
            const easedProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);

            setSliderPosition(50 + 30 * easedProgress); // Move from 50% to 80%
            currentFrame++;
            setTimeout(animate, interval);
          }
        };

        animate();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isInView]);

  // Add synchronized scrolling effect
  useEffect(() => {
    const beforeContainer = beforeContainerRef.current;
    const afterContainer = afterContainerRef.current;

    if (!beforeContainer || !afterContainer) return;

    const syncScroll = (source: HTMLDivElement, target: HTMLDivElement) => {
      // Skip if already in the process of scrolling to prevent loops
      if (isScrolling.current) return;

      try {
        // Set lock
        isScrolling.current = true;

        // Direct synchronization with no delay
        target.scrollTop = source.scrollTop;
      } finally {
        // Release lock immediately after the operation completes
        setTimeout(() => {
          isScrolling.current = false;
        }, 0);
      }
    };

    const handleBeforeScroll = () =>
      syncScroll(beforeContainer, afterContainer);
    const handleAfterScroll = () => syncScroll(afterContainer, beforeContainer);

    // Add event listeners
    beforeContainer.addEventListener("scroll", handleBeforeScroll);
    afterContainer.addEventListener("scroll", handleAfterScroll);

    // Cleanup
    return () => {
      beforeContainer.removeEventListener("scroll", handleBeforeScroll);
      afterContainer.removeEventListener("scroll", handleAfterScroll);
    };
  }, []);

  return (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
    >
      {/* Labels Bar Above Slider */}
      <div className="flex w-full mb-3 select-none">
        {/* Before Label */}
        <div
          className="w-1/2 py-3 px-4 bg-hover-active hover:border-ring border border-transparent rounded-tl-lg rounded-bl-lg flex items-center min-w-[200px] cursor-pointer transition-colors duration-200"
          style={{ width: `${sliderPosition}%` }}
          onClick={() => setSliderPosition(100)} // Move slider right to reveal more "Before" content
        >
          <ChevronLeft className="text-white w-5 h-5 mr-2" />
          <span className="font-medium text-primary-text">{afterLabel}</span>
        </div>

        {/* After Label */}
        <div
          className="py-3 px-4 bg-hover-active hover:border-ring hover:border bg-opacity-20 hover:bg-hover-active/40 rounded-tr-lg rounded-br-lg flex items-center justify-end border-l border-primary-text flex-grow min-w-[200px] cursor-pointer transition-colors duration-200"
          onClick={() => setSliderPosition(0)} // Move slider left to reveal more "After" content
        >
          <span className="font-medium text-white">{beforeLabel}</span>
          <ChevronRight className="text-white w-5 h-5 ml-2" />
        </div>
      </div>

      {/* Main Slider */}
      <div
        ref={sliderRef}
        className="relative w-full bg-secondary-background rounded-lg overflow-hidden shadow-xl h-[600px] md:h-[500px] select-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* Before Side */}
        <div
          ref={beforeContainerRef}
          className="absolute inset-0 h-full w-full p-6 overflow-auto"
        >
          {beforeContent}
        </div>

        {/* After Side */}
        <div
          ref={afterContainerRef}
          className="absolute inset-0 h-full w-full p-6 overflow-auto bg-secondary-background"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          {afterContent}
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-primary-cta cursor-ew-resize z-20"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary-cta flex items-center justify-center shadow-lg">
            <ArrowLeft className="absolute right-full mr-1 text-primary-cta w-4 h-4" />
            <ArrowRight className="absolute left-full ml-1 text-primary-cta w-4 h-4" />
          </div>
        </div>

        {/* Instructions Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-secondary-text bg-hover-active bg-opacity-70 px-3 py-1 rounded-full z-20 whitespace-nowrap">
          Drag to compare
        </div>
      </div>
    </motion.div>
  );
};

export default ComparisonSlider;
