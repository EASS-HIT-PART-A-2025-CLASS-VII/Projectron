"use client";

import { motion } from "framer-motion";
import {
  Lightbulb,
  Zap,
  UserCircle2,
  Target,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OverviewSectionProps } from "../types";

export function OverviewSection({
  plan,
  setSelectedSection,
}: OverviewSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Vision & Objectives */}
      <Card className="border border-divider bg-secondary-background overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-primary-cta" />
            <h3 className="text-lg font-semibold">Vision & Objectives</h3>
          </div>

          <div className="mb-4">
            <p className="text-primary-text text-sm mb-3">
              {plan.vision && plan.vision.length > 100
                ? `${plan.vision.substring(0, 100)}...`
                : plan.vision || "No vision statement available"}
            </p>

            {plan.business_objectives &&
              plan.business_objectives.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {plan.business_objectives
                    .slice(0, 2)
                    .map((obj: string, i: number) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="bg-hover-active border-divider"
                      >
                        {obj.length > 40 ? `${obj.substring(0, 40)}...` : obj}
                      </Badge>
                    ))}
                  {plan.business_objectives.length > 2 && (
                    <Badge
                      variant="outline"
                      className="bg-hover-active border-divider"
                    >
                      +{plan.business_objectives.length - 2} more
                    </Badge>
                  )}
                </div>
              )}
          </div>

          <button
            className="text-sm text-primary-cta hover:text-primary-cta/80 flex items-center gap-1"
            onClick={() => setSelectedSection("vision")}
          >
            View details <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </Card>

      {/* Users & Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Users Summary */}
        <Card className="border border-divider bg-secondary-background overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <UserCircle2 className="h-5 w-5 text-primary-cta" />
              <h3 className="text-lg font-semibold">Target Users</h3>
            </div>

            <div className="mb-4">
              {plan.target_users && plan.target_users.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {plan.target_users.map((user: any, i: number) => (
                    <Badge
                      key={i}
                      className="bg-hover-active border-0 text-primary-text"
                    >
                      {user.type}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-secondary-text text-sm">
                  No target users defined
                </p>
              )}
            </div>

            <button
              className="text-sm text-primary-cta hover:text-primary-cta/80 flex items-center gap-1"
              onClick={() => setSelectedSection("users")}
            >
              View details <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </Card>

        {/* Features Summary */}
        <Card className="border border-divider bg-secondary-background overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-primary-cta" />
              <h3 className="text-lg font-semibold">Core Features</h3>
            </div>

            <div className="mb-4">
              {plan.core_features && plan.core_features.length > 0 ? (
                <div className="space-y-1">
                  {plan.core_features
                    .slice(0, 3)
                    .map((feature: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-cta"></div>
                        <p className="text-sm truncate">{feature}</p>
                      </div>
                    ))}
                  {plan.core_features.length > 3 && (
                    <p className="text-xs text-secondary-text pl-3.5">
                      +{plan.core_features.length - 3} more features
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-secondary-text text-sm">
                  No core features defined
                </p>
              )}
            </div>

            <button
              className="text-sm text-primary-cta hover:text-primary-cta/80 flex items-center gap-1"
              onClick={() => setSelectedSection("features")}
            >
              View details <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </Card>
      </div>

      {/* Scope & Success */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scope Summary */}
        <Card className="border border-divider bg-secondary-background overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-primary-cta" />
              <h3 className="text-lg font-semibold">Project Scope</h3>
            </div>

            <div className="mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs uppercase text-secondary-text mb-1">
                    In Scope
                  </p>
                  <p className="text-sm">
                    {plan.scope &&
                    plan.scope.in_scope &&
                    plan.scope.in_scope.length > 0
                      ? `${plan.scope.in_scope.length} items defined`
                      : "No items defined"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-secondary-text mb-1">
                    Out of Scope
                  </p>
                  <p className="text-sm">
                    {plan.scope &&
                    plan.scope.out_of_scope &&
                    plan.scope.out_of_scope.length > 0
                      ? `${plan.scope.out_of_scope.length} items defined`
                      : "No items defined"}
                  </p>
                </div>
              </div>
            </div>

            <button
              className="text-sm text-primary-cta hover:text-primary-cta/80 flex items-center gap-1"
              onClick={() => setSelectedSection("scope")}
            >
              View details <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </Card>

        {/* Success Criteria Summary */}
        <Card className="border border-divider bg-secondary-background overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-primary-cta" />
              <h3 className="text-lg font-semibold">Success Criteria</h3>
            </div>

            <div className="mb-4">
              {plan.success_criteria && plan.success_criteria.length > 0 ? (
                <div className="space-y-1">
                  {plan.success_criteria
                    .slice(0, 2)
                    .map((criteria: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <p className="truncate">{criteria}</p>
                      </div>
                    ))}
                  {plan.success_criteria.length > 2 && (
                    <p className="text-xs text-secondary-text pl-6">
                      +{plan.success_criteria.length - 2} more criteria
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-secondary-text text-sm">
                  No success criteria defined
                </p>
              )}
            </div>

            <button
              className="text-sm text-primary-cta hover:text-primary-cta/80 flex items-center gap-1"
              onClick={() => setSelectedSection("success")}
            >
              View details <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </Card>
      </div>

      {/* Risks Summary */}
      {plan.risks && plan.risks.length > 0 && (
        <Card className="border border-divider bg-secondary-background overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-primary-cta" />
              <h3 className="text-lg font-semibold">Project Risks</h3>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-full bg-amber-600/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <span>{plan.risks.length}</span>
                </div>
                <p>
                  {plan.risks.length === 1
                    ? "1 risk identified"
                    : `${plan.risks.length} risks identified`}
                </p>
              </div>
            </div>

            <button
              className="text-sm text-primary-cta hover:text-primary-cta/80 flex items-center gap-1"
              onClick={() => setSelectedSection("risks")}
            >
              View details <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
