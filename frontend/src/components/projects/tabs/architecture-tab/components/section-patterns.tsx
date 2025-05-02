"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GitMerge,
  CodeSquare,
  ChevronRight,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TechnicalArchitecture } from "../types";

interface PatternsSectionProps {
  architecture: TechnicalArchitecture;
  isEditing: boolean;
  updateArchitecturePattern: (index: number, field: string, value: any) => void;
  addArchitecturePattern: () => void;
  deleteArchitecturePattern: (index: number) => void;
}

export function PatternsSection({
  architecture,
  isEditing,
  updateArchitecturePattern,
  addArchitecturePattern,
  deleteArchitecturePattern,
}: PatternsSectionProps) {
  return (
    <motion.div
      key="patterns"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-divider bg-secondary-background overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <GitMerge className="h-6 w-6 text-primary-cta" />
              <h3 className="text-xl font-semibold">Architecture Patterns</h3>
            </div>

            {/* Add Architecture Pattern Button */}
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={addArchitecturePattern}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Pattern
              </Button>
            )}
          </div>

          {architecture.architecture_patterns &&
          architecture.architecture_patterns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {architecture.architecture_patterns.map((pattern, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="relative"
                >
                  <Collapsible>
                    <Card className="border border-divider bg-primary-background overflow-hidden h-full">
                      <CollapsibleTrigger asChild>
                        <div className="w-full text-left p-4 hover:bg-hover-active flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-cta/20 text-primary-cta flex items-center justify-center flex-shrink-0">
                              <CodeSquare className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{pattern.name}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 hover:text-red-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteArchitecturePattern(index);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-secondary-text" />
                              </Button>
                            )}
                            <ChevronRight className="h-5 w-5 text-secondary-text transition-transform duration-200 ui-state-open:rotate-90" />
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        {isEditing ? (
                          <div className="p-4 border-t border-divider space-y-3">
                            <div>
                              <Label className="text-xs mb-1 text-secondary-text">
                                Pattern Name
                              </Label>
                              <Input
                                value={pattern.name}
                                onChange={(e) =>
                                  updateArchitecturePattern(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="bg-hover-active/20"
                              />
                            </div>
                            <div>
                              <Label className="text-xs mb-1 text-secondary-text">
                                Description
                              </Label>
                              <Textarea
                                value={pattern.description}
                                onChange={(e) =>
                                  updateArchitecturePattern(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter pattern description"
                                rows={3}
                                className="resize-none bg-hover-active/20"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 border-t border-divider">
                            <p className="text-primary-text">
                              {pattern.description}
                            </p>
                          </div>
                        )}
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-4 border border-divider rounded-lg bg-primary-background">
              <p className="text-secondary-text">
                No architecture patterns defined
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
