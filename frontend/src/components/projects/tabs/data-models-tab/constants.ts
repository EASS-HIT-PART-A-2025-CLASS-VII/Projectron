// Type color codes - minimal for aesthetics
export const typeColors: Record<string, string> = {
  string: "text-blue-400",
  number: "text-amber-400",
  integer: "text-amber-400",
  boolean: "text-green-400",
  array: "text-violet-400",
  object: "text-red-400",
  date: "text-cyan-400",
  datetime: "text-cyan-400",
  default: "text-secondary-text",
};

// Available property types for editing
export const availableTypes = [
  "string",
  "number",
  "integer",
  "boolean",
  "array",
  "object",
  "date",
  "datetime",
  "email",
  "url",
  "uuid",
  "enum",
  "reference",
];

// For relationship badges
export const relationshipTypeColors: Record<string, string> = {
  "one-to-one": "border-blue-400/30 text-blue-400",
  "one-to-many": "border-green-400/30 text-green-400",
  "many-to-one": "border-amber-400/30 text-amber-400",
  "many-to-many": "border-violet-400/30 text-violet-400",
  default: "border-divider text-secondary-text",
};

// Available relationship types for editing
export const relationshipTypes = [
  "one-to-one",
  "one-to-many",
  "many-to-one",
  "many-to-many",
];
