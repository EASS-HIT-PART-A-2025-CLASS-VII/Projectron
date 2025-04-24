// src/components/sections/projectron-planning.tsx
import {
  CheckCircle,
  Code,
  BrainCircuit,
  ListChecks,
  Layers,
  Users,
  FileJson,
  Database,
  Palette,
  BarChart3,
  BadgeCheck,
} from "lucide-react";

const ProjectronPlanning = () => (
  <div className="space-y-8">
    <div className="text-xl font-semibold mb-6 primary-text flex items-center">
      <div className="w-8 h-8 bg-opacity-20 rounded-full flex items-center justify-center mr-3">
        <CheckCircle className="primary-text w-5 h-5" />
      </div>
      The Projectron Way
    </div>
    {/* Solution 2: Embedded Context */}
    <div className="p-6 bg-secondary-background rounded-lg shadow-md border-l-4 border-hover-active transition-all duration-300 hover:shadow-lg">
      <h3 className="text-lg font-medium mb-3 text-primary-text flex items-center border-b border-divider pb-3">
        <BrainCircuit className="text-primary-cta mr-3 w-5 h-5" />
        <span>Embedded Context for AI Coding</span>
      </h3>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex flex-col justify-center order-2 md:order-1">
          <div className="text-primary-cta font-semibold mb-2">
            The Solution:
          </div>
          <p className="text-primary-text">
            By embedding the entire implementation plan as shared context, the
            assistant "knows" your project's structure from the start
          </p>
          <div className="mt-4 flex items-center text-sm text-primary-text">
            <span className="inline-block w-2 h-2 bg-primary-cta rounded-full mr-2"></span>
            <span>No repetitive explanations needed</span>
          </div>
          <div className="mt-2 flex items-center text-sm text-primary-text">
            <span className="inline-block w-2 h-2 bg-primary-cta rounded-full mr-2"></span>
            <span>AI provides context-aware suggestions</span>
          </div>
        </div>

        <div className="font-mono bg-black bg-opacity-60 rounded-lg border border-hover-active border-opacity-30 shadow-inner flex-1 overflow-hidden order-1 md:order-2">
          <div className="flex items-center text-xs text-secondary-text p-2 bg-black bg-opacity-50 border-b border-divider">
            <BrainCircuit className="w-4 h-4 mr-2 text-primary-cta" />
            <span>ai-context-setup.ts</span>
          </div>

          <div className="p-4 text-sm text-primary-text whitespace-pre-wrap">
            <div className="opacity-70">
              // One-time project setup with persistent context
            </div>
            <div className="mt-1">
              Projectron.<span className="text-green-400">setupAIContext</span>
              (projectPlan);
            </div>

            <div className="mt-4 opacity-70">
              // Every AI session now has full context
            </div>
            <div className="bg-green-500 bg-opacity-10 p-3 rounded-lg mt-1 border-l-2 border-hover-active">
              aiAssistant.
              <span className="text-green-400">createComponent</span>(
              <span className="text-yellow-400">"TaskList"</span>);
            </div>

            <div className="mt-3 opacity-70">
              // Assistant already knows your:
            </div>
            <div className="mt-2 flex items-center">
              <span className="text-primary-cta mr-2">•</span>
              <span>Architecture decisions</span>
            </div>
            <div className="mt-1 flex items-center">
              <span className="text-primary-cta mr-2">•</span>
              <span>Component hierarchy</span>
            </div>
            <div className="mt-1 flex items-center">
              <span className="text-primary-cta mr-2">•</span>
              <span>API endpoints</span>
            </div>
            <div className="mt-1 flex items-center">
              <span className="text-primary-cta mr-2">•</span>
              <span>Data models</span>
            </div>
            <div className="mt-1 flex items-center">
              <span className="text-primary-cta mr-2">•</span>
              <span>UI design guidelines</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Solution 3: Actionable Tasks */}
    <div className="p-6 bg-secondary-background rounded-lg shadow-md border-l-4 border-hover-active transition-all duration-300 hover:shadow-lg">
      <h3 className="text-lg font-medium mb-3 text-primary-text flex items-center border-b border-divider pb-3">
        <ListChecks className="text-primary-cta mr-3 w-5 h-5" />
        <span>Detailed, Trackable Task Breakdown</span>
      </h3>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="bg-black bg-opacity-60 rounded-lg border border-hover-active border-opacity-30 shadow-inner flex-1 overflow-hidden">
          <div className="flex items-center text-xs text-secondary-text p-2 bg-black bg-opacity-50 border-b border-divider">
            <ListChecks className="w-4 h-4 mr-2 text-primary-cta" />
            <span>implementation-plan.tsx</span>
          </div>

          <div className="p-4">
            <div className="text-sm font-medium mb-4 text-primary-text flex items-center">
              <span className="inline-block w-3 h-3 bg-primary-cta rounded-full mr-2"></span>
              Implementation Plan
            </div>

            <div className="space-y-3">
              <div className="bg-black bg-opacity-30 p-3 rounded-lg flex items-center">
                <input
                  type="checkbox"
                  checked
                  className="mr-3 accent-primary-cta w-4 h-4"
                  readOnly
                />
                <div>
                  <span className="text-sm text-primary-text">
                    Set up Next.js project with TypeScript configuration
                  </span>
                  <div className="text-xs text-secondary-text mt-1">
                    <span className="inline-block px-2 py-0.5 bg-hover-active bg-opacity-20 rounded text-text-primary mr-2">
                      Foundation
                    </span>
                    <span>Est. 2 hours</span>
                  </div>
                </div>
              </div>

              <div className="bg-black bg-opacity-30 p-3 rounded-lg flex items-center">
                <input
                  type="checkbox"
                  checked
                  className="mr-3 accent-primary-cta w-4 h-4"
                  readOnly
                />
                <div>
                  <span className="text-sm text-primary-text">
                    Create authentication context provider
                  </span>
                  <div className="text-xs text-secondary-text mt-1">
                    <span className="inline-block px-2 py-0.5 bg-hover-active rounded text-text-primary mr-2">
                      Auth
                    </span>
                    <span>Est. 3 hours</span>
                  </div>
                </div>
              </div>

              <div className="bg-black bg-opacity-30 p-3 rounded-lg flex items-center opacity-80">
                <input
                  type="checkbox"
                  className="mr-3 accent-primary-cta w-4 h-4"
                  readOnly
                />
                <div>
                  <span className="text-sm text-primary-text">
                    Implement user registration form with validation
                  </span>
                  <div className="text-xs text-secondary-text mt-1">
                    <span className="inline-block px-2 py-0.5 bg-hover-active rounded text-text-primary mr-2">
                      Auth
                    </span>
                    <span>Est. 4 hours</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-primary-text p-2">
                <span className="text-primary-cta">+27 </span>
                actionable tasks
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="text-primary-cta font-semibold mb-2">
            The Solution:
          </div>
          <p className="text-primary-text">
            The planner breaks the roadmap into detailed, ordered milestones and
            developer tasks, making it easy to track progress
          </p>
          <div className="mt-4 flex items-center text-sm text-primary-text">
            <span className="inline-block w-2 h-2 bg-primary-cta rounded-full mr-2"></span>
            <span>Clear, executable tasks with estimates</span>
          </div>
          <div className="mt-2 flex items-center text-sm text-primary-text">
            <span className="inline-block w-2 h-2 bg-primary-cta rounded-full mr-2"></span>
            <span>Categorized and prioritized automatically</span>
          </div>
          <div className="mt-2 flex items-center text-sm text-primary-text">
            <span className="inline-block w-2 h-2 bg-primary-cta rounded-full mr-2"></span>
            <span>Progress tracking built-in</span>
          </div>
        </div>
      </div>
    </div>

    {/* Solution 4: Unified Workspace */}
    <div className="p-6 bg-secondary-background rounded-lg shadow-md border-l-4 border-hover-active transition-all duration-300 hover:shadow-lg">
      <h3 className="text-lg font-medium mb-3 text-primary-text flex items-center border-b border-divider pb-3">
        <Layers className="text-primary-cta mr-3 w-5 h-5" />
        <span>Single Source of Truth</span>
      </h3>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 flex flex-col justify-center order-2 md:order-1">
          <div className="text-primary-cta font-semibold mb-2">
            The Solution:
          </div>
          <p className="text-primary-text">
            All diagrams, API specs, data models and UI component outlines are
            generated together—ensuring consistency
          </p>
          <div className="mt-4 flex items-center text-sm text-primary-text">
            <span className="inline-block w-2 h-2 bg-primary-cta rounded-full mr-2"></span>
            <span>No synchronization issues between tools</span>
          </div>
          <div className="mt-2 flex items-center text-sm text-primary-text">
            <span className="inline-block w-2 h-2 bg-primary-cta rounded-full mr-2"></span>
            <span>Everything updates together when changes occur</span>
          </div>
          <div className="mt-2 flex items-center text-sm text-primary-text">
            <span className="inline-block w-2 h-2 bg-primary-cta rounded-full mr-2"></span>
            <span>Single platform for all project artifacts</span>
          </div>
        </div>

        <div className="bg-black bg-opacity-60 rounded-lg border border-hover-active border-opacity-30 shadow-inner flex-1 overflow-hidden order-1 md:order-2">
          <div className="flex items-center text-xs text-secondary-text p-2 bg-black bg-opacity-50 border-b border-divider">
            <Layers className="w-4 h-4 mr-2 text-primary-cta" />
            <span>unified-workspace.tsx</span>
          </div>

          <div className="divide-y divide-divider">
            <div className="p-3 flex items-center justify-between transition-all hover:bg-black hover:bg-opacity-40">
              <div className="flex items-center">
                <FileJson className="text-primary-cta w-5 h-5 mr-3" />
                <span className="text-primary-text">Architecture Diagram</span>
              </div>
              <span className="text-xs text-primary-cta px-2 py-1 bg-hover-active bg-opacity-10 rounded">
                Projectron
              </span>
            </div>

            <div className="p-3 flex items-center justify-between transition-all hover:bg-black hover:bg-opacity-40">
              <div className="flex items-center">
                <Code className="text-primary-cta w-5 h-5 mr-3" />
                <span className="text-primary-text">API Documentation</span>
              </div>
              <span className="text-xs text-primary-cta px-2 py-1 bg-hover-active bg-opacity-10 rounded">
                Projectron
              </span>
            </div>

            <div className="p-3 flex items-center justify-between transition-all hover:bg-black hover:bg-opacity-40">
              <div className="flex items-center">
                <Database className="text-primary-cta w-5 h-5 mr-3" />
                <span className="text-primary-text">Data Models</span>
              </div>
              <span className="text-xs text-primary-cta px-2 py-1 bg-hover-active bg-opacity-10 rounded">
                Projectron
              </span>
            </div>

            <div className="p-3 flex items-center justify-between transition-all hover:bg-black hover:bg-opacity-40">
              <div className="flex items-center">
                <Palette className="text-primary-cta w-5 h-5 mr-3" />
                <span className="text-primary-text">UI Components</span>
              </div>
              <span className="text-xs text-primary-cta px-2 py-1 bg-hover-active bg-opacity-10 rounded">
                Projectron
              </span>
            </div>

            <div className="p-3 flex items-center justify-between transition-all hover:bg-black hover:bg-opacity-40">
              <div className="flex items-center">
                <BarChart3 className="text-primary-cta w-5 h-5 mr-3" />
                <span className="text-primary-text">Task Tracking</span>
              </div>
              <span className="text-xs text-primary-cta px-2 py-1 bg-hover-active bg-opacity-10 rounded">
                Projectron
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Solution 5: Easy Onboarding */}
    <div className="p-6 bg-secondary-background rounded-lg shadow-md border-l-4 border-hover-active transition-all duration-300 hover:shadow-lg">
      <h3 className="text-lg font-medium mb-3 text-primary-text flex items-center border-b border-divider pb-3">
        <Users className="text-primary-cta mr-3 w-5 h-5" />
        <span>Instant Onboarding for New Team Members</span>
      </h3>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="bg-black bg-opacity-60 rounded-lg border border-hover-active border-opacity-30 shadow-inner flex-1 overflow-hidden">
          <div className="flex items-center text-xs text-secondary-text p-2 bg-black bg-opacity-50 border-b border-divider">
            <Users className="w-4 h-4 mr-2 text-primary-cta" />
            <span>hierarchical-overview.tsx</span>
          </div>

          <div className="p-4">
            <div className="text-sm font-medium mb-4 text-primary-text flex items-center">
              <span className="inline-block w-3 h-3 bg-primary-cta rounded-full mr-2"></span>
              Hierarchical Project Overview
            </div>

            <div className="space-y-3 text-sm text-primary-text">
              <div className="bg-hover-active bg-opacity-10 p-3 rounded-lg flex items-start">
                <BadgeCheck className="text-primary-cta mr-3 w-5 h-5" />

                <div>
                  <span className="font-medium">High-Level Overview</span>
                  <p className="text-xs mt-1 text-secondary-text">
                    Project goals, vision, and business requirements
                  </p>
                </div>
              </div>

              <div className="bg-hover-active bg-opacity-10 p-3 rounded-lg flex items-start">
                <BadgeCheck className="text-primary-cta mr-3 w-5 h-5" />

                <div>
                  <span className="font-medium">Architecture</span>
                  <p className="text-xs mt-1 text-secondary-text">
                    System design decisions and technical structure
                  </p>
                </div>
              </div>

              <div className="bg-hover-active bg-opacity-10 p-3 rounded-lg flex items-start">
                <BadgeCheck className="text-primary-cta mr-3 w-5 h-5" />
                <div>
                  <span className="font-medium">Technical Details</span>
                  <p className="text-xs mt-1 text-secondary-text">
                    APIs, data models, and component specifications
                  </p>
                </div>
              </div>

              <div className="bg-hover-active bg-opacity-10 p-3 rounded-lg flex items-start">
                <BadgeCheck className="text-primary-cta mr-3 w-5 h-5" />

                <div>
                  <span className="font-medium">Implementation Plan</span>
                  <p className="text-xs mt-1 text-secondary-text">
                    Ready-to-go task list with dependencies
                  </p>
                </div>
              </div>

              <div className="bg-hover-active bg-opacity-10 p-3 rounded-lg flex items-start">
                <BadgeCheck className="text-primary-cta mr-3 w-5 h-5" />

                <div>
                  <span className="font-medium">Diagrams</span>
                  <p className="text-xs mt-1 text-secondary-text">
                    Visual representations of all key concepts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="text-primary-cta font-semibold mb-2">
            The Solution:
          </div>
          <p className="text-primary-text">
            A comprehensive hierarchy gives newcomers instant clarity on goals,
            design decisions and where to jump in
          </p>
          <div className="mt-4 flex items-center text-sm text-primary-text">
            <span className="inline-block w-2 h-2 bg-primary-cta rounded-full mr-2"></span>
            <span>Self-service onboarding for new team members</span>
          </div>
          <div className="mt-2 flex items-center text-sm text-primary-text">
            <span className="inline-block w-2 h-2 bg-primary-cta rounded-full mr-2"></span>
            <span>Immediate productivity with minimal questions</span>
          </div>
          <div className="mt-2 flex items-center text-sm text-primary-text">
            <span className="inline-block w-2 h-2 bg-primary-cta rounded-full mr-2"></span>
            <span>Reduce tribal knowledge dependencies</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProjectronPlanning;
