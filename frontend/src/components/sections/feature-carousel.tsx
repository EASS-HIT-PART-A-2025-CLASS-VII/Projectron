// src/components/sections/TabFeatures.tsx
"use client";
import React, { useRef, useEffect } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

// Feature data for each tab
const tabFeatures = [
  {
    id: 1,
    title: "High-level Plan",
    description:
      "Automatically generate comprehensive project overviews that articulate the strategic approach, core technologies, and implementation philosophy. The plan provides stakeholders with a clear vision of project goals and execution strategies.",
    imagePosition: "right", // Image position relative to text
    imageAlt: "High-level project plan overview",
  },
  {
    id: 2,
    title: "Architecture",
    description:
      "Visualize your system's technical structure with auto-generated architecture diagrams that map component relationships, data flows, and system boundaries. Define clear separation of concerns and establish robust architectural patterns.",
    imagePosition: "left",
    imageAlt: "System architecture diagram",
  },
  {
    id: 3,
    title: "API Endpoints",
    description:
      "Generate comprehensive API documentation with endpoint definitions, request/response schemas, authentication requirements, and error handling specifications. Ensure consistent interfaces between frontend and backend systems.",
    imagePosition: "right",
    imageAlt: "API endpoints documentation",
  },
  {
    id: 4,
    title: "Data Models",
    description:
      "Automatically create normalized database schemas with properly defined relationships, constraints, and indexing strategies. Visualize entity relationships and ensure data integrity across your application.",
    imagePosition: "left",
    imageAlt: "Database schema and relationships",
  },
  {
    id: 5,
    title: "UI Components",
    description:
      "Define reusable interface elements with detailed specifications for behavior, styling, and state management. Build consistent user experiences with a structured component hierarchy and clear design patterns.",
    imagePosition: "right",
    imageAlt: "UI component specifications",
  },
  {
    id: 6,
    title: "Implementation Plan",
    description:
      "Track development progress with milestone-based planning that breaks down complex projects into manageable tasks. Monitor velocity, identify dependencies, and maintain clear visibility into project status.",
    imagePosition: "left",
    imageAlt: "Implementation milestones and tasks",
  },
  {
    id: 7,
    title: "Diagrams",
    description:
      "Generate technical visualizations including sequence diagrams, class hierarchies, and activity flows. Communicate complex system behaviors through standardized visual representations that improve team understanding.",
    imagePosition: "right",
    imageAlt: "Technical sequence diagram",
  },
];

// Individual feature component
const TabFeatureItem = ({
  feature,
  index,
}: {
  feature: (typeof tabFeatures)[0];
  index: number;
}) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  // Determine whether the image is on the left or right
  const isImageLeft = feature.imagePosition === "left";

  return (
    <motion.div
      ref={ref}
      className={cn(
        "grid gap-8 mb-24 relative",
        "grid-cols-1 md:grid-cols-2 items-center"
      )}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: 0.6,
            delay: index * 0.1,
          },
        },
      }}
    >
      {/* Connector line between sections */}
      {index < tabFeatures.length - 1 && (
        <div className="absolute left-8 md:left-1/2 bottom-0 w-[1px] h-24 bg-gradient-to-b from-divider to-transparent -mb-12 md:-translate-x-1/2 hidden sm:block"></div>
      )}

      {/* Feature content - conditionally ordered based on image position */}
      <div
        className={cn(
          isImageLeft ? "md:order-2" : "md:order-1",
          "px-6 md:px-12"
        )}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, x: isImageLeft ? 50 : -50 },
            visible: {
              opacity: 1,
              x: 0,
              transition: {
                duration: 0.6,
                delay: index * 0.1 + 0.2,
              },
            },
          }}
        >
          <span className="text-xs font-mono text-secondary-text mb-2 block tracking-wider">
            {String(feature.id).padStart(2, "0")} // TAB
          </span>

          <h3 className="text-2xl font-bold mb-4 text-primary-text relative inline-block">
            {feature.title}
            <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-cta w-[60%]"></div>
          </h3>

          <p className="text-secondary-text leading-relaxed">
            {feature.description}
          </p>
        </motion.div>
      </div>

      {/* Feature image/placeholder */}
      <div
        className={cn(
          isImageLeft ? "md:order-1" : "md:order-2",
          "px-6 md:px-12"
        )}
      >
        <motion.div
          className="relative rounded-lg overflow-hidden bg-secondary-background border border-divider aspect-[4/3]"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.6,
                delay: index * 0.1 + 0.4,
              },
            },
          }}
        >
          {/* Image border effect */}
          <div className="absolute inset-0 p-[1px]">
            <div className="absolute inset-0 rounded-lg p-[1px] bg-gradient-cta opacity-40"></div>
          </div>

          {/* Placeholder image - replace with actual images later */}
          <div className="absolute inset-0 flex items-center justify-center text-secondary-text">
            <img
              src={`/api/placeholder/800/600`}
              alt={feature.imageAlt}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Feature number in corner */}
          <div className="absolute top-3 right-3 bg-background/70 backdrop-blur-sm p-1 px-2 rounded text-xs font-mono text-secondary-text">
            TAB {String(feature.id).padStart(2, "0")}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export const TabFeatures = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-primary-background">
      <div className="container mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary-text">
            Comprehensive Project Workspace
          </h2>
          <p className="text-secondary-text max-w-2xl mx-auto">
            Projectron organizes your development journey through seven
            specialized workspaces, each focusing on a critical aspect of
            software project planning and management.
          </p>

          {/* Section divider */}
          <div className="flex items-center justify-center mt-8">
            <div className="h-[1px] w-16 bg-gradient-cta opacity-70"></div>
            <div className="mx-4 text-secondary-text text-xs font-mono">
              TABS
            </div>
            <div className="h-[1px] w-16 bg-gradient-cta opacity-70"></div>
          </div>
        </div>

        {/* Tab features list */}
        <div className="space-y-16">
          {tabFeatures.map((feature, index) => (
            <TabFeatureItem key={feature.id} feature={feature} index={index} />
          ))}
        </div>

        {/* Bottom section divider */}
        <div className="flex items-center justify-center mt-12">
          <div className="h-[1px] w-16 bg-gradient-cta opacity-70"></div>
          <div className="mx-4 text-secondary-text text-xs font-mono">
            // END TABS
          </div>
          <div className="h-[1px] w-16 bg-gradient-cta opacity-70"></div>
        </div>
      </div>
    </section>
  );
};

export default TabFeatures;
