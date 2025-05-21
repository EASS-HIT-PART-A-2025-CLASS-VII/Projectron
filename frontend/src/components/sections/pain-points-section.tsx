import React from "react";
import {
  Brain,
  CheckSquare,
  GitMerge,
  Users,
  CornerDownRight,
} from "lucide-react";

const PainPointCards = () => {
  const painPoints = [
    {
      id: 1,
      title: "Embedded Context",
      description:
        "No more explaining architecture repeatedly. Your AI assistant inherits complete project knowledge from day one.",
      benefit: "Intelligent context-aware code suggestions",
      icon: <Brain className="text-primary-text" />,
    },
    {
      id: 2,
      title: "Trackable Tasks",
      description:
        "Transform vague roadmaps into clear, executable tasks with time estimates and built-in tracking.",
      benefit: "Real-time prioritized task tracking",
      icon: <CheckSquare className="text-primary-text" />,
    },
    {
      id: 3,
      title: "Single Source of Truth",
      description:
        "End the drift between diagrams, docs, and specs with one unified workspace for all artifacts.",
      benefit: "No more sync issues",
      icon: <GitMerge className="text-primary-text" />,
    },
    {
      id: 4,
      title: "Instant Onboarding",
      description:
        "Eliminate days wasted hunting for tribal knowledge with a self-service project overview.",
      benefit: "Instant clarity for new members",
      icon: <Users className="text-primary-text" />,
    },
  ];

  return (
    <section className="w-full py-24 px-4 sm:px-6 lg:px-20 bg-primary-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-12 gap-2">
          <h2 className="text-2xl sm:text-3xl font-semibold text-primary-text text-center">
            Four <span className="text-gradient-cta">Problems</span>. One{" "}
            <span>Solution.</span>
          </h2>
          <p className="text-secondary-text">
            From scattered project knowledge to a single development source of
            truth.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-8">
          {/* First card */}
          <div className="lg:col-span-7 relative group">
            <div className="rounded-md backdrop-blur-sm bg-primary-background border border-hover-active/20 p-6 h-full group-hover:border-primary-text/30 group-hover:bg-hover-active">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-cta/10 flex items-center justify-center">
                  {painPoints[0].icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary-text mb-2 group-hover:text-gradient-cta">
                    {painPoints[0].title}
                  </h3>
                  <div className="flex">
                    <p className="text-primary-text/70 flex">
                      <span className="w-[2px] bg-gradient-cta inline-block rounded-full mr-2 self-stretch"></span>
                      {painPoints[0].description}
                    </p>
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-start">
                      <span className="w-px h-8 bg-gradient-cta/30 mr-2 mt-1"></span>
                      <p className="text-xs text-primary-text/80 mt-4 border-[2px] p-[0.35rem] rounded-xl bg-hover-active font-semibold flex">
                        <CornerDownRight className="h-4" />
                        {painPoints[0].benefit}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Second card */}
          <div className="lg:col-span-5 relative group">
            <div className="rounded-md backdrop-blur-sm bg-primary-background border border-hover-active/20 p-6 h-full group-hover:border-primary-text/30 group-hover:bg-hover-active">
              <div className="flex flex-col h-full">
                <div className="w-10 h-10 rounded-full bg-gradient-cta/10 flex items-center justify-center mb-4">
                  {painPoints[1].icon}
                </div>
                <h3 className="text-xl font-semibold text-primary-text mb-2 group-hover:text-gradient-cta">
                  {painPoints[1].title}
                </h3>
                <div className="flex">
                  <p className="text-primary-text/70 mb-4 flex">
                    <span className="w-[2px] bg-gradient-cta inline-block rounded-full mr-2 self-stretch"></span>
                    {painPoints[1].description}
                  </p>
                </div>
                <div className="mt-auto">
                  <div className="flex items-start">
                    <span className="w-px h-8 bg-gradient-cta/30 mr-2 mt-1"></span>
                    <p className="text-xs text-primary-text/80 border-[2px] p-[0.35rem] rounded-xl bg-hover-active font-semibold flex">
                      <CornerDownRight className="h-4" />
                      {painPoints[1].benefit}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Third card */}
          <div className="lg:col-span-5 relative group">
            <div className="rounded-md backdrop-blur-sm bg-primary-background border border-hover-active/20 p-6 h-full group-hover:border-primary-text/30 group-hover:bg-hover-active">
              <div className="flex flex-col h-full">
                <div className="w-10 h-10 rounded-full bg-gradient-cta/10 flex items-center justify-center mb-4">
                  {painPoints[2].icon}
                </div>
                <h3 className="text-xl font-semibold text-primary-text mb-2 group-hover:text-gradient-cta">
                  {painPoints[2].title}
                </h3>
                <div className="flex">
                  <span className="w-[2px] bg-gradient-cta inline-block rounded-full mr-2 self-stretch"></span>
                  <p className="text-primary-text/70 flex">
                    {painPoints[2].description}
                  </p>
                </div>
                <div className="mt-auto">
                  <div className="flex items-start">
                    <span className="w-px h-8 bg-gradient-cta/30 mr-2 mt-1"></span>
                    <p className="text-xs text-primary-text/80 mt-4 border-[2px] p-[0.35rem] rounded-xl bg-hover-active font-semibold flex">
                      <CornerDownRight className="h-4" />
                      {painPoints[2].benefit}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fourth card - */}
          <div className="lg:col-span-7 relative group">
            <div className="rounded-md backdrop-blur-sm bg-primary-background border border-hover-active/20 p-6 h-full group-hover:border-primary-text/30 group-hover:bg-hover-active">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-cta/10 flex items-center justify-center">
                  {painPoints[3].icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-primary-text mb-2 group-hover:text-gradient-cta">
                    {painPoints[3].title}
                  </h3>
                  <div className="flex">
                    <p className="text-primary-text/70 flex">
                      <span className="w-[2px] bg-gradient-cta rounded-full mr-2 self-stretch inline-block"></span>

                      {painPoints[3].description}
                    </p>
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-start">
                      <p className="text-xs text-primary-text/80 mt-4 border-[2px] p-[0.35rem] rounded-xl bg-hover-active font-semibold flex">
                        <CornerDownRight className="h-4" />
                        {painPoints[3].benefit}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PainPointCards;
