"use client";

import { motion } from "framer-motion";
import { Lightbulb, BarChart, Plus, Edit, Trash2 } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { VisionSectionProps } from "../types";

export function VisionSection({
  plan,
  isEditing,
  updateVision,
  updateBusinessObjective,
  addBusinessObjective,
  deleteBusinessObjective,
}: VisionSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [objectiveText, setObjectiveText] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleOpenDialog = (index?: number) => {
    if (index !== undefined) {
      setEditIndex(index);
      setObjectiveText(plan.business_objectives[index]);
    } else {
      setEditIndex(null);
      setObjectiveText("");
    }
    setDialogOpen(true);
  };

  const handleSaveObjective = () => {
    if (objectiveText.trim()) {
      if (editIndex !== null) {
        updateBusinessObjective(editIndex, objectiveText);
      } else {
        addBusinessObjective(objectiveText);
      }
      setDialogOpen(false);
      setObjectiveText("");
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
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-6 w-6 text-primary-cta" />
              <h3 className="text-xl font-semibold">Project Vision</h3>
            </div>
            <div className="pl-8 relative before:content-[''] before:absolute before:left-3 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-cta">
              <Card className="bg-primary-background border-divider p-4">
                {!isEditing ? (
                  <p className="text-lg italic text-primary-text">
                    "{plan.vision || "No vision statement available"}"
                  </p>
                ) : (
                  <Textarea
                    className="min-h-[100px]"
                    placeholder="Enter project vision..."
                    value={plan.vision || ""}
                    onChange={(e) => updateVision(e.target.value)}
                  />
                )}
              </Card>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart className="h-6 w-6 text-primary-cta" />
                <h3 className="text-xl font-semibold">Key Objectives</h3>
              </div>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Objective
                </Button>
              )}
            </div>

            <div className="pl-8 space-y-3 relative before:content-[''] before:absolute before:left-3 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-cta">
              {plan.business_objectives &&
              plan.business_objectives.length > 0 ? (
                plan.business_objectives.map(
                  (objective: string, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="bg-primary-background border-divider overflow-hidden">
                        <div className="p-3 flex items-center gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-hover-active flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {index + 1}
                            </span>
                          </div>
                          <p className="text-primary-text flex-1">
                            {objective}
                          </p>
                          {isEditing && (
                            <div className="flex items-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(index)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteBusinessObjective(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  )
                )
              ) : (
                <Card className="bg-primary-background border-divider p-3">
                  <p className="text-secondary-text">
                    No business objectives defined
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Dialog for adding/editing objectives */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editIndex !== null ? "Edit" : "Add"} Business Objective
            </DialogTitle>
            <DialogDescription>
              Define a business goal the project aims to achieve.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Textarea
                placeholder="Enter business objective..."
                value={objectiveText}
                onChange={(e) => setObjectiveText(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveObjective}>
              {editIndex !== null ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
