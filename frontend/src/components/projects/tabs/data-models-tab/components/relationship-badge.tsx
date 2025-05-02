"use client";

import { Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { Relationship } from "../types";
import { relationshipTypeColors } from "../constants";

interface RelationshipBadgeProps {
  relationship: Relationship;
  entityName: string;
}

export function RelationshipBadge({
  relationship,
  entityName,
}: RelationshipBadgeProps) {
  const isSource = relationship.source_entity === entityName;
  const otherEntity = isSource
    ? relationship.target_entity
    : relationship.source_entity;
  const relColor =
    relationship.type in relationshipTypeColors
      ? relationshipTypeColors[relationship.type]
      : relationshipTypeColors.default;

  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <Badge
        variant="outline"
        className={`bg-transparent ${relColor} whitespace-nowrap`}
      >
        {relationship.type}
      </Badge>
      <Link2 className="h-3 w-3 text-secondary-text" />
      <span className="text-xs text-secondary-text truncate">
        {otherEntity}
      </span>
    </div>
  );
}
