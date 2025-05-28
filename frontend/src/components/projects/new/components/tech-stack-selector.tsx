"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PREDEFINED_TECH_OPTIONS } from "../constants";
// Comprehensive technology options

interface TechStackSelectorProps {
  selectedTech: string[];
  onChange: (technologies: string[]) => void;
}

export function TechStackSelector({
  selectedTech,
  onChange,
}: TechStackSelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter technologies based on input and exclude already selected ones
  // Prioritize technologies that start with the input (prefix match)
  const filteredSuggestions = (() => {
    if (inputValue.trim().length === 0) return [];

    const input = inputValue.toLowerCase();
    const available = PREDEFINED_TECH_OPTIONS.filter(
      (tech) => !selectedTech.includes(tech)
    );

    // Technologies that start with the input (prefix match)
    const prefixMatches = available.filter((tech) =>
      tech.toLowerCase().startsWith(input)
    );

    // Technologies that contain the input but don't start with it
    const containsMatches = available.filter(
      (tech) =>
        tech.toLowerCase().includes(input) &&
        !tech.toLowerCase().startsWith(input)
    );

    // Combine prefix matches first, then contains matches, limit to 10
    return [...prefixMatches, ...containsMatches].slice(0, 10);
  })();

  // Auto-highlight first suggestion when suggestions appear
  useEffect(() => {
    if (showSuggestions && filteredSuggestions.length > 0) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [showSuggestions, filteredSuggestions.length]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [highlightedIndex]);

  // Add technology
  const handleAddTech = (techToAdd?: string) => {
    const tech = techToAdd || inputValue.trim();
    if (tech && !selectedTech.includes(tech)) {
      onChange([...selectedTech, tech]);
      setInputValue(""); // Clear input
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.trim().length > 0);
  };

  // Handle pressing Enter in the input
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        handleAddTech(filteredSuggestions[highlightedIndex]);
      } else if (inputValue.trim()) {
        handleAddTech();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setHighlightedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  // Remove a technology
  const handleRemoveTech = (techToRemove: string) => {
    onChange(selectedTech.filter((tech) => tech !== techToRemove));
  };

  // Handle suggestion click
  const handleSuggestionClick = (tech: string) => {
    handleAddTech(tech);
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

      <div className="relative">
        <div className="flex">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              placeholder="Search and add technology"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onFocus={() => setShowSuggestions(inputValue.trim().length > 0)}
              onBlur={(e) => {
                // Only hide if blur is not moving to a suggestion button
                const relatedTarget = e.relatedTarget as HTMLElement;
                if (
                  !relatedTarget ||
                  !relatedTarget.closest("[data-suggestions-dropdown]")
                ) {
                  setTimeout(() => {
                    setShowSuggestions(false);
                    setHighlightedIndex(-1);
                  }, 100);
                }
              }}
              className="flex h-10 w-full rounded-md border border-input bg-primary-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              autoComplete="off"
            />

            {/* Suggestions dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div
                ref={dropdownRef}
                data-suggestions-dropdown
                className="absolute top-full left-0 right-0 z-50 mt-1 bg-secondary-background border border-divider rounded-md shadow-lg max-h-[200px] overflow-y-auto"
              >
                {filteredSuggestions.map((tech, index) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => handleSuggestionClick(tech)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      index === highlightedIndex
                        ? "bg-hover-active text-white font-semibold"
                        : "hover:bg-hover-active"
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => handleAddTech()}
            disabled={!inputValue.trim()}
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
