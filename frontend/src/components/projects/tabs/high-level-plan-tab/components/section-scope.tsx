"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Target,
  CheckCircle2,
  XCircle,
  Rocket,
  Shield,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScopeSectionProps } from "../types";

export function ScopeSection({
  plan,
  isEditing,
  updateInScopeItem,
  addInScopeItem,
  deleteInScopeItem,
  updateOutOfScopeItem,
  addOutOfScopeItem,
  deleteOutOfScopeItem,
}: ScopeSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"in" | "out">("in");
  const [itemText, setItemText] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleOpenDialog = (type: "in" | "out", index?: number) => {
    setDialogType(type);

    if (index !== undefined) {
      setEditIndex(index);
      if (type === "in") {
        setItemText(plan.scope.in_scope[index]);
      } else {
        setItemText(plan.scope.out_of_scope[index]);
      }
    } else {
      setEditIndex(null);
      setItemText("");
    }

    setDialogOpen(true);
  };

  const handleSaveItem = () => {
    if (itemText.trim()) {
      if (dialogType === "in") {
        if (editIndex !== null) {
          updateInScopeItem(editIndex, itemText);
        } else {
          addInScopeItem(itemText);
        }
      } else {
        if (editIndex !== null) {
          updateOutOfScopeItem(editIndex, itemText);
        } else {
          addOutOfScopeItem(itemText);
        }
      }

      setDialogOpen(false);
      setItemText("");
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
              <Target className="h-6 w-6 text-primary-cta" />
              <h3 className="text-xl font-semibold">Project Scope</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <h4 className="text-lg font-medium">In Scope</h4>
                </div>
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog("in")}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {plan.scope &&
                plan.scope.in_scope &&
                plan.scope.in_scope.length > 0 ? (
                  plan.scope.in_scope.map((item: string, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: index * 0.05,
                      }}
                      className="p-3 rounded-md bg-primary-background border border-divider flex items-center gap-2"
                    >
                      <Rocket className="h-4 w-4 text-primary-cta flex-shrink-0" />
                      <p className="text-sm flex-1">{item}</p>
                      {isEditing && (
                        <div className="flex">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog("in", index)}
                            className="h-6 w-6"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteInScopeItem(index)}
                            className="h-6 w-6"
                          >
                            <Trash2 className="h-3 w-3 text-red-400" />
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <p className="text-secondary-text text-sm p-3 bg-primary-background rounded-md">
                    No in-scope items defined
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-400" />
                  <h4 className="text-lg font-medium">Out of Scope</h4>
                </div>
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog("out")}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {plan.scope &&
                plan.scope.out_of_scope &&
                plan.scope.out_of_scope.length > 0 ? (
                  plan.scope.out_of_scope.map((item: string, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: index * 0.05,
                      }}
                      className="p-3 rounded-md bg-primary-background border border-divider flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4 text-secondary-text flex-shrink-0" />
                      <p className="text-sm flex-1">{item}</p>
                      {isEditing && (
                        <div className="flex">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog("out", index)}
                            className="h-6 w-6"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteOutOfScopeItem(index)}
                            className="h-6 w-6"
                          >
                            <Trash2 className="h-3 w-3 text-red-400" />
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <p className="text-secondary-text text-sm p-3 bg-primary-background rounded-md">
                    No out-of-scope items defined
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Dialog for adding/editing scope items */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editIndex !== null ? "Edit" : "Add"}{" "}
              {dialogType === "in" ? "In-Scope" : "Out-of-Scope"} Item
            </DialogTitle>
            <DialogDescription>
              {dialogType === "in"
                ? "Add an item that is explicitly within the project scope."
                : "Add an item that is explicitly excluded from the project scope."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Textarea
                placeholder={
                  dialogType === "in"
                    ? "Enter in-scope item..."
                    : "Enter out-of-scope item..."
                }
                value={itemText}
                onChange={(e) => setItemText(e.target.value)}
                className="min-h-[100px]"
              />
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
