"use client";

import { useRef, useEffect, MutableRefObject } from "react";

// Define proper return type for the hook
type ScrollRefs = {
  firstContainerRef: React.RefObject<HTMLDivElement | null>;
  secondContainerRef: React.RefObject<HTMLDivElement | null>;
};

/**
 * Custom hook to synchronize scrolling between two containers with performance optimizations
 */
const useSynchronizedScroll = (): ScrollRefs => {
  // Create refs for the container elements
  const firstContainerRef = useRef<HTMLDivElement>(null);
  const secondContainerRef = useRef<HTMLDivElement>(null);

  // Track which container initiated the scroll
  const scrollingContainer = useRef<"first" | "second" | null>(null);
  const requestId = useRef<number | null>(null);

  useEffect(() => {
    const firstContainer = firstContainerRef.current;
    const secondContainer = secondContainerRef.current;

    if (!firstContainer || !secondContainer) return;

    // Apply smooth scrolling behavior via CSS
    firstContainer.style.scrollBehavior = "smooth";
    secondContainer.style.scrollBehavior = "smooth";

    // Use requestAnimationFrame for smoother synchronization
    const syncScroll = (
      sourceContainer: HTMLDivElement,
      targetContainer: HTMLDivElement,
      source: "first" | "second"
    ) => {
      // Skip if scrolling was triggered by the other container
      if (scrollingContainer.current && scrollingContainer.current !== source)
        return;

      // Set the active container
      scrollingContainer.current = source;

      // Cancel any pending animation frame
      if (requestId.current !== null) {
        cancelAnimationFrame(requestId.current);
      }

      // Schedule scroll sync on next animation frame for better performance
      requestId.current = requestAnimationFrame(() => {
        // Sync scroll position
        targetContainer.scrollTop = sourceContainer.scrollTop;

        // Reset after a short delay
        setTimeout(() => {
          if (scrollingContainer.current === source) {
            scrollingContainer.current = null;
          }
        }, 50);
      });
    };

    const handleFirstScroll = () => {
      syncScroll(firstContainer, secondContainer, "first");
    };

    const handleSecondScroll = () => {
      syncScroll(secondContainer, firstContainer, "second");
    };

    // Add event listeners with passive option for better performance
    firstContainer.addEventListener("scroll", handleFirstScroll, {
      passive: true,
    });
    secondContainer.addEventListener("scroll", handleSecondScroll, {
      passive: true,
    });

    // Cleanup on unmount
    return () => {
      firstContainer.removeEventListener("scroll", handleFirstScroll);
      secondContainer.removeEventListener("scroll", handleSecondScroll);

      if (requestId.current !== null) {
        cancelAnimationFrame(requestId.current);
      }
    };
  }, []);

  // Return properly typed refs
  return {
    firstContainerRef,
    secondContainerRef,
  };
};

export default useSynchronizedScroll;
