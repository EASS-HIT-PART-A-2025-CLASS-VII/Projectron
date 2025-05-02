"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Component,
  Edit,
  Plus,
  Trash2,
  X,
  ChevronRight,
  Code,
  CheckCircle2,
  CircleDot,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TechnicalArchitecture, SystemComponent } from "../types";

interface ComponentsSectionProps {
  architecture: TechnicalArchitecture;
  isEditing: boolean;
  updateComponent: (index: number, field: string, value: any) => void;
  addComponent: () => void;
  deleteComponent: (index: number) => void;
  addTechnology: (componentIndex: number, technology: string) => void;
  deleteTechnology: (componentIndex: number, techIndex: number) => void;
  addResponsibility: (componentIndex: number, responsibility: string) => void;
  deleteResponsibility: (componentIndex: number, respIndex: number) => void;
}

export function ComponentsSection({
  architecture,
  isEditing,
  updateComponent,
  addComponent,
  deleteComponent,
  addTechnology,
  deleteTechnology,
  addResponsibility,
  deleteResponsibility,
}: ComponentsSectionProps) {
  return (
    <motion.div
      key="components"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-divider bg-secondary-background overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <Component className="h-6 w-6 text-primary-cta" />
              <h3 className="text-xl font-semibold">System Components</h3>
            </div>

            {/* Add Component Button */}
            {isEditing && (
              <Button variant="outline" size="sm" onClick={addComponent}>
                <Plus className="h-4 w-4 mr-1" />
                Add Component
              </Button>
            )}
          </div>

          {architecture.system_components &&
          architecture.system_components.length > 0 ? (
            <div className="space-y-4">
              {architecture.system_components.map((component, index) => (
                <ComponentItem
                  key={index}
                  component={component}
                  index={index}
                  isEditing={isEditing}
                  updateComponent={updateComponent}
                  deleteComponent={deleteComponent}
                  addTechnology={addTechnology}
                  deleteTechnology={deleteTechnology}
                  addResponsibility={addResponsibility}
                  deleteResponsibility={deleteResponsibility}
                />
              ))}
            </div>
          ) : (
            <div className="p-4 border border-divider rounded-lg bg-primary-background">
              <p className="text-secondary-text">
                No system components defined
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

interface ComponentItemProps {
  component: SystemComponent;
  index: number;
  isEditing: boolean;
  updateComponent: (index: number, field: string, value: any) => void;
  deleteComponent: (index: number) => void;
  addTechnology: (componentIndex: number, technology: string) => void;
  deleteTechnology: (componentIndex: number, techIndex: number) => void;
  addResponsibility: (componentIndex: number, responsibility: string) => void;
  deleteResponsibility: (componentIndex: number, respIndex: number) => void;
}

function ComponentItem({
  component,
  index,
  isEditing,
  updateComponent,
  deleteComponent,
  addTechnology,
  deleteTechnology,
  addResponsibility,
  deleteResponsibility,
}: ComponentItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="border border-divider rounded-lg overflow-hidden"
    >
      <Collapsible>
        <CollapsibleTrigger asChild>
          <div className="w-full flex items-center justify-between p-4 hover:bg-hover-active bg-primary-background cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-cta/20 text-primary-cta flex items-center justify-center flex-shrink-0">
                <Component className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium">{component.name}</div>
                <div className="flex items-center mt-1">
                  <Badge
                    variant="outline"
                    className="bg-hover-active/20 text-secondary-text mr-2"
                  >
                    {component.type}
                  </Badge>
                  {component.technologies &&
                    component.technologies.length > 0 && (
                      <span className="text-xs text-secondary-text">
                        {component.technologies.length} technologies
                      </span>
                    )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteComponent(index);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-secondary-text" />
                </Button>
              )}
              <ChevronRight className="h-5 w-5 text-secondary-text transition-transform duration-200 ui-state-open:rotate-90" />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="border-t border-divider">
          <div className="p-4 space-y-4 bg-secondary-background">
            <div className="p-3 rounded-md bg-primary-background border border-divider">
              {isEditing ? (
                <Textarea
                  value={component.description || ""}
                  onChange={(e) =>
                    updateComponent(index, "description", e.target.value)
                  }
                  placeholder="Enter component description"
                  rows={3}
                  className="resize-none bg-hover-active/20"
                />
              ) : (
                <p className="text-primary-text">{component.description}</p>
              )}
            </div>

            {isEditing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-primary-background p-3 rounded-md border border-divider">
                <div>
                  <Label className="text-xs mb-1 text-secondary-text">
                    Component Name
                  </Label>
                  <Input
                    value={component.name}
                    onChange={(e) =>
                      updateComponent(index, "name", e.target.value)
                    }
                    className="bg-hover-active/20"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 text-secondary-text">
                    Component Type
                  </Label>
                  <Input
                    value={component.type}
                    onChange={(e) =>
                      updateComponent(index, "type", e.target.value)
                    }
                    className="bg-hover-active/20"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Technologies */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-secondary-text" />
                    <h5 className="text-sm uppercase text-secondary-text">
                      Technologies
                    </h5>
                  </div>

                  {isEditing && (
                    <div className="flex items-center">
                      <Input
                        id={`new-tech-${index}`}
                        placeholder="Add technology"
                        className="h-7 mr-1 text-sm w-32 bg-primary-background"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-primary-cta p-1"
                        onClick={() => {
                          const inputEl = document.getElementById(
                            `new-tech-${index}`
                          ) as HTMLInputElement;
                          if (inputEl && inputEl.value) {
                            addTechnology(index, inputEl.value);
                            inputEl.value = "";
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-md bg-primary-background border border-divider">
                  <div className="flex flex-wrap gap-2">
                    {component.technologies &&
                      component.technologies.map((tech, i) => (
                        <motion.div
                          key={i}
                          initial={{
                            opacity: 0,
                            scale: 0.9,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          transition={{
                            duration: 0.2,
                            delay: i * 0.03,
                          }}
                          className="relative group"
                        >
                          <Badge
                            variant="outline"
                            className="bg-hover-active text-primary-text border-primary-cta/30"
                          >
                            {tech}
                            {isEditing && (
                              <button
                                className="ml-1.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary-background hover:bg-red-500/20 invisible group-hover:visible"
                                onClick={() => deleteTechnology(index, i)}
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </Badge>
                        </motion.div>
                      ))}
                    {(!component.technologies ||
                      component.technologies.length === 0) && (
                      <p className="text-xs text-secondary-text">
                        No technologies defined
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Responsibilities */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-secondary-text" />
                    <h5 className="text-sm uppercase text-secondary-text">
                      Responsibilities
                    </h5>
                  </div>

                  {isEditing && (
                    <div className="flex items-center">
                      <Input
                        id={`new-resp-${index}`}
                        placeholder="Add responsibility"
                        className="h-7 mr-1 text-sm w-32 bg-primary-background"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-primary-cta p-1"
                        onClick={() => {
                          const inputEl = document.getElementById(
                            `new-resp-${index}`
                          ) as HTMLInputElement;
                          if (inputEl && inputEl.value) {
                            addResponsibility(index, inputEl.value);
                            inputEl.value = "";
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-md bg-primary-background border border-divider h-full">
                  <ul className="space-y-1">
                    {component.responsibilities &&
                      component.responsibilities.map((resp, i) => (
                        <motion.li
                          key={i}
                          initial={{
                            opacity: 0,
                            x: -5,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            duration: 0.2,
                            delay: i * 0.05,
                          }}
                          className="flex items-start gap-2 group"
                        >
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-cta flex-shrink-0"></div>
                          <span className="text-sm flex-1">{resp}</span>
                          {isEditing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:text-red-400"
                              onClick={() => deleteResponsibility(index, i)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </motion.li>
                      ))}
                    {(!component.responsibilities ||
                      component.responsibilities.length === 0) && (
                      <p className="text-xs text-secondary-text">
                        No responsibilities defined
                      </p>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}
