"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Project } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Layers,
  ServerCrash,
  Database,
  Layout,
  ListTodo,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { HighLevelPlanTab } from "./tabs/high-level-plan-tab/index";
import { ArchitectureTab } from "./tabs/architecture-tab/index";
import { ApiEndpointsTab } from "./tabs/api-endpoints-tab/index";
import { DataModelsTab } from "./tabs/data-models-tab/index";
import { UIComponentsTab } from "./tabs/ui_components-tab/index";
import { ImplementationPlanTab } from "./tabs/implementation_plan_tab/index";
interface ProjectTabsProps {
  project: Project;
}

// Tab definition type
type TabDefinition = {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
};

export function ProjectTabs({ project }: ProjectTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get tab from URL query or default to "high-level-plan"
  const defaultTab = searchParams?.get("tab") || "high-level-plan";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [previousTab, setPreviousTab] = useState(defaultTab);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setPreviousTab(activeTab);
    setActiveTab(value);
    // Create new URLSearchParams
    const params = new URLSearchParams(searchParams?.toString());
    params.set("tab", value);
    // Update URL without reloading the page
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Define animation direction based on tab change
  const getAnimationDirection = (tabId: string) => {
    // Find the indices of the previous and current tabs
    const tabs = tabDefinitions.map((tab) => tab.id);
    const prevIndex = tabs.indexOf(previousTab);
    const currIndex = tabs.indexOf(tabId);

    // Determine direction of animation (left to right or right to left)
    return prevIndex < currIndex ? 1 : -1;
  };

  // Define tabs with their content placeholders
  const tabDefinitions: TabDefinition[] = [
    {
      id: "high-level-plan",
      label: "High-level Plan",
      icon: <FileText className="h-4 w-4" />,
      content: <HighLevelPlanTab project={project} />,
    },
    {
      id: "architecture",
      label: "Architecture",
      icon: <Layers className="h-4 w-4" />,
      content: <ArchitectureTab project={project} />,
    },
    {
      id: "api-endpoints",
      label: "API Endpoints",
      icon: <ServerCrash className="h-4 w-4" />,
      content: <ApiEndpointsTab project={project} />,
    },
    {
      id: "data-models",
      label: "Data Models",
      icon: <Database className="h-4 w-4" />,
      content: <DataModelsTab project={project} />,
    },
    {
      id: "ui-components",
      label: "UI Components",
      icon: <Layout className="h-4 w-4" />,
      content: <UIComponentsTab project={project} />,
    },
    {
      id: "implementation-plan",
      label: "Implementation Plan",
      icon: <ListTodo className="h-4 w-4" />,
      content: <ImplementationPlanTab project={project} />,
    },
    {
      id: "diagrams",
      label: "Diagrams",
      icon: <GitBranch className="h-4 w-4" />,
      content: (
        <div className="p-6 border border-divider rounded-lg bg-secondary-background">
          <h3 className="text-xl font-semibold mb-4">Technical Diagrams</h3>
          <p className="text-secondary-text">
            This will display sequence, class, and activity diagrams. The
            detailed implementation will be added in a separate component.
          </p>
        </div>
      ),
    },
  ];

  // We'll add a custom underline indicator for the active tab
  const [tabRects, setTabRects] = useState<{ [key: string]: DOMRect | null }>(
    {}
  );

  // Recalculate tab dimensions on resize
  useEffect(() => {
    const updateTabRects = () => {
      const newRects: { [key: string]: DOMRect | null } = {};
      tabDefinitions.forEach((tab) => {
        const element = document.getElementById(`tab-${tab.id}`);
        newRects[tab.id] = element?.getBoundingClientRect() || null;
      });
      setTabRects(newRects);
    };

    // Initial calculation
    updateTabRects();

    // Add resize listener
    window.addEventListener("resize", updateTabRects);

    // Cleanup
    return () => window.removeEventListener("resize", updateTabRects);
  }, []);

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full space-y-6 relative"
    >
      {/* Sleek tabs with custom styling */}
      <div className="relative">
        <ScrollArea className="w-full whitespace-nowrap border-b border-divider">
          <TabsList className="w-full h-auto p-0 bg-transparent relative flex justify-start border-none">
            {tabDefinitions.map((tab) => (
              <TabsTrigger
                id={`tab-${tab.id}`}
                key={tab.id}
                value={tab.id}
                className={cn(
                  "py-3 px-4 flex items-center gap-2 relative",
                  "transition-all duration-200 rounded-none",
                  "focus:ring-0 focus:ring-offset-0",
                  "data-[state=active]:text-primary-text",
                  "data-[state=active]:font-medium",
                  "hover:bg-hover-active/30",
                  "data-[state=active]:bg-transparent",
                  "border-none shadow-none outline-none" // Remove all borders and outlines
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-2 transition-all duration-300",
                    activeTab === tab.id
                      ? "text-primary-text"
                      : "text-secondary-text"
                  )}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </div>

                {/* Custom glowing active indicator */}
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-cta"
                    layoutId="activeTabIndicator"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Animated tab content */}
      <AnimatePresence mode="wait">
        {tabDefinitions.map(
          (tab) =>
            activeTab === tab.id && (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, x: 20 * getAnimationDirection(tab.id) }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 * getAnimationDirection(tab.id) }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  opacity: { duration: 0.2 },
                }}
                className="focus-visible:outline-none focus-visible:ring-0 relative"
              >
                <TabsContent
                  value={tab.id}
                  className="mt-6 focus-visible:outline-none focus-visible:ring-0 m-0"
                  forceMount
                >
                  {tab.content}
                </TabsContent>
              </motion.div>
            )
        )}
      </AnimatePresence>
    </Tabs>
  );
}
