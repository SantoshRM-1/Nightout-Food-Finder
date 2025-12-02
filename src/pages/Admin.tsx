import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit, Save, X } from "lucide-react";

interface Hotel {
  id: string;
  name: string;
  location: string;
  description: string;
  image_url: string;
  price_per_night: number;
  rating: number;
  status: string;
  created_at: string;
}

export default function Admin() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Hotel>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
    fetchPendingHotels();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roles) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
  };

  const fetchPendingHotels = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("hotels")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch hotels",
        variant: "destructive",
      });
    } else {
      setHotels(data || []);
    }
    setLoading(false);
  };

  const updateHotelStatus = async (hotelId: string, status: string) => {
    const { error } = await supabase
      .from("hotels")
      .update({ status })
      .eq("id", hotelId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update hotel status",
        variant: "destructive",
      });
    } else {
      toast({ title: `Hotel ${status}!` });
      fetchPendingHotels();
    }
  };

  const deleteHotel = async (hotelId: string) => {
    const { error } = await supabase
      .from("hotels")
      .delete()
      .eq("id", hotelId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete hotel",
        variant: "destructive",
      });
    } else {
      toast({ title: "Hotel deleted successfully" });
      fetchPendingHotels();
    }
  };

  const startEditing = (hotel: Hotel) => {
    setEditingId(hotel.id);
    setEditForm(hotel);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (hotelId: string) => {
    const { error } = await supabase
      .from("hotels")
      .update({
        name: editForm.name,
        location: editForm.location,
        description: editForm.description,
        image_url: editForm.image_url,
        price_per_night: editForm.price_per_night,
      })
      .eq("id", hotelId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update hotel",
        variant: "destructive",
      });
    } else {
      toast({ title: "Hotel updated successfully!" });
      setEditingId(null);
      setEditForm({});
      fetchPendingHotels();
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6">
            {hotels.map((hotel) => (
              <Card key={hotel.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{hotel.name}</CardTitle>
                      <CardDescription>{hotel.location}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        hotel.status === "approved"
                          ? "default"
                          : hotel.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {hotel.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingId === hotel.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Hotel Name</label>
                        <Input
                          value={editForm.name || ""}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Location</label>
                        <Input
                          value={editForm.location || ""}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Description</label>
                        <Textarea
                          value={editForm.description || ""}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Image URL</label>
                        <Input
                          value={editForm.image_url || ""}
                          onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Price per Night</label>
                        <Input
                          type="number"
                          value={editForm.price_per_night || ""}
                          onChange={(e) => setEditForm({ ...editForm, price_per_night: parseFloat(e.target.value) })}
                          step="0.01"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => saveEdit(hotel.id)} variant="default">
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                        <Button onClick={cancelEditing} variant="secondary">
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      {hotel.image_url && (
                        <img
                          src={hotel.image_url}
                          alt={hotel.name}
                          className="w-48 h-32 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-4">
                          {hotel.description}
                        </p>
                        {hotel.price_per_night && (
                          <p className="font-semibold mb-4">
                            ${hotel.price_per_night}/night
                          </p>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            onClick={() => startEditing(hotel)}
                            variant="outline"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          {hotel.status !== "approved" && (
                            <Button
                              onClick={() => updateHotelStatus(hotel.id, "approved")}
                              variant="default"
                            >
                              Approve
                            </Button>
                          )}
                          {hotel.status !== "rejected" && (
                            <Button
                              onClick={() => updateHotelStatus(hotel.id, "rejected")}
                              variant="secondary"
                            >
                              Reject
                            </Button>
                          )}
                          <Button
                            onClick={() => deleteHotel(hotel.id)}
                            variant="destructive"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {hotels.length === 0 && (
              <p className="text-center text-muted-foreground">
                No hotels to review
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
