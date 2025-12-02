import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";
import defaultHotelImage from "@/assets/default-hotel.png";

interface Hotel {
  id: string;
  name: string;
  location: string;
  description?: string | null;
  image_url?: string | null;
  price_per_night?: number | null;
  rating?: number | null;
  status: string;
}

interface HotelCardProps {
  hotel: Hotel;
}

const HotelCard = ({ hotel }: HotelCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-muted relative">
        <img 
          src={hotel.image_url || defaultHotelImage} 
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        {hotel.rating && hotel.rating > 0 && (
          <Badge 
            variant="default" 
            className="absolute top-2 right-2 flex items-center gap-1"
          >
            <Star className="h-3 w-3 fill-current" />
            {hotel.rating}
          </Badge>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{hotel.name}</CardTitle>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{hotel.location}</span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {hotel.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {hotel.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default HotelCard;