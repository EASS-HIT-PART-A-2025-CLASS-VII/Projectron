"use client";

import { Link2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Relationship } from "../types";
import { relationshipTypeColors } from "../constants";

interface RelationshipBadgeProps {
  relationship: Relationship;
  entityName: string;
  onDelete?: (relationship: Relationship) => void;
}

export function RelationshipBadge({
  relationship,
  entityName,
  onDelete,
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
    <div className="flex items-center gap-1.5 mb-1.5 group">
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
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(relationship);
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
