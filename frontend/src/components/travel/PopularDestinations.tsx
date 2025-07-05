import DestinationCard from "./DestinationCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import cityEurope from "@/assets/city-europe.jpg";
import mountainAdventure from "@/assets/mountain-adventure.jpg";
import heroBeach from "@/assets/hero-beach.jpg";

const PopularDestinations = () => {
  const destinations = [
    {
      name: "Santorini",
      country: "Greece",
      image: cityEurope,
      price: "From $1,200",
      rating: 4.8,
      description: "Experience the magic of whitewashed buildings, stunning sunsets, and crystal-clear waters in this iconic Greek island paradise.",
      highlights: ["Sunset Views", "Wine Tasting", "Historic Sites"]
    },
    {
      name: "Swiss Alps", 
      country: "Switzerland",
      image: mountainAdventure,
      price: "From $2,800",
      rating: 4.9,
      description: "Adventure awaits in the majestic Swiss Alps with world-class skiing, hiking trails, and breathtaking mountain vistas.",
      highlights: ["Mountain Hiking", "Scenic Trains", "Alpine Villages"]
    },
    {
      name: "Maldives",
      country: "Indian Ocean",
      image: heroBeach,
      price: "From $3,500",
      rating: 4.7,
      description: "Escape to tropical paradise with overwater bungalows, pristine beaches, and some of the world's best diving spots.",
      highlights: ["Water Sports", "Luxury Resorts", "Marine Life"]
    }
  ];

  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-4xl font-bold text-foreground mb-4">
            Popular <span className="text-gradient-ocean">Destinations</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the world's most sought-after travel destinations, handpicked for unforgettable experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {destinations.map((destination, index) => (
            <div key={destination.name} className="animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
              <DestinationCard {...destination} />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="ocean" size="lg" className="group">
            Explore All Destinations
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;