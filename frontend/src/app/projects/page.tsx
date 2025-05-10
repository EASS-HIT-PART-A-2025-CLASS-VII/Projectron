"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getProjects } from "@/lib/projects";
import { ProjectListItem } from "@/types";
import { ProjectsList } from "@/components/projects/projects-list";
import { SearchProjects } from "@/components/projects/search-projects";
import { Button } from "@/components/ui/button";
import { AlertCircle, PlusCircle, Router } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { capitalizeWords } from "@/lib/utils";
import { AppLayout } from "@/components/layout/app-layout";
import { useRouter } from "next/navigation";

// Loading skeleton for projects grid
function ProjectsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-64 w-full rounded-lg" />
      ))}
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectListItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  // Fetch projects on component mount
  useEffect(() => {
    async function fetchProjects() {
      if (authLoading) return;
      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to login...");
        router.push("/auth/login");
        return;
      }

      try {
        setIsLoading(true);
        const projectsData = await getProjects();
        console.log(projectsData);
        setProjects(projectsData);
        setFilteredProjects(projectsData);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Failed to load projects. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, [isAuthenticated, authLoading]);

  // Apply filters and search
  useEffect(() => {
    let result = [...projects];

    // Apply status filter if not "all"
    if (statusFilter !== "all") {
      result = result.filter((project) => project.status === statusFilter);
    }

    setFilteredProjects(result);
  }, [projects, statusFilter]);

  // Handle search functionality
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      // Just apply status filter
      let result = [...projects];
      if (statusFilter !== "all") {
        result = result.filter((project) => project.status === statusFilter);
      }
      setFilteredProjects(result);
      return;
    }

    // Apply both search and status filter
    let result = projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query.toLowerCase()) ||
        project.description.toLowerCase().includes(query.toLowerCase())
    );

    if (statusFilter !== "all") {
      result = result.filter((project) => project.status === statusFilter);
    }

    setFilteredProjects(result);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-2 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Projects</h1>
          {user && (
            <p className="text-secondary-text">
              Welcome back, {capitalizeWords(user.full_name)}
            </p>
          )}
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:w-64">
              <SearchProjects onSearch={handleSearch} />
            </div>

            <Select
              value={statusFilter}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-full sm:w-40 bg-secondary-background border-divider">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-secondary-background border-divider">
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Link href="/projects/new">
            <Button variant="outline" className="gradient-border w-fit">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <ProjectsLoadingSkeleton />
        ) : (
          <ProjectsList projects={filteredProjects} />
        )}
      </div>
    </AppLayout>
  );
}
