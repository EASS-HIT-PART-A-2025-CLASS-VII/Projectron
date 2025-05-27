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
  onUpdateResource?: (updatedResource: Resource) => void;
  onDeleteResource?: () => void;
}

export function ResourceSection({
  resource,
  baseUrl,
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
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-hover-active "
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className={`flex items-center gap-2 w-fit ${
            editingName ? "w-full" : "w-fit"
          }`}
        >
          <Badge className="bg-hover-active">{resource.endpoints.length}</Badge>

          {editingName ? (
            <div className="flex flex-col justify-around gap-4 w-full">
              <Input
                value={editedResource.name}
                onChange={(e) =>
                  setEditedResource({ ...editedResource, name: e.target.value })
                }
                className="h-8 w-fit bg-primary-background"
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
                className="h-8 w-full bg-primary-background resize-none"
                placeholder="Resource description"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
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
            <h3 className="text-lg font-medium w-fit">{resource.name}</h3>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!editingName && (
            <div className="flex items-center gap-1">
              <span className="text-secondary-text text-sm hidden md:inline-block w-fit">
                {resource.description}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingName(true);
                }}
              >
                <Edit className="h-3.5 w-3.5 text-secondary-text hover:text-blue-500" />
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
                  <Trash2 className="h-3.5 w-3.5 text-secondary-text hover:text-red-500" />
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
          {resource.endpoints.map((endpoint, endpointIdx) => (
            <EndpointItem
              key={endpointIdx}
              endpoint={endpoint}
              baseUrl={baseUrl}
              onUpdateEndpoint={(updatedEndpoint) =>
                handleEndpointUpdate(endpointIdx, updatedEndpoint)
              }
              onDeleteEndpoint={() => handleEndpointDelete(endpointIdx)}
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
      {/* Add Endpoint Button */}
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
    </div>
  );
}
