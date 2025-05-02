"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronRight, Edit, Plus, Trash2 } from "lucide-react";

import { Resource, Endpoint } from "../types";
import { EndpointItem } from "./endpoint-item";
import { NewEndpointDialog } from "./dialogs/new-endpoint-dialog";

interface ResourceSectionProps {
  resource: Resource;
  baseUrl: string;
  isEditing?: boolean;
  onUpdateResource?: (updatedResource: Resource) => void;
  onDeleteResource?: () => void;
}

export function ResourceSection({
  resource,
  baseUrl,
  isEditing = false,
  onUpdateResource,
  onDeleteResource,
}: ResourceSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [editedResource, setEditedResource] = useState<Resource>({
    ...resource,
  });
  const [showNewEndpointDialog, setShowNewEndpointDialog] = useState(false);

  // Update the edited resource whenever the original resource changes
  useEffect(() => {
    setEditedResource({ ...resource });
  }, [resource]);

  // Save resource name changes
  const saveNameChanges = () => {
    if (!onUpdateResource) return;
    onUpdateResource(editedResource);
    setEditingName(false);
  };

  // Handle endpoint update
  const handleEndpointUpdate = (index: number, updatedEndpoint: Endpoint) => {
    if (!onUpdateResource) return;

    const newEndpoints = [...editedResource.endpoints];
    newEndpoints[index] = updatedEndpoint;

    const updatedResource = {
      ...editedResource,
      endpoints: newEndpoints,
    };

    setEditedResource(updatedResource);
    onUpdateResource(updatedResource);
  };

  // Handle endpoint deletion
  const handleEndpointDelete = (index: number) => {
    if (!onUpdateResource) return;

    const newEndpoints = [...editedResource.endpoints];
    newEndpoints.splice(index, 1);

    const updatedResource = {
      ...editedResource,
      endpoints: newEndpoints,
    };

    setEditedResource(updatedResource);
    onUpdateResource(updatedResource);
  };

  // Add new endpoint
  const handleAddEndpoint = (newEndpoint: Endpoint) => {
    if (!onUpdateResource) return;

    const updatedResource = {
      ...editedResource,
      endpoints: [...editedResource.endpoints, newEndpoint],
    };

    setEditedResource(updatedResource);
    onUpdateResource(updatedResource);
  };

  return (
    <div className="border border-divider rounded-md overflow-hidden bg-secondary-background">
      {/* Resource Header */}
      <div
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-hover-active"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Badge className="bg-hover-active">{resource.endpoints.length}</Badge>

          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedResource.name}
                onChange={(e) =>
                  setEditedResource({ ...editedResource, name: e.target.value })
                }
                className="h-8 w-48 bg-primary-background"
                onClick={(e) => e.stopPropagation()}
              />
              <Textarea
                value={editedResource.description}
                onChange={(e) =>
                  setEditedResource({
                    ...editedResource,
                    description: e.target.value,
                  })
                }
                className="h-8 w-48 bg-primary-background resize-none"
                placeholder="Resource description"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditedResource({ ...resource });
                    setEditingName(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    saveNameChanges();
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <h3 className="text-lg font-medium">{resource.name}</h3>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-secondary-text text-sm hidden md:inline-block">
            {resource.description}
          </span>

          {isEditing && !editingName && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingName(true);
                }}
              >
                <Edit className="h-3.5 w-3.5 text-secondary-text" />
              </Button>
              {onDeleteResource && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteResource();
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-secondary-text" />
                </Button>
              )}
            </div>
          )}

          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-secondary-text" />
          ) : (
            <ChevronRight className="h-5 w-5 text-secondary-text" />
          )}
        </div>
      </div>

      {/* Endpoints List */}
      {isOpen && (
        <div className="border-t border-divider">
          {/* Add Endpoint Button */}
          {isEditing && (
            <div className="p-2 border-b border-divider bg-hover-active/10">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-primary-cta"
                onClick={() => setShowNewEndpointDialog(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Endpoint
              </Button>
            </div>
          )}

          {resource.endpoints.map((endpoint, endpointIdx) => (
            <EndpointItem
              key={endpointIdx}
              endpoint={endpoint}
              baseUrl={baseUrl}
              isEditing={isEditing}
              onUpdateEndpoint={
                isEditing
                  ? (updatedEndpoint) =>
                      handleEndpointUpdate(endpointIdx, updatedEndpoint)
                  : undefined
              }
              onDeleteEndpoint={
                isEditing ? () => handleEndpointDelete(endpointIdx) : undefined
              }
            />
          ))}

          {resource.endpoints.length === 0 && (
            <div className="p-4 text-center text-secondary-text">
              No endpoints defined for this resource
            </div>
          )}
        </div>
      )}

      {/* New Endpoint Dialog */}
      <NewEndpointDialog
        open={showNewEndpointDialog}
        onOpenChange={setShowNewEndpointDialog}
        onAddEndpoint={handleAddEndpoint}
        resourceName={resource.name}
      />
    </div>
  );
}
