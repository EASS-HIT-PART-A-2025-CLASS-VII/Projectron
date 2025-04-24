"use client";

import React from "react";
import { LandingHeader } from "./landing-header";
import { LandingFooter } from "./landing-footer";
import { motion } from "framer-motion";

interface LandingLayoutProps {
  children: React.ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  // Fade in animation for the entire page
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-background text-foreground"
      initial="initial"
      animate="animate"
      variants={pageVariants}
    >
      {/* The header stays at the top */}
      <LandingHeader />

      {/* Main content expands to fill available space */}
      <main className="flex-grow">{children}</main>

      {/* Footer at the bottom */}
      <LandingFooter />
    </motion.div>
  );
}
