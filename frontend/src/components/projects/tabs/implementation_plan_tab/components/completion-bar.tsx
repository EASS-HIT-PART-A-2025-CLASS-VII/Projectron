"use client";

import { CheckCircle } from "lucide-react";

interface CompletionBarProps {
  completionPercentage: number;
}

export function CompletionBar({ completionPercentage }: CompletionBarProps) {
  // Ensure percentage is between 0-100
  const percentage = Math.min(Math.max(0, completionPercentage), 100);

  return (
    <div className="bg-transparent mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary-cta opacity-80" />
          Implementation Progress
        </h2>
        <span className="font-semibold text-xl">{percentage.toFixed(0)}%</span>
      </div>

      <div className="w-full bg-secondary-background h-2 rounded-full overflow-hidden backdrop-blur-sm">
        <div
          className={`h-full rounded-full ${
            percentage === 100
              ? "bg-green-500/70"
              : percentage > 0
              ? "bg-primary-cta"
              : ""
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
