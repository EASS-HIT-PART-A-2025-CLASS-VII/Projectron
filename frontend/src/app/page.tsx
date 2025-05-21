import { LandingLayout } from "@/components/layout/landing-layout";
import TabFeatures from "@/components/sections/feature-carousel";
import { HeroSection } from "@/components/sections/hero-section";
import HowItWorks from "@/components/sections/how-it-works";
import PainPointCards from "@/components/sections/pain-points-section";

export default function HomePage() {
  return (
    <LandingLayout>
      <HeroSection />
      {/* <ProblemSolutionSection /> */}
      <HowItWorks />
      <PainPointCards />
      <TabFeatures />

      {/* The rest of the sections will be added as we implement them */}
      <div className="container mx-auto py-24"></div>
    </LandingLayout>
  );
}
