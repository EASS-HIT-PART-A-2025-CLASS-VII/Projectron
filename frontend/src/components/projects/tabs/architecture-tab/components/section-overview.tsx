"use client";

import { motion } from "framer-motion";
import {
  Boxes,
  CodeSquare,
  Component,
  GitMerge,
  Network,
  Cloud,
  ArrowRight,
  Server,
  Globe,
  Settings,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TechnicalArchitecture } from "../types";

interface OverviewSectionProps {
  architecture: TechnicalArchitecture;
  isEditing: boolean;
  updateOverview: (value: string) => void;
  updateDiagramDescription: (value: string) => void;
  setSelectedSection: (section: string) => void;
}

export function OverviewSection({
  architecture,
  isEditing,
  updateOverview,
  updateDiagramDescription,
  setSelectedSection,
}: OverviewSectionProps) {
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Architecture Overview Card */}
      <Card className="border border-divider bg-secondary-background overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Boxes className="h-6 w-6 text-primary-cta" />
              <h3 className="text-xl font-semibold">System Architecture</h3>
            </div>

            {/* Clear button (only shown in edit mode) */}
            {isEditing && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => updateOverview("")}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>

          <div className="p-4 border border-divider rounded-lg bg-primary-background">
            {isEditing ? (
              <Textarea
                value={architecture.architecture_overview || ""}
                onChange={(e) => updateOverview(e.target.value)}
                placeholder="Enter architecture overview"
                rows={5}
                className="resize-none bg-hover-active/20"
              />
            ) : (
              <p className="text-primary-text">
                {architecture.architecture_overview || "No overview available"}
              </p>
            )}
          </div>

          {/* Architecture Diagram Description */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CodeSquare className="h-5 w-5 text-primary-cta" />
                <h4 className="text-lg font-medium">Architecture Diagram</h4>
              </div>

              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => updateDiagramDescription("")}
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="bg-secondary-background border border-divider p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Badge
                  variant="outline"
                  className="bg-hover-active/30 border-primary-cta text-primary-text"
                >
                  Diagram
                </Badge>
              </div>

              {isEditing ? (
                <Textarea
                  value={architecture.architecture_diagram_description || ""}
                  onChange={(e) => updateDiagramDescription(e.target.value)}
                  placeholder="Enter diagram description"
                  rows={3}
                  className="resize-none bg-primary-background"
                />
              ) : (
                <p className="text-secondary-text">
                  {architecture.architecture_diagram_description ||
                    "No diagram description available"}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Architecture Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Components Summary */}
        <Card className="border border-divider bg-secondary-background overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Component className="h-5 w-5 text-primary-cta" />
              <h3 className="text-lg font-semibold">System Components</h3>
            </div>

            <div className="mb-4">
              {architecture.system_components &&
              architecture.system_components.length > 0 ? (
                <div className="space-y-1">
                  {architecture.system_components
                    .slice(0, 3)
                    .map((component, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-cta"></div>
                        <span className="text-sm font-medium">
                          {component.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-hover-active/20 text-secondary-text text-xs"
                        >
                          {component.type}
                        </Badge>
                      </div>
                    ))}
                  {architecture.system_components.length > 3 && (
                    <p className="text-xs text-secondary-text pl-3.5">
                      +{architecture.system_components.length - 3} more
                      components
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-secondary-text text-sm">
                  No components defined
                </p>
              )}
            </div>

            <button
              className="text-sm text-primary-cta hover:text-primary-cta/80 flex items-center gap-1"
              onClick={() => setSelectedSection("components")}
            >
              View details <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </Card>

        {/* Patterns Summary */}
        <Card className="border border-divider bg-secondary-background overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <GitMerge className="h-5 w-5 text-primary-cta" />
              <h3 className="text-lg font-semibold">Architecture Patterns</h3>
            </div>

            <div className="mb-4">
              {architecture.architecture_patterns &&
              architecture.architecture_patterns.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {architecture.architecture_patterns
                    .slice(0, 3)
                    .map((pattern, i) => (
                      <Badge
                        key={i}
                        className="bg-primary-background border-divider"
                      >
                        {pattern.name}
                      </Badge>
                    ))}
                  {architecture.architecture_patterns.length > 3 && (
                    <Badge className="bg-primary-background border-divider">
                      +{architecture.architecture_patterns.length - 3} more
                    </Badge>
                  )}
                </div>
              ) : (
                <p className="text-secondary-text text-sm">
                  No patterns defined
                </p>
              )}
            </div>

            <button
              className="text-sm text-primary-cta hover:text-primary-cta/80 flex items-center gap-1"
              onClick={() => setSelectedSection("patterns")}
            >
              View details <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </Card>
      </div>

      {/* Communication & Infrastructure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Communications Summary */}
        <Card className="border border-divider bg-secondary-background overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Network className="h-5 w-5 text-primary-cta" />
              <h3 className="text-lg font-semibold">Communication Patterns</h3>
            </div>

            <div className="mb-4">
              {architecture.communication_patterns &&
              architecture.communication_patterns.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium">
                        {architecture.communication_patterns.length}
                      </span>
                    </div>
                    <p className="text-sm">
                      {architecture.communication_patterns.length === 1
                        ? "1 communication pattern defined"
                        : `${architecture.communication_patterns.length} communication patterns defined`}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-secondary-text text-sm">
                  No communication patterns defined
                </p>
              )}
            </div>

            <button
              className="text-sm text-primary-cta hover:text-primary-cta/80 flex items-center gap-1"
              onClick={() => setSelectedSection("communication")}
            >
              View details <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </Card>

        {/* Infrastructure Summary */}
        <Card className="border border-divider bg-secondary-background overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Cloud className="h-5 w-5 text-primary-cta" />
              <h3 className="text-lg font-semibold">Infrastructure</h3>
            </div>

            <div className="mb-4">
              {architecture.infrastructure &&
              Object.keys(architecture.infrastructure).length > 0 ? (
                <div className="space-y-1">
                  {architecture.infrastructure.hosting && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-secondary-text" />
                      <span className="text-sm font-medium">Hosting:</span>
                      <span className="text-sm truncate">
                        {architecture.infrastructure.hosting.length > 30
                          ? architecture.infrastructure.hosting.substring(
                              0,
                              30
                            ) + "..."
                          : architecture.infrastructure.hosting}
                      </span>
                    </div>
                  )}

                  {architecture.infrastructure.services && (
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-secondary-text" />
                      <span className="text-sm font-medium">Services:</span>
                      <span className="text-sm">
                        {architecture.infrastructure.services.length} defined
                      </span>
                    </div>
                  )}

                  {architecture.infrastructure.ci_cd && (
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-secondary-text" />
                      <span className="text-sm font-medium">
                        CI/CD Pipeline:
                      </span>
                      <span className="text-sm">Defined</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-secondary-text text-sm">
                  No infrastructure details defined
                </p>
              )}
            </div>

            <button
              className="text-sm text-primary-cta hover:text-primary-cta/80 flex items-center gap-1"
              onClick={() => setSelectedSection("infrastructure")}
            >
              View details <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
