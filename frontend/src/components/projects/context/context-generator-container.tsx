"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Project } from "@/types";
import {
  getContextNotes,
  updateContextNotes,
  generateContext,
  getLatestContext,
} from "@/lib/context";
import { ContextNotesSection } from "./context-notes-section";
import { GeneratedContextDisplay } from "./generated-context-display";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ContextGeneratorContainerProps {
  project: Project;
}

export function ContextGeneratorContainer({
  project,
}: ContextGeneratorContainerProps) {
  const [contextNotes, setContextNotes] = useState("");
  const [generatedContext, setGeneratedContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const { toast } = useToast();

  // Load context notes on mount
  useEffect(() => {
    async function loadContextNotes() {
      try {
        setIsLoadingNotes(true);
        const response = await getContextNotes(project.id);
        setContextNotes(response.context_notes || "");
      } catch (error) {
        console.error("Failed to load context notes:", error);
      } finally {
        setIsLoadingNotes(false);
      }
    }

    loadContextNotes();
  }, [project.id]);

  // Load latest context on mount
  useEffect(() => {
    async function loadLatestContext() {
      try {
        const response = await getLatestContext(project.id);
        if (response.success && response.context_message) {
          setGeneratedContext(response.context_message);
        }
      } catch (error) {
        // It's okay if there's no latest context - user hasn't generated one yet
        console.log("No latest context found, which is fine");
      }
    }

    loadLatestContext();
  }, [project.id]);

  const handleNotesChange = async (notes: string) => {
    setContextNotes(notes);

    try {
      await updateContextNotes(project.id, notes);
    } catch (error) {
      console.error("Failed to save context notes:", error);
      toast({
        title: "Error",
        description: "Failed to save context notes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateContext = async () => {
    setIsLoading(true);

    try {
      const response = await generateContext(project.id);

      if (response.success && response.context_message) {
        setGeneratedContext(response.context_message);
        toast({
          title: "Success",
          description: "Development context generated successfully!",
        });
      } else {
        throw new Error(response.error || "Failed to generate context");
      }
    } catch (error) {
      console.error("Failed to generate context:", error);
      toast({
        title: "Error",
        description: "Failed to generate context. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Context Notes Section */}
      <ContextNotesSection
        contextNotes={contextNotes}
        onNotesChange={handleNotesChange}
        isLoading={isLoadingNotes}
        onGenerateContext={handleGenerateContext}
      />

      {/* Generated Context Display */}
      {(generatedContext || isLoading) && (
        <GeneratedContextDisplay
          context={generatedContext}
          isLoading={isLoading}
        />
      )}

    </div>
  );
}
