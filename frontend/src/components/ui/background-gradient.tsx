"use client";

import React from "react";

interface BackgroundGradientProps {
  color?: string;
  opacity?: number;
}

// Simplified static gradient without animations
const BackgroundGradient = React.memo(
  ({ color = "var(--primary)", opacity = 0.07 }: BackgroundGradientProps) => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Static gradients instead of animated ones */}
        <div
          className="absolute w-full h-full rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle at 30% 50%, ${color} 0%, transparent 70%)`,
            opacity: opacity,
            top: "-50%",
            left: "-20%",
            width: "100%",
            height: "200%",
          }}
        />
      </div>
    );
  }
);

BackgroundGradient.displayName = "BackgroundGradient";

export default BackgroundGradient;
