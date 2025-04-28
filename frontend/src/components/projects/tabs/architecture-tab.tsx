"use client";

import { Project } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Layers,
  Server,
  Component,
  GitMerge,
  Network,
  Cloud,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ArchitectureTabProps {
  project: Project;
}

export function ArchitectureTab({ project }: ArchitectureTabProps) {
  const architecture = project.technical_architecture;

  // If architecture is not available yet
  if (!architecture || Object.keys(architecture).length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <AlertTriangle className="h-12 w-12 text-secondary-text" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          Technical Architecture Not Available
        </h3>
        <p className="text-secondary-text max-w-md mx-auto">
          This project doesn't have a technical architecture defined yet. You
          can generate one from the Plan Generation page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Architecture Overview */}
      <Card className="border border-divider bg-secondary-background">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <Layers className="h-5 w-5 text-primary-cta" />
            <CardTitle className="text-xl">Architecture Overview</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-primary-text mb-4">
            {architecture.architecture_overview || "No overview available"}
          </p>

          {architecture.architecture_diagram_description && (
            <div className="mt-4 p-4 border border-divider rounded-lg bg-primary-background">
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <GitMerge className="h-4 w-4 text-secondary-text" />
                Architecture Diagram
              </h4>
              <p className="text-secondary-text">
                {architecture.architecture_diagram_description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Components */}
      <SystemComponentsSection
        components={architecture.system_components || []}
      />

      {/* Communication Patterns */}
      <CommunicationPatternsSection
        patterns={architecture.communication_patterns || []}
      />

      {/* Architecture Patterns */}
      <ArchitecturePatternsSection
        patterns={architecture.architecture_patterns || []}
      />

      {/* Infrastructure */}
      <InfrastructureSection
        infrastructure={architecture.infrastructure || {}}
      />
    </div>
  );
}

// System Components Section Component
function SystemComponentsSection({ components }: { components: any[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default

  const toggleComponent = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!components || components.length === 0) {
    return (
      <Card className="border border-divider bg-secondary-background">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <Component className="h-5 w-5 text-primary-cta" />
            <CardTitle className="text-xl">System Components</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-secondary-text">No system components defined</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-divider bg-secondary-background">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <Component className="h-5 w-5 text-primary-cta" />
          <CardTitle className="text-xl">System Components</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {components.map((component, index) => (
          <Collapsible
            key={index}
            open={openIndex === index}
            onOpenChange={() => toggleComponent(index)}
            className="border border-divider rounded-md overflow-hidden"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-hover-active text-left">
              <div className="flex items-center gap-2">
                <span className="font-medium">{component.name}</span>
                <Badge
                  variant="outline"
                  className="bg-hover-active/20 text-secondary-text"
                >
                  {component.type}
                </Badge>
              </div>
              {openIndex === index ? (
                <ChevronDown className="h-5 w-5 text-secondary-text" />
              ) : (
                <ChevronRight className="h-5 w-5 text-secondary-text" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 border-t border-divider bg-primary-background">
              <div className="space-y-4">
                <p className="text-primary-text">{component.description}</p>

                {/* Technologies */}
                {component.technologies &&
                  component.technologies.length > 0 && (
                    <div>
                      <h5 className="text-sm uppercase text-secondary-text mb-2">
                        Technologies
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {component.technologies.map(
                          (tech: string, i: number) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="bg-secondary-background border-divider"
                            >
                              {tech}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Responsibilities */}
                {component.responsibilities &&
                  component.responsibilities.length > 0 && (
                    <div>
                      <h5 className="text-sm uppercase text-secondary-text mb-2">
                        Responsibilities
                      </h5>
                      <ul className="pl-5 space-y-1 list-disc marker:text-primary-cta">
                        {component.responsibilities.map(
                          (resp: string, i: number) => (
                            <li key={i} className="text-primary-text">
                              {resp}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}

// Communication Patterns Section Component
function CommunicationPatternsSection({ patterns }: { patterns: any[] }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!patterns || patterns.length === 0) {
    return (
      <Card className="border border-divider bg-secondary-background">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <Network className="h-5 w-5 text-primary-cta" />
            <CardTitle className="text-xl">Communication Patterns</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-secondary-text">
            No communication patterns defined
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-divider bg-secondary-background">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Network className="h-5 w-5 text-primary-cta" />
              <CardTitle className="text-xl">Communication Patterns</CardTitle>
            </div>
            <CollapsibleTrigger className="hover:bg-hover-active rounded-full p-1">
              {isOpen ? (
                <ChevronDown className="h-5 w-5 text-secondary-text" />
              ) : (
                <ChevronRight className="h-5 w-5 text-secondary-text" />
              )}
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="space-y-4">
              {patterns.map((pattern, index) => (
                <div
                  key={index}
                  className="p-4 border border-divider rounded-lg bg-primary-background"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                    <div className="px-3 py-1.5 rounded-md bg-secondary-background border border-divider">
                      {pattern.source}
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-secondary-text" />
                      <Badge
                        variant="outline"
                        className="bg-hover-active/20 border-divider"
                      >
                        {pattern.protocol}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-hover-active/20 border-divider"
                      >
                        {pattern.pattern}
                      </Badge>
                    </div>
                    <div className="px-3 py-1.5 rounded-md bg-secondary-background border border-divider">
                      {pattern.target}
                    </div>
                  </div>
                  <p className="text-secondary-text text-sm">
                    {pattern.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Architecture Patterns Section Component
function ArchitecturePatternsSection({ patterns }: { patterns: any[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const togglePattern = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!patterns || patterns.length === 0) {
    return (
      <Card className="border border-divider bg-secondary-background">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <GitMerge className="h-5 w-5 text-primary-cta" />
            <CardTitle className="text-xl">Architecture Patterns</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-secondary-text">
            No architecture patterns defined
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-divider bg-secondary-background">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <GitMerge className="h-5 w-5 text-primary-cta" />
          <CardTitle className="text-xl">Architecture Patterns</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {patterns.map((pattern, index) => (
          <Collapsible
            key={index}
            open={openIndex === index}
            onOpenChange={() => togglePattern(index)}
            className="border border-divider rounded-md overflow-hidden"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-hover-active text-left">
              <span className="font-medium">{pattern.name}</span>
              {openIndex === index ? (
                <ChevronDown className="h-5 w-5 text-secondary-text" />
              ) : (
                <ChevronRight className="h-5 w-5 text-secondary-text" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 border-t border-divider bg-primary-background">
              <p className="text-primary-text">{pattern.description}</p>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}

// Infrastructure Section Component
function InfrastructureSection({ infrastructure }: { infrastructure: any }) {
  if (!infrastructure || Object.keys(infrastructure).length === 0) {
    return (
      <Card className="border border-divider bg-secondary-background">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <Cloud className="h-5 w-5 text-primary-cta" />
            <CardTitle className="text-xl">Infrastructure</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-secondary-text">
            No infrastructure details defined
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-divider bg-secondary-background">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <Cloud className="h-5 w-5 text-primary-cta" />
          <CardTitle className="text-xl">Infrastructure</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Hosting */}
          <div>
            <h4 className="text-lg font-semibold mb-3 after:content-[''] after:block after:w-16 after:h-1 after:bg-gradient-cta after:mt-1">
              Hosting
            </h4>
            <p className="text-primary-text bg-primary-background p-3 rounded-md border border-divider">
              {infrastructure.hosting}
            </p>
          </div>

          {/* Services */}
          {infrastructure.services && infrastructure.services.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-3 after:content-[''] after:block after:w-16 after:h-1 after:bg-gradient-cta after:mt-1">
                Services
              </h4>
              <ul className="pl-6 space-y-1 list-disc marker:text-primary-cta">
                {infrastructure.services.map(
                  (service: string, index: number) => (
                    <li key={index} className="text-primary-text">
                      {service}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {/* CI/CD */}
          {infrastructure.ci_cd && (
            <div>
              <h4 className="text-lg font-semibold mb-3 after:content-[''] after:block after:w-16 after:h-1 after:bg-gradient-cta after:mt-1">
                CI/CD Pipeline
              </h4>
              <p className="text-primary-text bg-primary-background p-3 rounded-md border border-divider">
                {infrastructure.ci_cd}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
