"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

import { Response, ResponseError } from "../types";
import {
  statusColors,
  errorCodes,
  successCodes,
  contentTypes,
} from "../constants";
import { JsonDisplay } from "./json-display";
import { ResponseErrorItem } from "./response-error-item";

interface ResponseSectionProps {
  response: Response;
  isEditing?: boolean;
  onUpdateResponse?: (updatedResponse: Response) => void;
}

export function ResponseSection({
  response,
  isEditing = false,
  onUpdateResponse,
}: ResponseSectionProps) {
  const [addingError, setAddingError] = useState(false);
  const [newError, setNewError] = useState<ResponseError>({
    status: 400,
    description: "Bad Request",
  });

  // Handle success response update
  const handleSuccessUpdate = (schemaData: Record<string, any>) => {
    if (!onUpdateResponse) return;

    onUpdateResponse({
      ...response,
      success: {
        ...response.success,
        schema_data: schemaData,
      },
    });
  };

  // Handle status code update
  const handleStatusUpdate = (status: number) => {
    if (!onUpdateResponse) return;

    onUpdateResponse({
      ...response,
      success: {
        ...response.success,
        status,
      },
    });
  };

  // Handle content type update
  const handleContentTypeUpdate = (contentType: string) => {
    if (!onUpdateResponse) return;

    onUpdateResponse({
      ...response,
      success: {
        ...response.success,
        content_type: contentType,
      },
    });
  };

  // Handle error update
  const handleErrorUpdate = (index: number, updatedError: ResponseError) => {
    if (!onUpdateResponse) return;

    const newErrors = [...response.errors];
    newErrors[index] = updatedError;

    onUpdateResponse({
      ...response,
      errors: newErrors,
    });
  };

  // Handle error deletion
  const handleErrorDelete = (index: number) => {
    if (!onUpdateResponse) return;

    const newErrors = [...response.errors];
    newErrors.splice(index, 1);

    onUpdateResponse({
      ...response,
      errors: newErrors,
    });
  };

  // Add new error
  const addError = () => {
    if (!onUpdateResponse) return;

    onUpdateResponse({
      ...response,
      errors: [...response.errors, newError],
    });

    setNewError({
      status: 400,
      description: "Bad Request",
    });

    setAddingError(false);
  };

  return (
    <Tabs defaultValue="success" className="w-full">
      <TabsList className="mb-4 bg-secondary-background">
        <TabsTrigger
          value="success"
          className="data-[state=active]:bg-hover-active data-[state=active]:text-primary-text"
        >
          Success Response
        </TabsTrigger>
        <TabsTrigger
          value="errors"
          className="data-[state=active]:bg-hover-active data-[state=active]:text-primary-text"
        >
          Error Responses ({response.errors.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="success" className="space-y-4 mt-0">
        <div className="flex gap-2 items-center p-2 bg-primary-background rounded-t-md border border-divider border-b-0">
          {isEditing ? (
            <>
              <Select
                value={response.success.status.toString()}
                onValueChange={(value) => handleStatusUpdate(parseInt(value))}
              >
                <SelectTrigger className="h-8 w-24 bg-hover-active">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {successCodes.map((code) => (
                    <SelectItem key={code} value={code.toString()}>
                      {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={response.success.content_type}
                onValueChange={handleContentTypeUpdate}
              >
                <SelectTrigger className="h-8 bg-hover-active">
                  <SelectValue placeholder="Content-Type" />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ) : (
            <>
              <Badge
                className={`${
                  statusColors[
                    Math.floor(
                      response.success.status / 100
                    ) as keyof typeof statusColors
                  ]
                }`}
              >
                {response.success.status}
              </Badge>
              <span className="text-secondary-text">
                {response.success.content_type}
              </span>
            </>
          )}
        </div>
        <div className="border border-divider rounded-b-md overflow-hidden">
          <JsonDisplay
            data={response.success.schema_data}
            maxHeight="96"
            editable={isEditing}
            onEdit={handleSuccessUpdate}
          />
        </div>
      </TabsContent>

      <TabsContent value="errors" className="space-y-4 mt-0">
        {/* Add error button */}
        {isEditing && !addingError && (
          <div className="flex justify-end mb-2">
            <Button
              variant="outline"
              size="sm"
              className="text-primary-cta"
              onClick={() => setAddingError(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Error
            </Button>
          </div>
        )}

        {/* New error form */}
        {isEditing && addingError && (
          <div className="border border-divider rounded-md overflow-hidden mb-4 bg-hover-active/10">
            <div className="p-3">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <Label htmlFor="new-error-status" className="text-xs mb-1">
                    Status Code
                  </Label>
                  <Select
                    value={newError.status.toString()}
                    onValueChange={(value) =>
                      setNewError({ ...newError, status: parseInt(value) })
                    }
                  >
                    <SelectTrigger
                      id="new-error-status"
                      className="h-8 bg-primary-background"
                    >
                      <SelectValue placeholder="Select status code" />
                    </SelectTrigger>
                    <SelectContent>
                      {errorCodes.map((code) => (
                        <SelectItem key={code} value={code.toString()}>
                          {code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="new-error-description"
                    className="text-xs mb-1"
                  >
                    Description
                  </Label>
                  <Input
                    id="new-error-description"
                    value={newError.description}
                    onChange={(e) =>
                      setNewError({ ...newError, description: e.target.value })
                    }
                    className="h-8 bg-primary-background"
                    placeholder="e.g., Bad Request, Not Found"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  onClick={() => setAddingError(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="h-7"
                  onClick={addError}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Errors list */}
        {response.errors.map((error, idx) => (
          <ResponseErrorItem
            key={idx}
            error={error}
            isEditing={isEditing}
            onEdit={
              isEditing
                ? (updatedError) => handleErrorUpdate(idx, updatedError)
                : undefined
            }
            onDelete={isEditing ? () => handleErrorDelete(idx) : undefined}
          />
        ))}

        {response.errors.length === 0 && (
          <div className="p-4 text-center border border-divider rounded-md">
            <p className="text-secondary-text">No error responses defined</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
