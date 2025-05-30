"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchProjectsProps {
  onSearch: (query: string) => void;
}

export function SearchProjects({ onSearch }: SearchProjectsProps) {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-text" />
      <Input
        className="pl-9 bg-secondary-background text-primary-text border-divider"
        placeholder="Search projects..."
        value={query}
        onChange={handleChange}
      />
    </div>
  );
}
