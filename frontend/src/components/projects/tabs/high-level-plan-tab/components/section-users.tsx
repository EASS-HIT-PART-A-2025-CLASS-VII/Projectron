"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  UserCircle2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  XCircle,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersSectionProps, TargetUser } from "../types";

export function UsersSection({
  plan,
  isEditing,
  updateUser,
  addUser,
  deleteUser,
  addUserNeed,
  deleteUserNeed,
  addUserPainPoint,
  deleteUserPainPoint,
}: UsersSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userDialogType, setUserDialogType] = useState<
    "user" | "need" | "pain"
  >("user");
  const [userFormData, setUserFormData] = useState<TargetUser>({
    type: "",
    needs: [],
    pain_points: [],
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [itemText, setItemText] = useState("");
  const [userIndex, setUserIndex] = useState<number | null>(null);

  // Handle opening the dialog for different purposes
  const handleOpenUserDialog = (index?: number) => {
    setUserDialogType("user");
    if (index !== undefined) {
      setEditIndex(index);
      setUserFormData({
        type: plan.target_users[index].type,
        needs: [...plan.target_users[index].needs],
        pain_points: [...plan.target_users[index].pain_points],
      });
    } else {
      setEditIndex(null);
      setUserFormData({
        type: "",
        needs: [],
        pain_points: [],
      });
    }
    setDialogOpen(true);
  };

  const handleOpenNeedDialog = (userIdx: number) => {
    setUserDialogType("need");
    setUserIndex(userIdx);
    setItemText("");
    setDialogOpen(true);
  };

  const handleOpenPainDialog = (userIdx: number) => {
    setUserDialogType("pain");
    setUserIndex(userIdx);
    setItemText("");
    setDialogOpen(true);
  };

  // Save handlers
  const handleSaveUser = () => {
    if (userFormData.type.trim()) {
      if (editIndex !== null) {
        updateUser(editIndex, "type", userFormData.type);
        updateUser(editIndex, "needs", userFormData.needs);
        updateUser(editIndex, "pain_points", userFormData.pain_points);
      } else {
        addUser(userFormData);
      }
      setDialogOpen(false);
      setUserFormData({
        type: "",
        needs: [],
        pain_points: [],
      });
      setEditIndex(null);
    }
  };

  const handleSaveNeed = () => {
    if (itemText.trim() && userIndex !== null) {
      addUserNeed(userIndex, itemText);
      setDialogOpen(false);
      setItemText("");
    }
  };

  const handleSavePain = () => {
    if (itemText.trim() && userIndex !== null) {
      addUserPainPoint(userIndex, itemText);
      setDialogOpen(false);
      setItemText("");
    }
  };

  // Update form data
  const updateFormData = (field: keyof TargetUser, value: any) => {
    setUserFormData({
      ...userFormData,
      [field]: value,
    });
  };

  // Handle needs and pain points in the form
  const handleAddNeedToForm = (need: string) => {
    if (need.trim() && !userFormData.needs.includes(need)) {
      updateFormData("needs", [...userFormData.needs, need]);
      setItemText("");
    }
  };

  const handleRemoveNeedFromForm = (index: number) => {
    const updatedNeeds = [...userFormData.needs];
    updatedNeeds.splice(index, 1);
    updateFormData("needs", updatedNeeds);
  };

  const handleAddPainToForm = (pain: string) => {
    if (pain.trim() && !userFormData.pain_points.includes(pain)) {
      updateFormData("pain_points", [...userFormData.pain_points, pain]);
      setItemText("");
    }
  };

  const handleRemovePainFromForm = (index: number) => {
    const updatedPains = [...userFormData.pain_points];
    updatedPains.splice(index, 1);
    updateFormData("pain_points", updatedPains);
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
              <UserCircle2 className="h-6 w-6 text-primary-cta" />
              <h3 className="text-xl font-semibold">Target Users</h3>
            </div>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenUserDialog()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User Type
              </Button>
            )}
          </div>

          {plan.target_users && plan.target_users.length > 0 ? (
            isEditing ? (
              <div className="space-y-6">
                {plan.target_users.map((user, index) => (
                  <Card
                    key={index}
                    className="border border-divider bg-primary-background overflow-hidden"
                  >
                    <div className="p-4 border-b border-divider flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCircle2 className="h-5 w-5 text-primary-cta" />
                        <h4 className="text-lg font-medium">{user.type}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenUserDialog(index)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteUser(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-1 text-red-400" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium text-secondary-text">
                            Needs:
                          </h5>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenNeedDialog(index)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                        {user.needs && user.needs.length > 0 ? (
                          user.needs.map((need, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 p-2 rounded-md bg-hover-active"
                            >
                              <ArrowRight className="h-4 w-4 text-primary-cta flex-shrink-0" />
                              <p className="text-sm flex-1">{need}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => deleteUserNeed(index, i)}
                              >
                                <Trash2 className="h-3 w-3 text-red-400" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-secondary-text text-sm">
                            No needs defined
                          </p>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium text-secondary-text">
                            Pain Points:
                          </h5>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenPainDialog(index)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                        {user.pain_points && user.pain_points.length > 0 ? (
                          user.pain_points.map((point, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 p-2 rounded-md bg-hover-active"
                            >
                              <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                              <p className="text-sm flex-1">{point}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => deleteUserPainPoint(index, i)}
                              >
                                <Trash2 className="h-3 w-3 text-red-400" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-secondary-text text-sm">
                            No pain points defined
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Tabs defaultValue={plan.target_users[0].type}>
                <TabsList className="mb-6 bg-primary-background p-1 h-auto">
                  {plan.target_users.map((user: any, index: number) => (
                    <TabsTrigger
                      key={index}
                      value={user.type}
                      className="data-[state=active]:bg-hover-active data-[state=active]:text-primary-text"
                    >
                      {user.type}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {plan.target_users.map((user: any, index: number) => (
                  <TabsContent
                    key={index}
                    value={user.type}
                    className="space-y-6 mt-0"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-600/20 text-green-400 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <h4 className="text-lg font-medium">Needs</h4>
                        </div>

                        <div className="space-y-2">
                          {user.needs && user.needs.length > 0 ? (
                            user.needs.map((need: string, i: number) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.2,
                                  delay: i * 0.05,
                                }}
                                className="flex items-center gap-2 p-3 rounded-md bg-primary-background border border-divider"
                              >
                                <ArrowRight className="h-4 w-4 text-primary-cta flex-shrink-0" />
                                <p className="text-sm">{need}</p>
                              </motion.div>
                            ))
                          ) : (
                            <p className="text-secondary-text text-sm p-3 bg-primary-background rounded-md">
                              No specific needs defined
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-600/20 text-amber-400 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5" />
                          </div>
                          <h4 className="text-lg font-medium">Pain Points</h4>
                        </div>

                        <div className="space-y-2">
                          {user.pain_points && user.pain_points.length > 0 ? (
                            user.pain_points.map((point: string, i: number) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.2,
                                  delay: i * 0.05,
                                }}
                                className="flex items-center gap-2 p-3 rounded-md bg-primary-background border border-divider"
                              >
                                <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                                <p className="text-sm">{point}</p>
                              </motion.div>
                            ))
                          ) : (
                            <p className="text-secondary-text text-sm p-3 bg-primary-background rounded-md">
                              No pain points identified
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )
          ) : (
            <div className="p-4 border border-divider rounded-lg bg-primary-background">
              <p className="text-secondary-text">No target users defined</p>
            </div>
          )}
        </div>
      </Card>

      {/* Dialog for users, needs and pain points */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {userDialogType === "user"
                ? `${editIndex !== null ? "Edit" : "Add"} User Type`
                : userDialogType === "need"
                ? "Add User Need"
                : "Add Pain Point"}
            </DialogTitle>
            <DialogDescription>
              {userDialogType === "user"
                ? "Define a user type, their needs, and pain points."
                : userDialogType === "need"
                ? "Add a specific need for this user type."
                : "Add a specific pain point for this user type."}
            </DialogDescription>
          </DialogHeader>

          {userDialogType === "user" ? (
            <div className="space-y-4 py-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium">User Type</label>
                <Input
                  placeholder="E.g., Developer, Project Manager, etc."
                  value={userFormData.type}
                  onChange={(e) => updateFormData("type", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Needs</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add need..."
                      value={itemText}
                      onChange={(e) => setItemText(e.target.value)}
                      className="w-64"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddNeedToForm(itemText)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="max-h-[150px] overflow-y-auto space-y-2 p-2 border border-divider rounded-md">
                  {userFormData.needs.length > 0 ? (
                    userFormData.needs.map((need, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-hover-active/50 rounded-md"
                      >
                        <p className="text-sm">{need}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemoveNeedFromForm(index)}
                        >
                          <Trash2 className="h-3 w-3 text-red-400" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-secondary-text p-2">
                      No needs added yet
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Pain Points</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add pain point..."
                      value={itemText}
                      onChange={(e) => setItemText(e.target.value)}
                      className="w-64"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddPainToForm(itemText)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="max-h-[150px] overflow-y-auto space-y-2 p-2 border border-divider rounded-md">
                  {userFormData.pain_points.length > 0 ? (
                    userFormData.pain_points.map((pain, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-hover-active/50 rounded-md"
                      >
                        <p className="text-sm">{pain}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemovePainFromForm(index)}
                        >
                          <Trash2 className="h-3 w-3 text-red-400" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-secondary-text p-2">
                      No pain points added yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="grid gap-2">
                <Textarea
                  placeholder={
                    userDialogType === "need"
                      ? "Enter user need..."
                      : "Enter user pain point..."
                  }
                  value={itemText}
                  onChange={(e) => setItemText(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={
                userDialogType === "user"
                  ? handleSaveUser
                  : userDialogType === "need"
                  ? handleSaveNeed
                  : handleSavePain
              }
            >
              {userDialogType === "user" && editIndex !== null
                ? "Update"
                : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
