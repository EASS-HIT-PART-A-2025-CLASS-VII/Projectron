"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Layers, Plus, Edit, Trash2 } from "lucide-react";
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
import { FeaturesSectionProps } from "../types";

export function FeaturesSection({
  plan,
  isEditing,
  updateFeature,
  addFeature,
  deleteFeature,
}: FeaturesSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [featureText, setFeatureText] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleOpenDialog = (index?: number) => {
    if (index !== undefined) {
      setEditIndex(index);
      setFeatureText(plan.core_features[index]);
    } else {
      setEditIndex(null);
      setFeatureText("");
    }
    setDialogOpen(true);
  };

  const handleSaveFeature = () => {
    if (featureText.trim()) {
      if (editIndex !== null) {
        updateFeature(editIndex, featureText);
      } else {
        addFeature(featureText);
      }
      setDialogOpen(false);
      setFeatureText("");
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
              <Zap className="h-6 w-6 text-primary-cta" />
              <h3 className="text-xl font-semibold">Core Features</h3>
            </div>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.core_features && plan.core_features.length > 0 ? (
              plan.core_features.map((feature: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="p-4 border border-divider rounded-lg bg-primary-background"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-cta/20 text-primary-cta flex items-center justify-center">
                      <Layers className="h-4 w-4" />
                    </div>
                    <p className="font-medium flex-1">{feature}</p>
                    {isEditing && (
                      <div className="flex">
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
                          onClick={() => deleteFeature(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="md:col-span-2 p-4 border border-divider rounded-lg bg-primary-background">
                <p className="text-secondary-text">No core features defined</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Dialog for adding/editing features */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editIndex !== null ? "Edit" : "Add"} Core Feature
            </DialogTitle>
            <DialogDescription>
              Specify a core feature of the application.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Textarea
                placeholder="Enter feature description..."
                value={featureText}
                onChange={(e) => setFeatureText(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFeature}>
              {editIndex !== null ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
