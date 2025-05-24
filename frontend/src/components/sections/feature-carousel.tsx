// src/components/sections/TabFeatures.tsx
"use client";
import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  useAnimation,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { ScreenshotDisplay } from "@/components/ui/screenshot-display";
import { X } from "lucide-react";
import { useRouter } from "next/router";

// Feature data for each tab
const tabFeatures = [
  {
    id: 1,
    title: "High-level Plan",
    subtitle: "Strategic Vision",
    description:
      "Automatically generate comprehensive project overviews that articulate the strategic approach, core technologies, and implementation philosophy. The plan provides stakeholders with a clear vision of project goals and execution strategies.",
    imagePosition: "right",
    imageAlt: "High-level project plan overview",
    imageSrc: "/high-level.png",
    highlights: ["Project Vision", "Core Technologies", "Strategic Approach"],
  },
  {
    id: 2,
    title: "Architecture",
    subtitle: "System Design",
    description:
      "Visualize your system's technical structure with auto-generated architecture diagrams that map component relationships, data flows, and system boundaries. Define clear separation of concerns and establish robust architectural patterns.",
    imagePosition: "left",
    imageAlt: "System architecture diagram",
    imageSrc: "/architecture.png",
    highlights: ["Component Mapping", "Data Flows", "System Boundaries"],
  },
  {
    id: 3,
    title: "API Endpoints",
    subtitle: "Interface Documentation",
    description:
      "Generate comprehensive API documentation with endpoint definitions, request/response schemas, authentication requirements, and error handling specifications. Ensure consistent interfaces between frontend and backend systems.",
    imagePosition: "right",
    imageAlt: "API endpoints documentation",
    imageSrc: "/api-endpoints.png",
    highlights: ["RESTful Endpoints", "Request Schemas", "Auth Specs"],
  },
  {
    id: 4,
    title: "Data Models",
    subtitle: "Database Schema",
    description:
      "Automatically create normalized database schemas with properly defined relationships, constraints, and indexing strategies. Visualize entity relationships and ensure data integrity across your application.",
    imagePosition: "left",
    imageAlt: "Database schema and relationships",
    imageSrc: "/data-models.png",
    highlights: ["Entity Relations", "Data Constraints", "Index Strategy"],
  },
  {
    id: 5,
    title: "UI Components",
    subtitle: "Interface Elements",
    description:
      "Define reusable interface elements with detailed specifications for behavior, styling, and state management. Build consistent user experiences with a structured component hierarchy and clear design patterns.",
    imagePosition: "right",
    imageAlt: "UI component specifications",
    imageSrc: "/ui-components.png",
    highlights: ["Component Library", "State Management", "Design Patterns"],
  },
  {
    id: 6,
    title: "Implementation Plan",
    subtitle: "Development Roadmap",
    description:
      "Track development progress with milestone-based planning that breaks down complex projects into manageable tasks. Monitor velocity, identify dependencies, and maintain clear visibility into project status.",
    imagePosition: "left",
    imageAlt: "Implementation milestones and tasks",
    imageSrc: "/implementation-plan.png",
    highlights: ["Milestone Tracking", "Task Dependencies", "Progress Metrics"],
  },
  {
    id: 7,
    title: "Diagrams",
    subtitle: "Technical Visualizations",
    description:
      "Generate technical visualizations including sequence diagrams, class hierarchies, and activity flows. Communicate complex system behaviors through standardized visual representations that improve team understanding.",
    imagePosition: "right",
    imageAlt: "Technical sequence diagram",
    imageSrc: "/diagrams.png",
    highlights: ["Sequence Flows", "Class Hierarchies", "Activity Diagrams"],
  },
];

