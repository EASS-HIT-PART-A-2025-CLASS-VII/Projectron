"use client";

import { Project } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
// Using custom divider instead of Separator component
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Target,
  Layers,
  Lightbulb,
  BarChart,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HighLevelPlanTabProps {
  project: Project;
}

export function HighLevelPlanTab({ project }: HighLevelPlanTabProps) {
  const plan = project.high_level_plan;

  // If plan is not available yet
  if (!plan || Object.keys(plan).length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <AlertTriangle className="h-12 w-12 text-secondary-text" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          High-Level Plan Not Available
        </h3>
        <p className="text-secondary-text max-w-md mx-auto">
          This project doesn't have a high-level plan defined yet. You can
          generate one from the Plan Generation page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Vision Section */}
      <Card className="border border-divider bg-secondary-background">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-primary-cta" />
            <CardTitle className="text-xl">Project Vision</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-primary-text">
            {plan.vision || "No vision statement available"}
          </p>

          {/* Business Objectives */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <BarChart className="h-4 w-4 text-secondary-text" />
              Business Objectives
            </h4>
            {plan.business_objectives && plan.business_objectives.length > 0 ? (
              <ul className="pl-6 space-y-1 list-disc marker:text-primary-cta">
                {plan.business_objectives.map((objective: any, index: any) => (
                  <li key={index} className="text-primary-text">
                    {objective}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-secondary-text">
                No business objectives defined
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Target Users Section */}
      <TargetUsersSection targetUsers={plan.target_users || []} />

      {/* Core Features */}
      <Card className="border border-divider bg-secondary-background">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <Layers className="h-5 w-5 text-primary-cta" />
            <CardTitle className="text-xl">Core Features</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {plan.core_features && plan.core_features.length > 0 ? (
            <ul className="pl-6 space-y-1 list-disc marker:text-primary-cta">
              {plan.core_features.map((feature: any, index: any) => (
                <li key={index} className="text-primary-text">
                  {feature}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-secondary-text">No core features defined</p>
          )}
        </CardContent>
      </Card>

      {/* Project Scope */}
      <ScopeSection scope={plan.scope || { in_scope: [], out_of_scope: [] }} />

      {/* Project Details Section */}
      <Card className="border border-divider bg-secondary-background">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-primary-cta" />
            <CardTitle className="text-xl">Project Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Success Criteria */}
          <ExpandableSection
            title="Success Criteria"
            items={plan.success_criteria || []}
            defaultOpen={true}
          />

          {/* Constraints */}
          <ExpandableSection
            title="Constraints"
            items={plan.constraints || []}
          />

          {/* Assumptions */}
          <ExpandableSection
            title="Assumptions"
            items={plan.assumptions || []}
          />

          {/* Tech Stack */}
          {plan.tech_stack && plan.tech_stack.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-3">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {plan.tech_stack.map((tech: any, index: any) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-secondary-background border-divider"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Risks */}
      <RisksSection risks={plan.risks || []} />
    </div>
  );
}

// Target Users Section Component
function TargetUsersSection({ targetUsers }: { targetUsers: any[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default

  const toggleUser = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!targetUsers || targetUsers.length === 0) {
    return (
      <Card className="border border-divider bg-secondary-background">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary-cta" />
            <CardTitle className="text-xl">Target Users</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-secondary-text">No target users defined</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-divider bg-secondary-background">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary-cta" />
          <CardTitle className="text-xl">Target Users</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {targetUsers.map((user, index) => (
          <Collapsible
            key={index}
            open={openIndex === index}
            onOpenChange={() => toggleUser(index)}
            className="border border-divider rounded-md overflow-hidden"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-hover-active text-left">
              <span className="font-medium">{user.type}</span>
              {openIndex === index ? (
                <ChevronDown className="h-5 w-5 text-secondary-text" />
              ) : (
                <ChevronRight className="h-5 w-5 text-secondary-text" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 border-t border-divider bg-primary-background">
              <div className="space-y-4">
                {/* Needs */}
                <div>
                  <h5 className="text-sm uppercase text-secondary-text mb-1">
                    Needs
                  </h5>
                  <ul className="pl-5 space-y-1 list-disc marker:text-primary-cta">
                    {user.needs && user.needs.length > 0 ? (
                      user.needs.map((need: string, i: number) => (
                        <li key={i} className="text-primary-text">
                          {need}
                        </li>
                      ))
                    ) : (
                      <li className="text-secondary-text">
                        No specific needs defined
                      </li>
                    )}
                  </ul>
                </div>

                {/* Pain Points */}
                <div>
                  <h5 className="text-sm uppercase text-secondary-text mb-1">
                    Pain Points
                  </h5>
                  <ul className="pl-5 space-y-1 list-disc marker:text-primary-cta">
                    {user.pain_points && user.pain_points.length > 0 ? (
                      user.pain_points.map((point: string, i: number) => (
                        <li key={i} className="text-primary-text">
                          {point}
                        </li>
                      ))
                    ) : (
                      <li className="text-secondary-text">
                        No pain points identified
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}

// Scope Section Component
function ScopeSection({
  scope,
}: {
  scope: { in_scope: string[]; out_of_scope: string[] };
}) {
  return (
    <Card className="border border-divider bg-secondary-background">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary-cta" />
          <CardTitle className="text-xl">Project Scope</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* In Scope */}
          <div>
            <h4 className="text-lg font-semibold mb-3 after:content-[''] after:block after:w-16 after:h-1 after:bg-gradient-cta after:mt-1">
              In Scope
            </h4>
            {scope.in_scope && scope.in_scope.length > 0 ? (
              <ul className="pl-6 space-y-1 list-disc marker:text-primary-cta">
                {scope.in_scope.map((item, index) => (
                  <li key={index} className="text-primary-text">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-secondary-text">No in-scope items defined</p>
            )}
          </div>

          {/* Out of Scope */}
          <div>
            <h4 className="text-lg font-semibold mb-3 after:content-[''] after:block after:w-16 after:h-1 after:bg-gradient-cta after:mt-1">
              Out of Scope
            </h4>
            {scope.out_of_scope && scope.out_of_scope.length > 0 ? (
              <ul className="pl-6 space-y-1 list-disc marker:text-primary-cta">
                {scope.out_of_scope.map((item, index) => (
                  <li key={index} className="text-primary-text">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-secondary-text">
                No out-of-scope items defined
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Expandable Section Component
function ExpandableSection({
  title,
  items,
  defaultOpen = false,
}: {
  title: string;
  items: string[];
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-semibold">{title}</h4>
          <CollapsibleTrigger className="hover:bg-hover-active rounded-full p-1">
            {isOpen ? (
              <ChevronDown className="h-5 w-5 text-secondary-text" />
            ) : (
              <ChevronRight className="h-5 w-5 text-secondary-text" />
            )}
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <ul className="pl-6 space-y-1 list-disc marker:text-primary-cta">
            {items.map((item, index) => (
              <li key={index} className="text-primary-text">
                {item}
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
      <div className="h-px w-full my-4 bg-divider" />
    </div>
  );
}

// Risks Section Component
function RisksSection({ risks }: { risks: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!risks || risks.length === 0) {
    return null;
  }

  return (
    <Card className="border border-divider bg-secondary-background">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-primary-cta" />
              <CardTitle className="text-xl">Project Risks</CardTitle>
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
          <CardContent className="pt-2">
            <div className="divide-y divide-divider">
              {risks.map((risk, index) => (
                <div key={index} className={cn("py-4", index === 0 && "pt-0")}>
                  <h4 className="font-medium mb-2">{risk.description}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-secondary-text mb-1">Impact:</p>
                      <p>{risk.impact}</p>
                    </div>
                    <div>
                      <p className="text-secondary-text mb-1">Mitigation:</p>
                      <p>{risk.mitigation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
