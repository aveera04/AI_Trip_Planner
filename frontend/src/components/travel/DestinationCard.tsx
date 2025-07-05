import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Plane, Star } from "lucide-react";

interface DestinationCardProps {
  name: string;
  country: string;
  image: string;
  price: string;
  rating: number;
  description: string;
  highlights: string[];
}

const DestinationCard = ({ 
  name, 
  country, 
  image, 
  price, 
  rating, 
  description, 
  highlights 
}: DestinationCardProps) => {
  return (
    <Card className="group hover-lift overflow-hidden border-0 shadow-travel-medium bg-gradient-card backdrop-blur-sm">
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-primary">
          {price}
        </div>
        
        {/* Rating */}
        <div className="absolute top-4 left-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{rating}</span>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-playfair text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{country}</span>
            </div>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        {/* Highlights */}
        <div className="flex flex-wrap gap-2 mb-4">
          {highlights.slice(0, 3).map((highlight, index) => (
            <span 
              key={index}
              className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
            >
              {highlight}
            </span>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button variant="ocean" size="sm" className="flex-1">
            <Plane className="w-4 h-4 mr-2" />
            Plan Trip
          </Button>
          <Button variant="outline" size="sm">
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DestinationCard;