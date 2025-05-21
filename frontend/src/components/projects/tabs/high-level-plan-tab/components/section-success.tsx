"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SuccessSectionProps } from "../types";

export function SuccessSection({
  plan,
  isEditing,
  updateSuccessCriteria,
  addSuccessCriteria,
  deleteSuccessCriteria,
  updateConstraint,
  addConstraint,
  deleteConstraint,
  updateAssumption,
  addAssumption,
  deleteAssumption,
  updateTechStack,
  addTechStack,
  deleteTechStack,
}: SuccessSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<
    "success" | "constraint" | "assumption" | "tech"
  >("success");
  const [itemText, setItemText] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleOpenDialog = (
    type: "success" | "constraint" | "assumption" | "tech",
    index?: number
  ) => {
    setDialogType(type);

    if (index !== undefined) {
      setEditIndex(index);

      switch (type) {
        case "success":
          setItemText(plan.success_criteria[index]);
          break;
        case "constraint":
          setItemText(plan.constraints[index]);
          break;
        case "assumption":
          setItemText(plan.assumptions[index]);
          break;
        case "tech":
          setItemText(plan.tech_stack[index]);
          break;
      }
    } else {
      setEditIndex(null);
      setItemText("");
    }

    setDialogOpen(true);
  };

  const handleSaveItem = () => {
    if (itemText.trim()) {
      switch (dialogType) {
        case "success":
          if (editIndex !== null) {
            updateSuccessCriteria(editIndex, itemText);
          } else {
            addSuccessCriteria(itemText);
          }
          break;

        case "constraint":
          if (editIndex !== null) {
            updateConstraint(editIndex, itemText);
          } else {
            addConstraint(itemText);
          }
          break;

        case "assumption":
          if (editIndex !== null) {
            updateAssumption(editIndex, itemText);
          } else {
            addAssumption(itemText);
          }
          break;

        case "tech":
          if (editIndex !== null) {
            updateTechStack(editIndex, itemText);
          } else {
            addTechStack(itemText);
          }
          break;
      }

      setDialogOpen(false);
      setItemText("");
      setEditIndex(null);
    }
  };

  const getDialogTitle = () => {
    switch (dialogType) {
      case "success":
        return "Success Criteria";
      case "constraint":
        return "Constraint";
      case "assumption":
        return "Assumption";
      case "tech":
        return "Technology";
    }
  };

  const getDialogDescription = () => {
    switch (dialogType) {
      case "success":
        return "Define a measurable outcome that indicates project success.";
      case "constraint":
        return "Add a limitation or restriction that affects the project.";
      case "assumption":
        return "Specify an assumption made for project planning.";
      case "tech":
        return "Add a technology used in the project stack.";
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
              <CheckCircle2 className="h-6 w-6 text-primary-cta" />
              <h3 className="text-xl font-semibold">Project Details</h3>
            </div>
          </div>

          <Tabs defaultValue="success_criteria">
            <TabsList className="bg-primary-background p-1 h-auto mb-6">
              <TabsTrigger
                value="success_criteria"
                className="data-[state=active]:bg-hover-active data-[state=active]:text-primary-text"
              >
                Success Criteria
              </TabsTrigger>
              <TabsTrigger
                value="constraints"
                className="data-[state=active]:bg-hover-active data-[state=active]:text-primary-text"
              >
                Constraints
              </TabsTrigger>
              <TabsTrigger
                value="assumptions"
                className="data-[state=active]:bg-hover-active data-[state=active]:text-primary-text"
              >
                Assumptions
              </TabsTrigger>
              <TabsTrigger
                value="tech_stack"
                className="data-[state=active]:bg-hover-active data-[state=active]:text-primary-text"
              >
                Tech Stack
              </TabsTrigger>
            </TabsList>

            {/* Success Criteria Tab */}
            <TabsContent value="success_criteria" className="space-y-4 mt-0">
              <div className="flex justify-end">
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog("success")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Success Criteria
                  </Button>
                )}
              </div>

              {plan.success_criteria && plan.success_criteria.length > 0 ? (
                plan.success_criteria.map((criteria: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-start gap-3 p-4 rounded-lg bg-primary-background border border-divider"
                  >
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-green-600/20 text-green-400 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <p className="flex-1">{criteria}</p>
                    {isEditing && (
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog("success", index)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSuccessCriteria(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <p className="text-secondary-text p-4 bg-primary-background rounded-lg">
                  No success criteria defined
                </p>
              )}
            </TabsContent>

            {/* Constraints Tab */}
            <TabsContent value="constraints" className="space-y-4 mt-0">
              <div className="flex justify-end">
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog("constraint")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Constraint
                  </Button>
                )}
              </div>

              {plan.constraints && plan.constraints.length > 0 ? (
                plan.constraints.map((constraint: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-start gap-3 p-4 rounded-lg bg-primary-background border border-divider"
                  >
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-amber-600/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <p className="flex-1">{constraint}</p>
                    {isEditing && (
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog("constraint", index)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteConstraint(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <p className="text-secondary-text p-4 bg-primary-background rounded-lg">
                  No constraints defined
                </p>
              )}
            </TabsContent>

            {/* Assumptions Tab */}
            <TabsContent value="assumptions" className="space-y-4 mt-0">
              <div className="flex justify-end">
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog("assumption")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Assumption
                  </Button>
                )}
              </div>

              {plan.assumptions && plan.assumptions.length > 0 ? (
                plan.assumptions.map((assumption: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-start gap-3 p-4 rounded-lg bg-primary-background border border-divider"
                  >
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <p className="flex-1">{assumption}</p>
                    {isEditing && (
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog("assumption", index)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAssumption(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <p className="text-secondary-text p-4 bg-primary-background rounded-lg">
                  No assumptions defined
                </p>
              )}
            </TabsContent>

            {/* Tech Stack Tab */}
            <TabsContent value="tech_stack" className="mt-0">
              <div className="p-4 rounded-lg bg-primary-background border border-divider">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium">Technologies</h4>
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog("tech")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Technology
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {plan.tech_stack && plan.tech_stack.length > 0 ? (
                    isEditing ? (
                      plan.tech_stack.map((tech: string, index: number) => (
                        <div key={index} className="relative group">
                          <Badge
                            variant="outline"
                            className="bg-hover-active text-primary-text border-primary-cta/50 py-1.5 px-3 pr-8"
                          >
                            {tech}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 absolute right-1 top-1/2 -translate-y-1/2"
                            onClick={() => deleteTechStack(index)}
                          >
                            <Trash2 className="h-3 w-3 text-red-400" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      plan.tech_stack.map((tech: string, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.2,
                            delay: index * 0.03,
                          }}
                        >
                          <Badge
                            variant="outline"
                            className="bg-hover-active text-primary-text border-primary-cta/50 py-1.5 px-3"
                          >
                            {tech}
                          </Badge>
                        </motion.div>
                      ))
                    )
                  ) : (
                    <p className="text-secondary-text">No tech stack defined</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      {/* Dialog for adding/editing items */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editIndex !== null ? "Edit" : "Add"} {getDialogTitle()}
            </DialogTitle>
            <DialogDescription>{getDialogDescription()}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              {dialogType === "tech" ? (
                <Input
                  placeholder="Enter technology name..."
                  value={itemText}
                  onChange={(e) => setItemText(e.target.value)}
                />
              ) : (
                <Textarea
                  placeholder={`Enter ${dialogType} details...`}
                  value={itemText}
                  onChange={(e) => setItemText(e.target.value)}
                  className="min-h-[100px]"
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>
              {editIndex !== null ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
