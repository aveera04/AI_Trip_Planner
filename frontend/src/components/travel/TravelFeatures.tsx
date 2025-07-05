import { Card, CardContent } from "@/components/ui/card";
import { Bot, MapPin, Utensils, Bed } from "lucide-react";

const TravelFeatures = () => {
  const features = [
    {
      icon: Bot,
      title: "AI-Powered Planning",
      description: "Our advanced AI creates personalized itineraries based on your preferences, budget, and travel style.",
      gradient: "bg-gradient-ocean"
    },
    {
      icon: MapPin,
      title: "Curated Destinations", 
      description: "Discover hidden gems and popular attractions with insider tips from local experts and seasoned travelers.",
      gradient: "bg-gradient-sunset"
    },
    {
      icon: Utensils,
      title: "Local Experiences",
      description: "Immerse yourself in authentic local culture with recommended restaurants, activities, and unique experiences.",
      gradient: "bg-gradient-adventure"
    },
    {
      icon: Bed,
      title: "Smart Recommendations",
      description: "Get perfect accommodation suggestions that match your budget, style, and proximity to key attractions.",
      gradient: "bg-gradient-hero"
    }
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl font-bold text-foreground mb-4">
            Why Choose Our <span className="text-gradient-sunset">Travel Planner</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of travel planning with AI-powered recommendations, 
            personalized itineraries, and insider knowledge at your fingertips
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={feature.title}
                className="group hover-lift border-0 shadow-travel-medium bg-gradient-card backdrop-blur-sm text-center"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="font-playfair text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TravelFeatures;