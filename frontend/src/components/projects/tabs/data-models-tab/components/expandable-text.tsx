"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
}

export function ExpandableText({ text, maxLength = 80 }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);

  if (!text || text.length <= maxLength) {
    return <span>{text}</span>;
  }

  return (
    <span>
      {expanded ? text : text.slice(0, maxLength)}
      <Button
        variant="link"
        size="sm"
        className="px-1 h-auto text-primary-cta"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "...less" : "...more"}
      </Button>
    </span>
  );
}
