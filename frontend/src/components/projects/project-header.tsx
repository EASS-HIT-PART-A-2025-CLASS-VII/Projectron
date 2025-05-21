"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Project } from "@/types";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Edit, Trash } from "lucide-react";
import { updateProject, deleteProject } from "@/lib/projects";
import { useToast } from "@/hooks/use-toast";
import { set } from "date-fns";

interface ProjectHeaderProps {
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project | null>>;
}

export function ProjectHeader({ project, setProject }: ProjectHeaderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: project.name,
    description: project.description,
  });

  // Get status badge color based on project status
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "draft":
        return "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30";
      case "in_progress":
        return "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30";
      case "completed":
        return "bg-green-500/20 text-green-500 hover:bg-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-500 hover:bg-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-500 hover:bg-gray-500/30";
    }
  };
  // Handle input changes in edit dialog
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    console.log("Updated form data:", { ...editFormData, [name]: value });
  };

  // Handle project update
  const handleUpdateProject = async () => {
    try {
      setIsUpdating(true);
      if (!project) return;
      let data = await updateProject(project.id, editFormData);
      setProject(data);
      toast({
        title: "Project updated",
        description: "Project details have been updated successfully.",
      });
      setIsEditDialogOpen(false);
      // Refresh the page to get updated data
      router.refresh();
    } catch (error) {
      console.error("Failed to update project:", error);
      toast({
        title: "Update failed",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle project deletion
  const handleDeleteProject = async () => {
    try {
      setIsDeleting(true);
      await deleteProject(project.id);
      toast({
        title: "Project deleted",
        description: "Project has been deleted successfully.",
      });
      // Navigate back to projects list
      router.push("/projects");
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Project Title and Actions Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{project?.name}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={`capitalize ${getStatusColor(project?.status)}`}
          >
            {project?.status.replace("_", " ")}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
            className="border-divider"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="border-divider text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Project Description */}
      <div className="bg-secondary-background rounded-lg p-4 border border-divider">
        <p className="text-secondary-text">{project.description}</p>
      </div>

      {/* Project Metadata */}
      <div className="flex flex-col sm:flex-row gap-4 text-sm text-secondary-text">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1.5" />
          <span>Created: {formatDate(project.created_at)}</span>
        </div>
        {project.updated_at && (
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1.5" />
            <span>Updated: {formatDate(project.updated_at)}</span>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-secondary-background border-divider">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project's basic information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                name="name"
                value={editFormData.name}
                onChange={handleInputChange}
                className="bg-primary-background border-divider"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={editFormData.description}
                onChange={handleInputChange}
                rows={5}
                className="bg-primary-background border-divider"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-divider"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProject}
              disabled={isUpdating}
              className="bg-primary-cta text-primary-text hover:bg-cta-hover"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-secondary-background border-divider">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project and all of its data including milestones, tasks, and
              subtasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-divider">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
