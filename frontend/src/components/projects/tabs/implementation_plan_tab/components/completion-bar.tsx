"use client";

interface CompletionBarProps {
  completionPercentage: number;
}

export function CompletionBar({ completionPercentage }: CompletionBarProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">Implementation Plan</h2>
        <span className="text-sm text-secondary-text">
          {completionPercentage.toFixed(0)}% Complete
        </span>
      </div>
      <div className="w-full bg-primary-background h-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            completionPercentage === 100
              ? "bg-green-500"
              : completionPercentage > 0
              ? "bg-primary-cta"
              : "bg-transparent"
          }`}
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
    </div>
  );
}
