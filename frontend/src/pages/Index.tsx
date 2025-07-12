import { useState, useRef } from "react";
import HeroSection from "@/components/travel/HeroSection";
import PopularDestinations from "@/components/travel/PopularDestinations";
import TravelFeatures from "@/components/travel/TravelFeatures";
import TravelPlannerForm from "@/components/travel/TravelPlannerForm";

const Index = () => {
  const [heroQuery, setHeroQuery] = useState<string>("");
  const [shouldAutoSubmit, setShouldAutoSubmit] = useState<boolean>(false);
  const travelPlannerRef = useRef<HTMLDivElement>(null);

  const handleHeroSubmit = (destination: string, days: string) => {
    // Construct the query
    const query = `Plan a vacation trip to ${destination} for ${days} days`;
    setHeroQuery(query);
    setShouldAutoSubmit(true);
    
    // Scroll to the travel planner section
    setTimeout(() => {
      travelPlannerRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  const handleQueryProcessed = () => {
    setShouldAutoSubmit(false);
  };

  return (
    <div className="min-h-screen">
      <HeroSection onPlanTrip={handleHeroSubmit} />
      <div ref={travelPlannerRef}>
        <TravelPlannerForm 
          initialQuery={heroQuery}
          autoSubmit={shouldAutoSubmit}
          onQueryProcessed={handleQueryProcessed}
        />
      </div>
      <TravelFeatures />
      <PopularDestinations />
      
    </div>
  );
};

export default Index;
