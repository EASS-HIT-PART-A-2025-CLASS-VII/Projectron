"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";

interface JsonDisplayProps {
  data: any;
  maxHeight?: string;
  editable?: boolean;
  onEdit?: (newData: any) => void;
}

export function JsonDisplay({
  data,
  maxHeight,
  editable = false,
  onEdit,
}: JsonDisplayProps) {
  const [editing, setEditing] = useState(false);
  const [jsonStr, setJsonStr] = useState(JSON.stringify(data, null, 2));
  const [error, setError] = useState("");

  // Save JSON changes
  const saveChanges = () => {
    try {
      const parsed = JSON.parse(jsonStr);
      setError("");
      onEdit && onEdit(parsed);
      setEditing(false);
    } catch (err) {
      setError("Invalid JSON format");
    }
  };

  if (!editable) {
    return (
      <div
        className={`bg-primary-background rounded-md overflow-auto ${
          maxHeight ? `max-h-${maxHeight}` : ""
        }`}
      >
        <pre className="p-4 text-sm whitespace-pre-wrap">
          <code className="text-primary-text">
            {JSON.stringify(data, null, 2)}
          </code>
        </pre>
      </div>
    );
  }

  return (
    <div
      className={`bg-primary-background rounded-md overflow-auto ${
        maxHeight ? `max-h-${maxHeight}` : ""
      }`}
    >
      {editing ? (
        <div className="p-4">
          <Textarea
            value={jsonStr}
            onChange={(e) => setJsonStr(e.target.value)}
            rows={10}
            className="font-mono text-sm bg-hover-active/20 resize-none mb-2"
          />
          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setJsonStr(JSON.stringify(data, null, 2));
                setEditing(false);
                setError("");
              }}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={saveChanges}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <pre className="p-4 text-sm whitespace-pre-wrap">
            <code className="text-primary-text">
              {JSON.stringify(data, null, 2)}
            </code>
          </pre>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 p-1 h-8 w-8"
            onClick={() => setEditing(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
