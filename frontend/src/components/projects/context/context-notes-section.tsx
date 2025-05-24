"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  StickyNote,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Note {
  id: string;
  content: string;
  createdAt: Date;
}

interface ContextNotesSectionProps {
  contextNotes: string;
  onNotesChange: (notes: string) => void;
  onGenerateContext: () => void;
  isLoading: boolean;
}

export function ContextNotesSection({
  contextNotes,
  onNotesChange,
  isLoading,
  onGenerateContext,
}: ContextNotesSectionProps) {
  // Parse notes from JSON string or create empty array
  const parseNotes = (notesString: string): Note[] => {
    if (!notesString.trim()) return [];
    try {
      return JSON.parse(notesString);
    } catch {
      // If it's not JSON, treat as legacy single note
      return notesString.trim()
        ? [
            {
              id: Date.now().toString(),
              content: notesString,
              createdAt: new Date(),
            },
          ]
        : [];
    }
  };

  const [notes, setNotes] = useState<Note[]>(parseNotes(contextNotes));
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  // Update notes when contextNotes prop changes (from API fetch)
  useEffect(() => {
    if (contextNotes !== undefined) {
      setNotes(parseNotes(contextNotes));
    }
  }, [contextNotes]);

  const saveNotesToBackend = (updatedNotes: Note[]) => {
    const notesJson = JSON.stringify(updatedNotes);
    onNotesChange(notesJson);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      createdAt: new Date(),
    };

    const updatedNotes = [...notes, note];
    setNotes(updatedNotes);
    setNewNote("");
    saveNotesToBackend(updatedNotes);
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
    saveNotesToBackend(updatedNotes);
  };

  const handleEditNote = (id: string, content: string) => {
    setEditingId(id);
    setEditingContent(content);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingContent.trim()) return;

    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, content: editingContent.trim() } : note
    );
    setNotes(updatedNotes);
    setEditingId(null);
    setEditingContent("");
    saveNotesToBackend(updatedNotes);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      action();
    }
  };

  return (
    <Card className="bg-secondary-background border-divider">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-text" />
          <h3 className="text-base sm:text-lg font-semibold text-primary-text">
            Context Notes
          </h3>
          {notes.length > 0 && (
            <span className="text-xs bg-hover-active text-secondary-text px-2 py-1 rounded-full">
              {notes.length} note{notes.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-secondary-text">
          Add specific requirements, constraints, or context that will help
          generate better development guidance.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add new note */}
        <div className="space-y-2">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, handleAddNote)}
            placeholder="e.g., 'Use TypeScript with strict mode', 'Follow existing authentication patterns', 'Ensure mobile responsiveness'..."
            className="min-h-20 bg-primary-background border-divider focus:border-primary-cta resize-none text-sm"
            disabled={isLoading}
          />
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="text-xs text-secondary-text">
              💡 Tip: Press{" "}
              <kbd className="px-1 py-0.5 bg-hover-active rounded text-xs">
                Cmd/Ctrl + Enter
              </kbd>{" "}
              to save
            </span>
            <Button
              onClick={handleAddNote}
              disabled={!newNote.trim() || isLoading}
              size="sm"
              className="bg-hover-active text-white hover:bg-cta-hover hover:text-black w-full sm:w-auto"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Note
            </Button>
          </div>
        </div>

        {/* Existing notes */}
        {notes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-primary-text">
              Saved Notes
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-primary-background border border-divider rounded-lg p-3 space-y-2"
                >
                  {editingId === note.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        onKeyDown={(e) =>
                          handleKeyDown(e, () => handleSaveEdit(note.id))
                        }
                        className="min-h-16 bg-secondary-background border-divider focus:border-primary-cta resize-none text-sm"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={handleCancelEdit}
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() => handleSaveEdit(note.id)}
                          disabled={!editingContent.trim()}
                          size="sm"
                          className="h-7 px-2 bg-primary-cta hover:bg-cta-hover text-black"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-primary-text">
                        {note.content}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-secondary-text">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            onClick={() =>
                              handleEditNote(note.id, note.content)
                            }
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-hover-active"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteNote(note.id)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-destructive/20 hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Generate Button */}
        <div className="flex justify-start">
          <Button
            disabled={isLoading}
            size="lg"
            onClick={() => onGenerateContext()}
            className="bg-primary-cta hover:bg-cta-hover text-black font-medium px-4 sm:px-8 w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                <span className="hidden sm:inline">Generating Context...</span>
                <span className="sm:hidden">Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Generate AI Context</span>
                <span className="sm:hidden">Generate Context</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
