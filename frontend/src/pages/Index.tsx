import HeroSection from "@/components/travel/HeroSection";
import PopularDestinations from "@/components/travel/PopularDestinations";
import TravelFeatures from "@/components/travel/TravelFeatures";
import TravelPlannerForm from "@/components/travel/TravelPlannerForm";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <TravelFeatures />
      <PopularDestinations />
      <TravelPlannerForm />
    </div>
  );
};

export default Index;