// Full screen image modal component
const ImageModal = ({
  src,
  alt,
  isOpen,
  onClose,
}: {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary-background/95 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative max-w-7xl max-h-[90vh] w-full mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 text-secondary-text hover:text-primary-text transition-colors"
            >
              <X size={24} />
            </button>
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-contain rounded-lg shadow-2xl"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const textY = useTransform(scrollYProgress, [0, 1], [15, -15]);

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const isImageLeft = feature.imagePosition === "left";

  return (
    <>
      <motion.div
        id={`feature-${feature.id}`}
        ref={ref}
        className="relative mb-32 overflow-hidden"
        initial="hidden"
        animate={controls}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              duration: 0.8,
              staggerChildren: 0.2,
            },
          },
        }}
      >
        {/* Background gradient effect - more subtle */}
        <motion.div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            background: `radial-gradient(circle at ${
              isImageLeft ? "20%" : "80%"
            } 50%, var(--primary) 0%, transparent 50%)`,
          }}
        />

        {/* Connection line with subtle glow */}
        {index < tabFeatures.length - 1 && (
          <motion.div
            className="absolute left-1/2 bottom-0 w-[1px] h-32 -mb-32 -translate-x-1/2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 0.3, height: 128 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="w-full h-full bg-gradient-to-b from-divider to-transparent" />
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-cta/50"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>
        )}

        <div className="container mx-auto">
          <div
            className={cn(
              "grid gap-12 items-center",
              "grid-cols-1 lg:grid-cols-2"
            )}
          >
            {/* Feature content */}
            <motion.div
              className={cn(
                isImageLeft ? "lg:order-2" : "lg:order-1",
                "px-6 lg:px-12"
              )}
              style={{ y: textY }}
              variants={{
                hidden: { opacity: 0, x: isImageLeft ? 30 : -30 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.8 },
                },
              }}
            >
              {/* Feature number with subtle glow */}
              <motion.div
                className="inline-flex items-center mb-6"
                whileInView={{ opacity: [0, 1] }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-5xl font-bold text-primary-cta/10 mr-4 font-mono">
                  {String(feature.id).padStart(2, "0")}
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-secondary-text tracking-wider opacity-60">
                    // {feature.subtitle.toUpperCase()}
                  </span>
                  <div className="h-[1px] w-full bg-gradient-to-r from-divider to-transparent mt-1" />
                </div>
              </motion.div>

              {/* Title with underline animation */}
              <h3 className="text-3xl lg:text-4xl font-bold mb-6 text-primary-text relative">
                {feature.title}
                <motion.div
                  className="absolute -bottom-2 left-0 h-[1px] bg-gradient-to-r from-primary-cta/50 to-transparent"
                  initial={{ width: 0 }}
                  whileInView={{ width: "60%" }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </h3>

              {/* Description */}
              <p className="text-secondary-text leading-relaxed mb-8 text-lg">
                {feature.description}
              </p>

              {/* Highlight tags - more subtle */}
              <motion.div
                className="flex flex-wrap gap-3"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 },
                  },
                }}
              >
                {feature.highlights.map((highlight, i) => (
                  <motion.div
                    key={i}
                    className="px-4 py-2 bg-secondary-background/30 backdrop-blur-sm border border-divider/50 rounded-full text-xs text-secondary-text hover:border-divider hover:text-primary-text/80 transition-all cursor-default"
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    whileHover={{
                      scale: 1.02,
                    }}
                  >
                    {highlight}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Feature screenshot - enhanced visibility */}
            <motion.div
              className={cn(
                isImageLeft ? "lg:order-1" : "lg:order-2",
                "px-6 lg:px-12"
              )}
              style={{ y: imageY }}
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.8 },
                },
              }}
            >
              <motion.div
                className="relative group cursor-pointer"
                onClick={() => setIsModalOpen(true)}
              >
                {/* Glow effect on mobile, subtle on desktop */}
                <div className="absolute -inset-2 bg-gradient-to-r from-primary-cta/0 via-primary-cta/20 to-primary-cta/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl md:via-primary-cta/5" />

                {/* Screenshot with enhanced visibility */}
                <div className="relative">
                  <div className="relative bg-secondary-background/50 p-1 rounded-lg">
                    <ScreenshotDisplay
                      src={feature.imageSrc}
                      alt={feature.imageAlt}
                      className="shadow-xl rounded-md overflow-hidden border border-divider/30 bg-white"
                    />

                    {/* Overlay gradient with click hint */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-background/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-md flex items-center justify-center">
                      <span className="text-white bg-primary-background/80 px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                        Click to expand
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tab indicator - more subtle */}
                <motion.div
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-secondary-background/60 backdrop-blur-sm border border-divider/30 rounded-full text-xs text-secondary-text/60"
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Tab {feature.id} of 7
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Full screen image modal */}
      <ImageModal
        src={feature.imageSrc}
        alt={feature.imageAlt}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export const TabFeatures = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-primary-background">
      {/* Background gradient mesh - very subtle */}
      <div className="absolute inset-0 opacity-[0.01]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-cta rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-cta rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Section header - more friendly copywriting */}
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-block mb-4"
            whileInView={{ scale: [0.8, 1] }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-mono text-primary-cta tracking-wider">
              PROJECT WORKSPACE
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-primary-text">
            Everything You Need,
            <span className="text-transparent bg-clip-text bg-gradient-cta">
              {" "}
              Perfectly Organized
            </span>
          </h2>

          <p className="text-secondary-text text-lg max-w-3xl mx-auto leading-relaxed">
            From initial concept to final deployment, Projectron guides you
            through every step with intelligent workspaces that adapt to your
            project's unique needs.
          </p>

          {/* Animated divider - more subtle */}
          <motion.div
            className="flex items-center justify-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="h-[1px] bg-gradient-to-r from-transparent via-divider to-transparent"
              initial={{ width: 0 }}
              whileInView={{ width: 200 }}
              transition={{ duration: 1 }}
            />
          </motion.div>
        </motion.div>

        {/* Tab features list */}
        <div className="relative">
          {tabFeatures.map((feature, index) => (
            <TabFeatureItem key={feature.id} feature={feature} index={index} />
          ))}
        </div>

        {/* Bottom section with CTA - more subtle */}
        <motion.div
          className="text-center mt-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center space-x-4 mb-8"
            whileHover={{ scale: 1.02 }}
          >
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-divider" />
            <span className="text-xs font-mono text-secondary-text opacity-60">
              // END WORKSPACE TOUR
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-divider" />
          </motion.div>

          <motion.button
            className="px-8 py-4 bg-primary-cta text-primary-background font-semibold rounded-lg hover:bg-cta-hover transition-all duration-300 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.scroll({ top: 0, behavior: "smooth" })}
          >
            Start Building Your Project
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default TabFeatures;
