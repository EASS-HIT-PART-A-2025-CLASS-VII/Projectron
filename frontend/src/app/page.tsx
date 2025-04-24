import { LandingLayout } from "@/components/layout/landing-layout";
import { HeroSection } from "@/components/sections/hero-section";
import ProblemSolutionSection from "@/components/sections/problem-solution-section";

export default function HomePage() {
  return (
    <LandingLayout>
      <HeroSection />
      <ProblemSolutionSection />

      {/* The rest of the sections will be added as we implement them */}
      <div className="container mx-auto py-24">
        <p className="text-center text-muted-foreground text-lg">
          More sections coming soon...
        </p>
      </div>
    </LandingLayout>
  );
}
