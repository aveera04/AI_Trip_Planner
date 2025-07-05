import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Map, Plane } from "lucide-react";
import heroBeach from "@/assets/hero-beach.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBeach})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-float">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
          <Plane className="w-8 h-8 text-white" />
        </div>
      </div>
      
      <div className="absolute bottom-32 right-16 animate-float" style={{ animationDelay: '1s' }}>
        <div className="w-12 h-12 bg-secondary/30 backdrop-blur-md rounded-full flex items-center justify-center">
          <Map className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="animate-slide-up">
          <h1 className="font-playfair text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your Dream Trip
            <span className="block text-gradient-sunset">Starts Here</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover amazing destinations with AI-powered travel planning. From hidden gems to popular hotspots, we'll craft your perfect journey.
          </p>

          {/* Search Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-travel-large border border-white/20 max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <Input 
                placeholder="Where do you want to go?"
                className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/70 h-12 rounded-xl"
              />
              <Input 
                placeholder="How many days?"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70 h-12 rounded-xl md:w-40"
              />
              <Button variant="hero" size="lg" className="h-12 px-8">
                Plan My Trip
                <Plane className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Button variant="glass" size="sm">Weekend Getaway</Button>
            <Button variant="glass" size="sm">Adventure Travel</Button>
            <Button variant="glass" size="sm">Romantic Escape</Button>
            <Button variant="glass" size="sm">Family Vacation</Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;