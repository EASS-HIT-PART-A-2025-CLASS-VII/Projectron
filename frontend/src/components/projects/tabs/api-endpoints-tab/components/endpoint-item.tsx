"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Edit,
  Lock,
  Trash2,
} from "lucide-react";

import { Endpoint, Request, Response } from "../types";
import { methodColors, availableMethods } from "../constants";
import { RequestSection } from "./request-section";
import { ResponseSection } from "./response-section";

interface EndpointItemProps {
  endpoint: Endpoint;
  baseUrl: string;
  isEditing?: boolean;
  onUpdateEndpoint?: (updatedEndpoint: Endpoint) => void;
  onDeleteEndpoint?: () => void;
}

export function EndpointItem({
  endpoint,
  baseUrl,
  isEditing = false,
  onUpdateEndpoint,
  onDeleteEndpoint,
}: EndpointItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingMetadata, setEditingMetadata] = useState(false);
  const [editedEndpoint, setEditedEndpoint] = useState<Endpoint>({
    ...endpoint,
  });

  const methodColor =
    methodColors[endpoint.method as keyof typeof methodColors] ||
    "bg-gray-500 text-white";

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  // Update the edited endpoint whenever the original endpoint changes
  useEffect(() => {
    setEditedEndpoint({ ...endpoint });
  }, [endpoint]);

  // Save endpoint metadata changes
  const saveMetadataChanges = () => {
    if (!onUpdateEndpoint) return;
    onUpdateEndpoint(editedEndpoint);
    setEditingMetadata(false);
  };

  // Handle request updates
  const handleRequestUpdate = (updatedRequest: Request) => {
    if (!onUpdateEndpoint) return;

    const updatedEndpoint = {
      ...editedEndpoint,
      request: updatedRequest,
    };

    setEditedEndpoint(updatedEndpoint);
    onUpdateEndpoint(updatedEndpoint);
  };

  // Handle response updates
  const handleResponseUpdate = (updatedResponse: Response) => {
    if (!onUpdateEndpoint) return;

    const updatedEndpoint = {
      ...editedEndpoint,
      response: updatedResponse,
    };

    setEditedEndpoint(updatedEndpoint);
    onUpdateEndpoint(updatedEndpoint);
  };

  return (
    <div className="border-b border-divider last:border-b-0">
      {/* Endpoint Header - Swagger Style */}
      <div
        className={`flex items-center w-full p-3 hover:bg-hover-active cursor-pointer ${
          isOpen ? "bg-hover-active/50" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 flex-1">
          <Badge
            className={`${methodColor} border-0 min-w-16 justify-center font-mono text-xs`}
          >
            {endpoint.method}
          </Badge>
          <div className="font-medium text-primary-text md:flex-1 break-all">
            {endpoint.path}
          </div>
          {endpoint.authentication_required && (
            <Lock size={16} className="text-amber-400 flex-shrink-0 mr-2" />
          )}
        </div>
        <div className="text-secondary-text hidden md:block truncate max-w-xs pr-4">
          {endpoint.name}
        </div>
        {isEditing && (
          <div className="flex items-center gap-1 mr-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
                setEditingMetadata(true);
              }}
            >
              <Edit className="h-3.5 w-3.5 text-secondary-text" />
            </Button>
            {onDeleteEndpoint && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteEndpoint();
                }}
              >
                <Trash2 className="h-3.5 w-3.5 text-secondary-text" />
              </Button>
            )}
          </div>
        )}
        {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </div>

      {/* Endpoint Content */}
      {isOpen && (
        <div className="px-4 py-4 border-t border-divider bg-primary-background">
          <div className="grid gap-6">
            {/* Endpoint Metadata */}
            <div>
              {editingMetadata ? (
                <div className="mb-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-endpoint-name">Name</Label>
                      <Input
                        id="edit-endpoint-name"
                        value={editedEndpoint.name}
                        onChange={(e) =>
                          setEditedEndpoint({
                            ...editedEndpoint,
                            name: e.target.value,
                          })
                        }
                        className="bg-secondary-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-endpoint-method">Method</Label>
                      <Select
                        value={editedEndpoint.method}
                        onValueChange={(value) =>
                          setEditedEndpoint({
                            ...editedEndpoint,
                            method: value,
                          })
                        }
                      >
                        <SelectTrigger
                          id="edit-endpoint-method"
                          className="bg-secondary-background"
                        >
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-endpoint-path">Path</Label>
                    <Input
                      id="edit-endpoint-path"
                      value={editedEndpoint.path}
                      onChange={(e) =>
                        setEditedEndpoint({
                          ...editedEndpoint,
                          path: e.target.value,
                        })
                      }
                      className="bg-secondary-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-endpoint-description">
                      Description
                    </Label>
                    <Textarea
                      id="edit-endpoint-description"
                      value={editedEndpoint.description}
                      onChange={(e) =>
                        setEditedEndpoint({
                          ...editedEndpoint,
                          description: e.target.value,
                        })
                      }
                      className="bg-secondary-background"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="edit-endpoint-auth"
                      checked={editedEndpoint.authentication_required}
                      onCheckedChange={(checked) =>
                        setEditedEndpoint({
                          ...editedEndpoint,
                          authentication_required: checked === true,
                        })
                      }
                    />
                    <Label htmlFor="edit-endpoint-auth">
                      Requires Authentication
                    </Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditedEndpoint({ ...endpoint });
                        setEditingMetadata(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={saveMetadataChanges}>
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-2">
                    {endpoint.name}
                  </h3>
                  <p className="text-secondary-text mb-4">
                    {endpoint.description}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    <code className="bg-secondary-background px-3 py-1.5 rounded text-sm font-mono flex items-center flex-1 overflow-x-auto">
                      <span
                        className={`${methodColor} px-2 py-0.5 rounded-sm mr-2 text-xs font-bold`}
                      >
                        {endpoint.method}
                      </span>
                      <span className="whitespace-nowrap">
                        {baseUrl}
                        {endpoint.path}
                      </span>
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 bg-hover-active border-primary-cta/30"
                      onClick={() =>
                        copyToClipboard(`${baseUrl}${endpoint.path}`)
                      }
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </>
              )}
            </div>

            <Tabs defaultValue="request" className="w-full">
              <TabsList className="mb-4 bg-secondary-background">
                <TabsTrigger
                  value="request"
                  className="data-[state=active]:bg-hover-active data-[state=active]:text-primary-text"
                >
                  Request
                </TabsTrigger>
                <TabsTrigger
                  value="response"
                  className="data-[state=active]:bg-hover-active data-[state=active]:text-primary-text"
                >
                  Response
                </TabsTrigger>
              </TabsList>

              <TabsContent value="request" className="mt-0">
                <RequestSection
                  request={editedEndpoint.request}
                  path={editedEndpoint.path}
                  isEditing={isEditing}
                  onUpdateRequest={isEditing ? handleRequestUpdate : undefined}
                />
              </TabsContent>

              <TabsContent value="response" className="mt-0">
                <ResponseSection
                  response={editedEndpoint.response}
                  isEditing={isEditing}
                  onUpdateResponse={
                    isEditing ? handleResponseUpdate : undefined
                  }
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}
