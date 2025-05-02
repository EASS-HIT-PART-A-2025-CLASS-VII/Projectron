"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Endpoint } from "../../types";
import { availableMethods, defaultEndpoint } from "../../constants";

interface NewEndpointDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEndpoint: (endpoint: Endpoint) => void;
  resourceName: string;
}

export function NewEndpointDialog({
  open,
  onOpenChange,
  onAddEndpoint,
  resourceName,
}: NewEndpointDialogProps) {
  const [newEndpoint, setNewEndpoint] = useState<Endpoint>({
    ...defaultEndpoint,
    name: "",
    path: "",
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setNewEndpoint({
        ...defaultEndpoint,
        name: `Get ${resourceName}`,
        path: `/${resourceName.toLowerCase()}`,
      });
    }
  }, [open, resourceName]);

  // Handle submit
  const handleSubmit = () => {
    if (newEndpoint.name.trim() === "" || newEndpoint.path.trim() === "") {
      return;
    }

    onAddEndpoint(newEndpoint);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Endpoint</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endpoint-name">Endpoint Name</Label>
              <Input
                id="endpoint-name"
                placeholder="e.g., Get Users, Create Order"
                value={newEndpoint.name}
                onChange={(e) =>
                  setNewEndpoint({ ...newEndpoint, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endpoint-method">HTTP Method</Label>
              <Select
                value={newEndpoint.method}
                onValueChange={(value) =>
                  setNewEndpoint({ ...newEndpoint, method: value })
                }
              >
                <SelectTrigger id="endpoint-method">
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
            <Label htmlFor="endpoint-path">Path</Label>
            <Input
              id="endpoint-path"
              placeholder="e.g., /users, /orders/{id}"
              value={newEndpoint.path}
              onChange={(e) =>
                setNewEndpoint({ ...newEndpoint, path: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint-description">Description</Label>
            <Textarea
              id="endpoint-description"
              placeholder="What this endpoint does"
              rows={3}
              value={newEndpoint.description}
              onChange={(e) =>
                setNewEndpoint({ ...newEndpoint, description: e.target.value })
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="endpoint-auth"
              checked={newEndpoint.authentication_required}
              onCheckedChange={(checked) =>
                setNewEndpoint({
                  ...newEndpoint,
                  authentication_required: checked === true,
                })
              }
            />
            <Label htmlFor="endpoint-auth">Requires Authentication</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Endpoint</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
