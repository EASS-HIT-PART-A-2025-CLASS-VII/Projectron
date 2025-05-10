"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Predefined technology options
const PREDEFINED_TECH_OPTIONS = [
  // Frontend
  "React",
  "Angular",
  "Vue.js",
  "Next.js",
  "Svelte",
  "TypeScript",
  "JavaScript",
  "HTML/CSS",
  "Tailwind CSS",
  "Material UI",

  // Backend
  "Node.js",
  "Express",
  "NestJS",
  "Django",
  "Flask",
  "Ruby on Rails",
  "Spring Boot",
  "ASP.NET Core",
  "FastAPI",

  // Database
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "SQLite",
  "Redis",
  "Firebase",
  "DynamoDB",

  // Mobile
  "React Native",
  "Flutter",
  "Swift",
  "Kotlin",

  // DevOps/Infra
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "Google Cloud",
  "Vercel",
  "Netlify",

  // Other
  "GraphQL",
  "REST API",
  "WebSockets",
  "TensorFlow",
  "PyTorch",
];

interface TechStackSelectorProps {
  selectedTech: string[];
  onChange: (technologies: string[]) => void;
}

export function TechStackSelector({
  selectedTech,
  onChange,
}: TechStackSelectorProps) {
  const [customTech, setCustomTech] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    undefined
  );

  // Filter out already selected technologies
  const availableTechOptions = PREDEFINED_TECH_OPTIONS.filter(
    (tech) => !selectedTech.includes(tech)
  ).sort();

  // Add a technology from the dropdown
  const handleAddSelectedTech = () => {
    if (selectedOption && !selectedTech.includes(selectedOption)) {
      onChange([...selectedTech, selectedOption]);
      setSelectedOption(undefined); // Reset selection
    }
  };

  // Add a custom technology
  const handleAddCustomTech = () => {
    if (customTech.trim() && !selectedTech.includes(customTech.trim())) {
      onChange([...selectedTech, customTech.trim()]);
      setCustomTech(""); // Clear input
    }
  };

  // Handle pressing Enter in the custom tech input
  const handleCustomTechKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && customTech.trim()) {
      e.preventDefault();
      handleAddCustomTech();
    }
  };

  // Remove a technology
  const handleRemoveTech = (techToRemove: string) => {
    onChange(selectedTech.filter((tech) => tech !== techToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 min-h-[36px]">
        {selectedTech.map((tech) => (
          <Badge
            key={tech}
            variant="secondary"
            className="bg-secondary-background border border-divider py-1.5 px-2.5"
          >
            {tech}
            <button
              type="button"
              onClick={() => handleRemoveTech(tech)}
              className="ml-1.5 text-secondary-text hover:text-primary-text focus:outline-none"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Badge>
        ))}
        {selectedTech.length === 0 && (
          <p className="text-secondary-text text-sm">
            No technologies selected
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Predefined tech dropdown */}
        <div className="flex">
          <Select value={selectedOption} onValueChange={setSelectedOption}>
            <SelectTrigger
              className="bg-primary-background flex-1"
              aria-label="Select technology"
            >
              <SelectValue placeholder="Select technology" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {availableTechOptions.length > 0 ? (
                availableTechOptions.map((tech) => (
                  <SelectItem key={tech} value={tech}>
                    {tech}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-secondary-text text-center text-sm">
                  All predefined options selected
                </div>
              )}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="sm"
            onClick={handleAddSelectedTech}
            disabled={!selectedOption}
            className="ml-2 text-primary-cta/90 hover:text-primary-cta border border-divider hover:bg-secondary-background h-10"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Custom tech input */}
        <div className="flex">
          <Input
            placeholder="Add custom technology"
            value={customTech}
            onChange={(e) => setCustomTech(e.target.value)}
            onKeyDown={handleCustomTechKeyDown}
            className="bg-primary-background flex-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddCustomTech}
            disabled={!customTech.trim()}
            className="ml-2 text-primary-cta/90 hover:text-primary-cta border border-divider hover:bg-secondary-background h-10"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
