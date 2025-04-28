"use client";

import { FolderIcon, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EmptyProjects() {
  return (
    <div className="flex flex-col items-center justify-center p-8 py-16 text-center border border-divider rounded-lg bg-secondary-background">
      <div className="mb-4 rounded-full bg-hover-active p-3">
        <FolderIcon className="h-10 w-10 text-primary-cta" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">No projects yet</h3>
      <p className="mb-6 text-secondary-text">
        Create your first project to get started with Projectron
      </p>
      <Link href="/projects/new">
        <Button variant="outline" className="flex items-center">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create a Project
        </Button>
      </Link>
    </div>
  );
}
