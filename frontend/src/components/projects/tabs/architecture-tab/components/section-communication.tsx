"use client";

import { motion } from "framer-motion";
import {
  Network,
  Plus,
  Trash2,
  ArrowRight,
  Server,
  Database,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TechnicalArchitecture } from "../types";

interface CommunicationSectionProps {
  architecture: TechnicalArchitecture;
  isEditing: boolean;
  updateCommunicationPattern: (
    index: number,
    field: string,
    value: any
  ) => void;
  addCommunicationPattern: () => void;
  deleteCommunicationPattern: (index: number) => void;
}

export function CommunicationSection({
  architecture,
  isEditing,
  updateCommunicationPattern,
  addCommunicationPattern,
  deleteCommunicationPattern,
}: CommunicationSectionProps) {
  return (
    <motion.div
      key="communication"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-divider bg-secondary-background overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <Network className="h-6 w-6 text-primary-cta" />
              <h3 className="text-xl font-semibold">Communication Patterns</h3>
            </div>

            {/* Add Communication Pattern Button */}
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={addCommunicationPattern}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Pattern
              </Button>
            )}
          </div>

          {architecture.communication_patterns &&
          architecture.communication_patterns.length > 0 ? (
            <div className="space-y-4">
              {architecture.communication_patterns.map((pattern, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="p-4 border border-divider rounded-lg bg-primary-background relative"
                >
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-7 w-7 p-0 hover:text-red-400"
                      onClick={() => deleteCommunicationPattern(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-secondary-text" />
                    </Button>
                  )}

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 p-2 bg-secondary-background rounded-md border border-divider min-w-32 justify-center">
                      {isEditing ? (
                        <Input
                          value={pattern.source}
                          onChange={(e) =>
                            updateCommunicationPattern(
                              index,
                              "source",
                              e.target.value
                            )
                          }
                          className="h-7 bg-hover-active/20"
                        />
                      ) : (
                        <>
                          <Server className="h-4 w-4 text-primary-cta" />
                          <span className="font-medium">{pattern.source}</span>
                        </>
                      )}
                    </div>

                    <div className="flex flex-col items-center gap-1 py-2">
                      <ArrowRight className="h-5 w-5 text-primary-cta" />
                      <div className="flex gap-1">
                        {isEditing ? (
                          <>
                            <Input
                              value={pattern.protocol}
                              onChange={(e) =>
                                updateCommunicationPattern(
                                  index,
                                  "protocol",
                                  e.target.value
                                )
                              }
                              className="h-7 w-24 bg-hover-active/20"
                            />
                            <Input
                              value={pattern.pattern}
                              onChange={(e) =>
                                updateCommunicationPattern(
                                  index,
                                  "pattern",
                                  e.target.value
                                )
                              }
                              className="h-7 w-32 bg-hover-active/20"
                            />
                          </>
                        ) : (
                          <>
                            <Badge
                              variant="outline"
                              className="bg-blue-600/10 text-blue-400 border-blue-400/30"
                            >
                              {pattern.protocol}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-violet-600/10 text-violet-400 border-violet-400/30"
                            >
                              {pattern.pattern}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-secondary-background rounded-md border border-divider min-w-32 justify-center">
                      {isEditing ? (
                        <Input
                          value={pattern.target}
                          onChange={(e) =>
                            updateCommunicationPattern(
                              index,
                              "target",
                              e.target.value
                            )
                          }
                          className="h-7 bg-hover-active/20"
                        />
                      ) : (
                        <>
                          <Database className="h-4 w-4 text-amber-400" />
                          <span className="font-medium">{pattern.target}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-hover-active/20 rounded-md text-sm text-secondary-text">
                    {isEditing ? (
                      <Textarea
                        value={pattern.description}
                        onChange={(e) =>
                          updateCommunicationPattern(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Enter pattern description"
                        rows={2}
                        className="resize-none bg-primary-background"
                      />
                    ) : (
                      pattern.description
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-4 border border-divider rounded-lg bg-primary-background">
              <p className="text-secondary-text">
                No communication patterns defined
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
