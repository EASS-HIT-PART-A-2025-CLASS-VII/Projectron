"use client";

import { motion } from "framer-motion";
import {
  Cloud,
  Globe,
  Server,
  Settings,
  Plus,
  Trash2,
  Cpu,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TechnicalArchitecture } from "../types";

interface InfrastructureSectionProps {
  architecture: TechnicalArchitecture;
  isEditing: boolean;
  updateInfrastructure: (field: string, value: any) => void;
  addInfrastructureService: (service: string) => void;
  deleteInfrastructureService: (index: number) => void;
}

export function InfrastructureSection({
  architecture,
  isEditing,
  updateInfrastructure,
  addInfrastructureService,
  deleteInfrastructureService,
}: InfrastructureSectionProps) {
  return (
    <motion.div
      key="infrastructure"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-divider bg-secondary-background overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Cloud className="h-6 w-6 text-primary-cta" />
            <h3 className="text-xl font-semibold">Infrastructure</h3>
          </div>

          {architecture.infrastructure &&
          Object.keys(architecture.infrastructure).length > 0 ? (
            <div className="space-y-8">
              {/* Hosting */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary-cta/20 text-primary-cta flex items-center justify-center">
                    <Globe className="h-4 w-4" />
                  </div>
                  <h4 className="text-lg font-medium">Hosting</h4>
                </div>

                <div className="p-4 bg-primary-background border border-divider rounded-lg">
                  {isEditing ? (
                    <Textarea
                      value={architecture.infrastructure.hosting || ""}
                      onChange={(e) =>
                        updateInfrastructure("hosting", e.target.value)
                      }
                      placeholder="Enter hosting information"
                      rows={3}
                      className="resize-none bg-hover-active/20"
                    />
                  ) : (
                    architecture.infrastructure.hosting
                  )}
                </div>
              </motion.div>

              {/* Services */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-cta/20 text-primary-cta flex items-center justify-center">
                      <Server className="h-4 w-4" />
                    </div>
                    <h4 className="text-lg font-medium">Services</h4>
                  </div>

                  {isEditing && (
                    <div className="flex items-center gap-2">
                      <Input
                        id="new-service"
                        placeholder="Add service"
                        className="h-8 w-40 bg-primary-background"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-primary-cta"
                        onClick={() => {
                          const inputEl = document.getElementById(
                            "new-service"
                          ) as HTMLInputElement;
                          if (inputEl && inputEl.value) {
                            addInfrastructureService(inputEl.value);
                            inputEl.value = "";
                          }
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {architecture.infrastructure.services &&
                    architecture.infrastructure.services.map(
                      (service, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.2,
                            delay: 0.1 + index * 0.05,
                          }}
                          className="flex items-center gap-2 p-3 bg-primary-background border border-divider rounded-md group"
                        >
                          <Cpu className="h-4 w-4 text-secondary-text" />
                          {isEditing ? (
                            <>
                              <Input
                                value={service}
                                onChange={(e) => {
                                  const updatedServices = [
                                    ...architecture.infrastructure!.services!,
                                  ];
                                  updatedServices[index] = e.target.value;
                                  updateInfrastructure(
                                    "services",
                                    updatedServices
                                  );
                                }}
                                className="h-7 bg-hover-active/20"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 hover:text-red-400"
                                onClick={() =>
                                  deleteInfrastructureService(index)
                                }
                              >
                                <Trash2 className="h-3.5 w-3.5 text-secondary-text" />
                              </Button>
                            </>
                          ) : (
                            <span>{service}</span>
                          )}
                        </motion.div>
                      )
                    )}

                  {(!architecture.infrastructure.services ||
                    architecture.infrastructure.services.length === 0) && (
                    <div className="p-4 border border-divider rounded-lg bg-primary-background">
                      <p className="text-secondary-text">No services defined</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* CI/CD */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary-cta/20 text-primary-cta flex items-center justify-center">
                    <Settings className="h-4 w-4" />
                  </div>
                  <h4 className="text-lg font-medium">CI/CD Pipeline</h4>
                </div>

                <div className="p-4 bg-primary-background border border-divider rounded-lg">
                  {isEditing ? (
                    <Textarea
                      value={architecture.infrastructure.ci_cd || ""}
                      onChange={(e) =>
                        updateInfrastructure("ci_cd", e.target.value)
                      }
                      placeholder="Enter CI/CD pipeline information"
                      rows={3}
                      className="resize-none bg-hover-active/20"
                    />
                  ) : (
                    architecture.infrastructure.ci_cd
                  )}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="p-4 border border-divider rounded-lg bg-primary-background">
              <p className="text-secondary-text">
                No infrastructure details defined
              </p>
              {isEditing && (
                <div className="mt-4 flex flex-col gap-3">
                  <div>
                    <h5 className="text-sm font-medium mb-2">
                      Add Hosting Information
                    </h5>
                    <Textarea
                      placeholder="Enter hosting information"
                      rows={3}
                      className="resize-none bg-hover-active/20"
                      onChange={(e) =>
                        updateInfrastructure("hosting", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2">
                      Add CI/CD Pipeline Information
                    </h5>
                    <Textarea
                      placeholder="Enter CI/CD pipeline information"
                      rows={3}
                      className="resize-none bg-hover-active/20"
                      onChange={(e) =>
                        updateInfrastructure("ci_cd", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2">Add a Service</h5>
                    <div className="flex items-center gap-2">
                      <Input
                        id="new-service"
                        placeholder="Add service"
                        className="h-8 bg-primary-background"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => {
                          const inputEl = document.getElementById(
                            "new-service"
                          ) as HTMLInputElement;
                          if (inputEl && inputEl.value) {
                            addInfrastructureService(inputEl.value);
                            inputEl.value = "";
                          }
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
