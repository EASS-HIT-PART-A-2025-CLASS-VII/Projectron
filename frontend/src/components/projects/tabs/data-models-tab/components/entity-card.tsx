"use client";

import { useState, useEffect } from "react";
import { Edit, Plus, Save, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

import { Entity, Property, Relationship } from "../types";
import { availableTypes } from "../constants";
import { PropertyItem } from "./property-item";
import { RelationshipBadge } from "./relationship-badge";
import { ExpandableText } from "./expandable-text";

interface EntityCardProps {
  entity: Entity;
  relationships: Relationship[];
  isEditing: boolean;
  onUpdateEntity: (entityName: string, updatedEntity: Entity) => void;
  onDeleteEntity: (entityName: string) => void;
  onCardChange: () => void;
}

export function EntityCard({
  entity,
  relationships,
  isEditing,
  onUpdateEntity,
  onDeleteEntity,
  onCardChange,
}: EntityCardProps) {
  const [editingEntity, setEditingEntity] = useState(false);
  const [editedEntity, setEditedEntity] = useState<Entity>({ ...entity });
  const [addingProperty, setAddingProperty] = useState(false);
  const [newProperty, setNewProperty] = useState<Property>({
    name: "",
    type: "string",
    description: "",
    required: false,
  });

  // Filter relationships for this entity
  const entityRelationships = relationships.filter(
    (rel) =>
      rel.source_entity === entity.name || rel.target_entity === entity.name
  );

  // Update the edited entity whenever the original entity changes
  useEffect(() => {
    setEditedEntity({ ...entity });
  }, [entity]);

  // Handle entity field changes
  const handleEntityChange = (field: keyof Entity, value: string) => {
    setEditedEntity({ ...editedEntity, [field]: value });
  };

  // Save entity changes
  const saveEntityChanges = () => {
    onUpdateEntity(entity.name, editedEntity);
    setEditingEntity(false);
    onCardChange();
  };

  // Handle property updates
  const handlePropertyUpdate = (index: number, updatedProperty: Property) => {
    const newProperties = [...editedEntity.properties];
    newProperties[index] = updatedProperty;

    setEditedEntity({ ...editedEntity, properties: newProperties });
  };

  // Handle property deletion
  const handlePropertyDelete = (index: number) => {
    const newProperties = [...editedEntity.properties];
    newProperties.splice(index, 1);

    setEditedEntity({ ...editedEntity, properties: newProperties });
  };

  // Add new property
  const addProperty = () => {
    if (newProperty.name.trim() === "") {
      return;
    }

    const updatedProperties = [...editedEntity.properties, { ...newProperty }];
    setEditedEntity({ ...editedEntity, properties: updatedProperties });

    setNewProperty({
      name: "",
      type: "string",
      description: "",
      required: false,
    });

    setAddingProperty(false);
  };

  return (
    <Card className="gap-0 border border-divider bg-secondary-background overflow-hidden flex flex-col h-full pb-0 pt-0">
      {/* Entity Header */}
      <div className="px-4 py-3 border-b border-divider flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {editingEntity ? (
            <Input
              value={editedEntity.name}
              onChange={(e) => handleEntityChange("name", e.target.value)}
              className="h-8 bg-primary-background mb-2 w-full"
              placeholder="Entity name"
            />
          ) : (
            <h3 className="font-semibold text-primary-text truncate">
              {entity.name}
            </h3>
          )}

          {editingEntity ? (
            <Textarea
              value={editedEntity.description}
              onChange={(e) =>
                handleEntityChange("description", e.target.value)
              }
              className="resize-none bg-primary-background text-xs"
              placeholder="Entity description"
              rows={2}
            />
          ) : (
            entity.description && (
              <p className="text-xs text-secondary-text">
                <ExpandableText text={entity.description} />
              </p>
            )
          )}
        </div>

        <div className="flex items-center gap-2 ml-3">
          <Badge className="bg-primary-cta/10 text-primary-cta border-primary-cta/20">
            {entity.properties.length}
          </Badge>

          {isEditing && (
            <>
              {editingEntity ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setEditingEntity(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={saveEntityChanges}
                  >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setEditingEntity(true)}
                  >
                    <Edit className="h-3.5 w-3.5 text-secondary-text" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:text-red-400"
                    onClick={() => onDeleteEntity(entity.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-secondary-text" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Properties List - always visible */}
      <div
        className="flex-grow overflow-y-auto min-h-0 scrollbar-thin pt-2"
        style={{ maxHeight: "300px" }}
      >
        {editedEntity.properties.map((property, idx) => (
          <PropertyItem
            key={idx}
            property={property}
            isEditing={editingEntity}
            onEdit={
              editingEntity
                ? (updatedProperty) =>
                    handlePropertyUpdate(idx, updatedProperty)
                : undefined
            }
            onDelete={
              editingEntity ? () => handlePropertyDelete(idx) : undefined
            }
          />
        ))}

        {/* No properties message */}
        {editedEntity.properties.length === 0 && !addingProperty && (
          <div className="p-4 text-center text-secondary-text text-sm">
            No properties defined
          </div>
        )}

        {/* Add property form */}
        {isEditing && editingEntity && addingProperty && (
          <div className="p-3 border-b border-divider bg-hover-active/10">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label htmlFor="new-property-name" className="text-xs mb-1">
                  Name
                </Label>
                <Input
                  id="new-property-name"
                  value={newProperty.name}
                  onChange={(e) =>
                    setNewProperty({ ...newProperty, name: e.target.value })
                  }
                  className="h-8 bg-primary-background"
                  placeholder="Property name"
                />
              </div>
              <div>
                <Label htmlFor="new-property-type" className="text-xs mb-1">
                  Type
                </Label>
                <Select
                  value={newProperty.type}
                  onValueChange={(value) =>
                    setNewProperty({ ...newProperty, type: value })
                  }
                >
                  <SelectTrigger
                    id="new-property-type"
                    className="h-8 bg-primary-background"
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mb-3">
              <Label
                htmlFor="new-property-description"
                className="text-xs mb-1"
              >
                Description
              </Label>
              <Textarea
                id="new-property-description"
                value={newProperty.description}
                onChange={(e) =>
                  setNewProperty({
                    ...newProperty,
                    description: e.target.value,
                  })
                }
                rows={2}
                className="resize-none bg-primary-background"
                placeholder="Property description"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="new-property-required"
                  checked={newProperty.required}
                  onCheckedChange={(checked) =>
                    setNewProperty({
                      ...newProperty,
                      required: checked === true,
                    })
                  }
                />
                <Label htmlFor="new-property-required" className="text-sm">
                  Required
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  onClick={() => setAddingProperty(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="h-7"
                  onClick={addProperty}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Add property button */}
        {isEditing && editingEntity && !addingProperty && (
          <div className="p-2 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-primary-cta"
              onClick={() => setAddingProperty(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Property
            </Button>
          </div>
        )}
      </div>

      {/* Relationships (always at bottom) */}
      {entityRelationships.length > 0 && (
        <div className="mt-auto px-3 py-2 bg-primary-background border-t border-divider">
          <div className="flex flex-wrap gap-x-3">
            {entityRelationships.map((rel, idx) => (
              <RelationshipBadge
                key={idx}
                relationship={rel}
                entityName={entity.name}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
