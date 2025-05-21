"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Gauge, Shield, Plus, Edit, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RisksSectionProps, ProjectRisk } from "../types";

export function RisksSection({
  plan,
  isEditing,
  updateRisk,
  addRisk,
  deleteRisk,
}: RisksSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [riskData, setRiskData] = useState<ProjectRisk>({
    description: "",
    impact: "",
    mitigation: "",
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleOpenDialog = (index?: number) => {
    if (index !== undefined) {
      setEditIndex(index);
      setRiskData({
        description: plan.risks[index].description,
        impact: plan.risks[index].impact,
        mitigation: plan.risks[index].mitigation,
      });
    } else {
      setEditIndex(null);
      setRiskData({
        description: "",
        impact: "",
        mitigation: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSaveRisk = () => {
    if (riskData.description.trim()) {
      if (editIndex !== null) {
        updateRisk(editIndex, "description", riskData.description);
        updateRisk(editIndex, "impact", riskData.impact);
        updateRisk(editIndex, "mitigation", riskData.mitigation);
      } else {
        addRisk(riskData);
      }
      setDialogOpen(false);
      setRiskData({
        description: "",
        impact: "",
        mitigation: "",
      });
      setEditIndex(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-divider bg-secondary-background overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-primary-cta" />
              <h3 className="text-xl font-semibold">Project Risks</h3>
            </div>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Risk
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {plan.risks && plan.risks.length > 0 ? (
              plan.risks.map((risk: ProjectRisk, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border border-divider rounded-lg overflow-hidden"
                >
                  <div className="bg-hover-active p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-600/20 text-amber-400 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <h4 className="font-medium">{risk.description}</h4>
                    </div>
                    {isEditing && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(index)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRisk(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-1 text-red-400" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-primary-background">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Gauge className="h-4 w-4 text-secondary-text" />
                          <h5 className="text-sm font-medium text-secondary-text">
                            Impact
                          </h5>
                        </div>
                        <div className="p-3 bg-hover-active/50 rounded-md text-sm">
                          {risk.impact}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-secondary-text" />
                          <h5 className="text-sm font-medium text-secondary-text">
                            Mitigation
                          </h5>
                        </div>
                        <div className="p-3 bg-hover-active/50 rounded-md text-sm">
                          {risk.mitigation}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-4 border border-divider rounded-lg bg-primary-background">
                <p className="text-secondary-text">No risks identified</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Dialog for adding/editing risks */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editIndex !== null ? "Edit" : "Add"} Project Risk
            </DialogTitle>
            <DialogDescription>
              Identify a potential risk, its impact, and mitigation strategy.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Risk Description</label>
              <Input
                placeholder="Describe the risk..."
                value={riskData.description}
                onChange={(e) =>
                  setRiskData({ ...riskData, description: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Impact</label>
              <Textarea
                placeholder="Describe the potential impact..."
                value={riskData.impact}
                onChange={(e) =>
                  setRiskData({ ...riskData, impact: e.target.value })
                }
                className="min-h-[80px]"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Mitigation Strategy</label>
              <Textarea
                placeholder="Describe how to mitigate this risk..."
                value={riskData.mitigation}
                onChange={(e) =>
                  setRiskData({ ...riskData, mitigation: e.target.value })
                }
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRisk}>
              {editIndex !== null ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
