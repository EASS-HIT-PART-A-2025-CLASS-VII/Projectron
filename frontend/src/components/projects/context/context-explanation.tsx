"use client";

import { Bot, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ContextExplanation() {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-3">
        <div className="flex gap-4 items-center justify-center">
          <Bot className="w-8 h-8 text-primary-cta gradient-icon" />

          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-primary-text">
              AI Context Generator
            </h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-5 h-5 text-secondary-text hover:text-primary-text cursor-help transition-colors" />
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-secondary-background border-divider max-w-xs"
                >
                  <p className="text-sm">
                    We will gather all the needed information from your project
                    plan to create an extremely detailed context prompt.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <p className="text-lg text-secondary-text max-w-2xl mx-auto">
          Ever spent more time explaining your project to ChatGPT than actually
          coding? We've all been there. Say goodbye to context fatigue.
        </p>
      </div>
    </div>
  );
}
