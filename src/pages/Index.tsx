import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import HotelCard from "@/components/HotelCard";
import { Button } from "@/components/ui/button";
import { Plus, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Hotel {
  id: string;
  name: string;
  location: string;
  description: string | null;
  image_url: string | null;
  price_per_night: number | null;
  rating: number | null;
  status: string;
}

const Index = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchApprovedHotels();
  }, []);

  const fetchApprovedHotels = async () => {
    const { data } = await supabase
      .from("hotels")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    setHotels(data || []);
    setLoading(false);
  };

  const filteredHotels = hotels.filter((hotel) =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 text-foreground">
            Discover Amazing Hotels for Your Night Out
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Find the perfect hotels for your evening adventures. Browse approved venues 
            or suggest new ones for the community.
          </p>
          
          {/* Search Bar */}
          <div className="flex gap-2 max-w-md mx-auto mb-6">
            <Input 
              placeholder="Search hotels by name or location..." 
              className="flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <Button size="lg" className="gap-2" onClick={() => navigate("/submit")}>
            <Plus className="h-5 w-5" />
            Suggest a Hotel
          </Button>
        </div>
      </section>
      
      {/* Hotels Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Hotels</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
              
              {/* Empty State */}
              {filteredHotels.length === 0 && !loading && (
                <div className="text-center py-16">
                  <h3 className="text-xl font-semibold mb-4">
                    {searchTerm ? "No hotels found" : "No hotels yet"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm 
                      ? "Try adjusting your search terms"
                      : "Be the first to suggest a hotel for the community!"
                    }
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => navigate("/submit")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Suggest First Hotel
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
