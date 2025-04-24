"use client";

import React from "react";
import { motion, useScroll } from "framer-motion";

interface TimelineProgressProps {
  numberOfItems: number;
}

// Optimized version with fewer animations
const TimelineProgress = React.memo(
  ({ numberOfItems }: TimelineProgressProps) => {
    const progressRef = React.useRef<HTMLDivElement>(null);

    // Track scroll progress for the component
    const { scrollYProgress } = useScroll({
      target: progressRef,
      offset: ["start end", "end start"],
    });

    // Create array of positions for dots
    const positions = Array.from({ length: numberOfItems }, (_, i) => i);

    return (
      <div
        ref={progressRef}
        className="fixed right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-6"
      >
        <div className="relative h-48 w-1 bg-divider rounded-full overflow-hidden">
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-primary-cta"
            style={{
              scaleY: scrollYProgress,
              originY: 1,
            }}
          />
        </div>

        <div className="flex flex-col gap-6">
          {positions.map((pos) => (
            <div
              key={pos}
              className="w-3 h-3 rounded-full border border-primary-cta bg-hover-active"
            />
          ))}
        </div>
      </div>
    );
  }
);

TimelineProgress.displayName = "TimelineProgress";

export default TimelineProgress;
