// src/components/sections/traditional-planning.tsx
import {
  XCircle,
  FileText,
  RefreshCw,
  ListTodo,
  Package,
  Users,
} from "lucide-react";

const TraditionalPlanning = () => (
  <div className="space-y-8">
    <div className="text-xl font-semibold mb-6 text-primary-text flex items-center">
      <div className="w-8 h-8 bg-opacity-20 rounded-full flex items-center justify-center mr-3">
        <XCircle className="text-destructive w-5 h-5" />
      </div>
      The Old Way
    </div>

    {/* Pain Point 2: Context Resurfacing */}
    <div className="p-6 bg-hover-active bg-opacity-30 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
      <h3 className="text-lg font-medium mb-3 text-primary-text flex items-center border-b border-divider pb-3">
        <RefreshCw className="text-destructive mr-3 w-5 h-5" />
        <span>Wasted Time Re-surfacing Context</span>
      </h3>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex flex-col justify-center order-2 md:order-1">
          <div className="text-destructive font-semibold mb-2">
            The Problem:
          </div>
          <p className="text-primary-text">
            Every new coding session requires re-explaining your codebase and
            requirements to the AI assistant
          </p>
          <div className="mt-4 flex items-center text-sm text-secondary-text">
            <span className="inline-block w-2 h-2 bg-destructive rounded-full mr-2"></span>
            <span>Repetitive context-setting wastes time</span>
          </div>
          <div className="mt-2 flex items-center text-sm text-secondary-text">
            <span className="inline-block w-2 h-2 bg-destructive rounded-full mr-2"></span>
            <span>Context degradation between sessions</span>
          </div>
        </div>

        <div className="font-mono text-sm text-primary-text bg-black bg-opacity-40 p-4 rounded-lg overflow-hidden shadow-inner flex-1 order-1 md:order-2">
          <div className="mb-3 text-xs text-secondary-text border-b border-divider pb-2">
            AI Chat Session History
          </div>
          <div className="space-y-4">
            <div className="p-2 bg-black bg-opacity-40 rounded border-l-2 border-secondary-text">
              <div className="text-xs text-secondary-text mb-1">Day 1:</div>
              "I'm building a project management app with React frontend and
              FastAPI backend. How should I structure the components?"
            </div>

            <div className="p-2 bg-black bg-opacity-40 rounded border-l-2 border-secondary-text">
              <div className="text-xs text-secondary-text mb-1">Day 2:</div>
              "Let me re-explain my project. It's a project management app..."
            </div>

            <div className="p-2 bg-black bg-opacity-40 rounded border-l-2 border-secondary-text">
              <div className="text-xs text-secondary-text mb-1">Day 3:</div>
              "As I mentioned before, I'm working on a project management
              app..."
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Pain Point 3: Lack of Actionable Tasks */}
    <div className="p-6 bg-hover-active bg-opacity-30 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
      <h3 className="text-lg font-medium mb-3 text-primary-text flex items-center border-b border-divider pb-3">
        <ListTodo className="text-destructive mr-3 w-5 h-5" />
        <span>Lack of Actionable, Trackable Tasks</span>
      </h3>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="rounded border border-divider p-4 bg-black bg-opacity-30 flex-1 shadow-inner">
          <div className="flex items-center mb-3">
            <FileText className="text-secondary-text w-4 h-4 mr-2" />
            <div className="text-sm font-medium text-primary-text">
              Project Documentation.docx
            </div>
          </div>
          <div className="text-sm text-primary-text">
            <p className="p-2 bg-black bg-opacity-20 rounded mb-2">
              The system will include user authentication, project creation, and
              task tracking...
            </p>
            <p className="p-2 bg-black bg-opacity-20 rounded mb-2">
              We should implement the core features first, then add additional
              functionality...
            </p>
            <div className="p-2 bg-black bg-opacity-20 rounded text-secondary-text italic text-xs">
              [50 pages of high-level descriptions with no clear tasks or
              tracking]
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="text-destructive font-semibold mb-2">
            The Problem:
          </div>
          <p className="text-primary-text">
            High-level plans remain just documents—there's no clear task list or
            progress tracking
          </p>
          <div className="mt-4 flex items-center text-sm text-secondary-text">
            <span className="inline-block w-2 h-2 bg-destructive rounded-full mr-2"></span>
            <span>Documentation without implementation steps</span>
          </div>
          <div className="mt-2 flex items-center text-sm text-secondary-text">
            <span className="inline-block w-2 h-2 bg-destructive rounded-full mr-2"></span>
            <span>No way to track progress or assign work</span>
          </div>
        </div>
      </div>
    </div>

    {/* Pain Point 4: Fragmented Tooling */}
    <div className="p-6 bg-hover-active bg-opacity-30 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
      <h3 className="text-lg font-medium mb-3 text-primary-text flex items-center border-b border-divider pb-3">
        <Package className="text-destructive mr-3 w-5 h-5" />
        <span>Fragmented Tooling and Documentation</span>
      </h3>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="space-y-0 flex-1">
          <div className="group bg-black bg-opacity-30 rounded-lg overflow-hidden border border-divider">
            <div className="p-3 flex items-start justify-between bg-black bg-opacity-20 group-hover:bg-black group-hover:bg-opacity-40 transition-all">
              <div className="flex items-center">
                <FileText className="text-secondary-text w-4 h-4 mr-3" />
                <span className="text-primary-text">Architecture Diagram</span>
              </div>
              <span className="text-xs text-secondary-text px-2 py-1 bg-black bg-opacity-40 rounded">
                Lucidchart
              </span>
            </div>

            <div className="p-3 flex items-start justify-between bg-black bg-opacity-20 group-hover:bg-black group-hover:bg-opacity-40 transition-all">
              <div className="flex items-center">
                <RefreshCw className="text-secondary-text w-4 h-4 mr-3" />
                <span className="text-primary-text">API Documentation</span>
              </div>
              <span className="text-xs text-secondary-text px-2 py-1 bg-black bg-opacity-40 rounded">
                Postman
              </span>
            </div>

            <div className="p-3 flex items-start justify-between bg-black bg-opacity-20 group-hover:bg-black group-hover:bg-opacity-40 transition-all">
              <div className="flex items-center">
                <Package className="text-secondary-text w-4 h-4 mr-3" />
                <span className="text-primary-text">Data Models</span>
              </div>
              <span className="text-xs text-secondary-text px-2 py-1 bg-black bg-opacity-40 rounded">
                DB Designer
              </span>
            </div>

            <div className="p-3 flex items-start justify-between bg-black bg-opacity-20 group-hover:bg-black group-hover:bg-opacity-40 transition-all">
              <div className="flex items-center">
                <div className="text-secondary-text w-4 h-4 mr-3 flex items-center justify-center">
                  🎨
                </div>
                <span className="text-primary-text">UI Components</span>
              </div>
              <span className="text-xs text-secondary-text px-2 py-1 bg-black bg-opacity-40 rounded">
                Figma
              </span>
            </div>

            <div className="p-3 flex items-start justify-between bg-black bg-opacity-20 group-hover:bg-black group-hover:bg-opacity-40 transition-all">
              <div className="flex items-center">
                <ListTodo className="text-secondary-text w-4 h-4 mr-3" />
                <span className="text-primary-text">Task Tracking</span>
              </div>
              <span className="text-xs text-secondary-text px-2 py-1 bg-black bg-opacity-40 rounded">
                Jira
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="text-destructive font-semibold mb-2">
            The Problem:
          </div>
          <p className="text-primary-text">
            Tools and documentation are scattered across multiple platforms,
            leading to version drift and inconsistencies
          </p>
          <div className="mt-4 flex items-center text-sm text-secondary-text">
            <span className="inline-block w-2 h-2 bg-destructive rounded-full mr-2"></span>
            <span>Multiple logins and interfaces to manage</span>
          </div>
          <div className="mt-2 flex items-center text-sm text-secondary-text">
            <span className="inline-block w-2 h-2 bg-destructive rounded-full mr-2"></span>
            <span>Synchronization issues between platforms</span>
          </div>
          <div className="mt-2 flex items-center text-sm text-secondary-text">
            <span className="inline-block w-2 h-2 bg-destructive rounded-full mr-2"></span>
            <span>No guarantee of consistency between tools</span>
          </div>
        </div>
      </div>
    </div>

    {/* Pain Point 5: Onboarding Friction */}
    <div className="p-6 bg-hover-active bg-opacity-30 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
      <h3 className="text-lg font-medium mb-3 text-primary-text flex items-center border-b border-divider pb-3">
        <Users className="text-destructive mr-3 w-5 h-5" />
        <span>Onboarding Friction for Collaborators</span>
      </h3>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex flex-col justify-center order-2 md:order-1">
          <div className="text-destructive font-semibold mb-2">
            The Problem:
          </div>
          <p className="text-primary-text">
            New team members need extensive ramp-up time to understand the
            project structure
          </p>
          <div className="mt-4 flex items-center text-sm text-secondary-text">
            <span className="inline-block w-2 h-2 bg-destructive rounded-full mr-2"></span>
            <span>Long onboarding period before productivity</span>
          </div>
          <div className="mt-2 flex items-center text-sm text-secondary-text">
            <span className="inline-block w-2 h-2 bg-destructive rounded-full mr-2"></span>
            <span>Information scattered across multiple sources</span>
          </div>
          <div className="mt-2 flex items-center text-sm text-secondary-text">
            <span className="inline-block w-2 h-2 bg-destructive rounded-full mr-2"></span>
            <span>Tribal knowledge dependencies</span>
          </div>
        </div>

        <div className="rounded bg-black bg-opacity-30 flex-1 shadow-inner order-1 md:order-2 border border-divider overflow-hidden">
          <div className="bg-black bg-opacity-30 p-3 flex items-center border-b border-divider">
            <Users className="text-secondary-text w-4 h-4 mr-2" />
            <div className="text-sm font-medium text-primary-text">
              New Developer Onboarding
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-4 text-sm text-primary-text">
              <div className="flex items-start p-2 bg-black bg-opacity-30 rounded">
                <div className="flex-shrink-0 w-6 h-6 rounded-full border border-divider flex items-center justify-center text-xs text-secondary-text mr-3">
                  1
                </div>
                <span>Read through Git commit history</span>
              </div>

              <div className="flex items-start p-2 bg-black bg-opacity-30 rounded">
                <div className="flex-shrink-0 w-6 h-6 rounded-full border border-divider flex items-center justify-center text-xs text-secondary-text mr-3">
                  2
                </div>
                <span>Hunt through scattered documentation</span>
              </div>

              <div className="flex items-start p-2 bg-black bg-opacity-30 rounded">
                <div className="flex-shrink-0 w-6 h-6 rounded-full border border-divider flex items-center justify-center text-xs text-secondary-text mr-3">
                  3
                </div>
                <span>Decipher code comments across the codebase</span>
              </div>

              <div className="flex items-start p-2 bg-black bg-opacity-30 rounded">
                <div className="flex-shrink-0 w-6 h-6 rounded-full border border-divider flex items-center justify-center text-xs text-secondary-text mr-3">
                  4
                </div>
                <span>Schedule multiple meetings with team members</span>
              </div>

              <div className="flex items-start p-2 bg-black bg-opacity-30 rounded">
                <div className="flex-shrink-0 w-6 h-6 rounded-full border border-divider flex items-center justify-center text-xs text-secondary-text mr-3">
                  5
                </div>
                <span>Slowly piece together project understanding</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default TraditionalPlanning;
