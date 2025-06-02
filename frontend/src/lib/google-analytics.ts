declare global {
  interface Window {
    gtag: (
      command: "config" | "event",
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Simple function to track events
const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (
    !GA_TRACKING_ID ||
    process.env.NODE_ENV !== "production" ||
    typeof window === "undefined"
  ) {
    return;
  }

  window.gtag("event", eventName, parameters);
};

// Your specific tracking functions
export const analytics = {
  trackDiagramGenerated: (diagramType: "sequence" | "class" | "activity") => {
    trackEvent("diagram_generated", {
      diagram_type: diagramType,
    });
  },

  trackPlanGenerated: () => {
    trackEvent("plan_generated");
  },

  trackNavLinkClick: (linkName: string) => {
    trackEvent("nav_link_click", {
      link_name: linkName,
    });
  },
};
