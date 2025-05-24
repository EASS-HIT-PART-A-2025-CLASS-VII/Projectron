"use client";

import { useRouter } from "next/navigation";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContextFABProps {
  projectId: string;
}

export function ContextFAB({ projectId }: ContextFABProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/projects/${projectId}/context`);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary-cta hover:bg-cta-hover text-black shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 animate-pulse-glow"
            size="icon"
          >
            <Bot className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          className="bg-secondary-background border-divider"
        >
          <p className="text-sm font-medium">Generate AI Context</p>
          <p className="text-xs text-secondary-text">
            Create development context for AI assistants
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
