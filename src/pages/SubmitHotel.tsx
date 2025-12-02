import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const hotelSchema = z.object({
  name: z.string().min(2, "Hotel name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  price_per_night: z.number().positive("Price must be positive").optional().or(z.literal(0)),
});

export default function SubmitHotel() {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    image_url: "",
    price_per_night: "",
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    } else {
      setUser(user);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('hotel-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('hotel-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast({ title: "Image uploaded successfully!" });
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    setLoading(true);

    try {
      // Upload file if selected
      if (uploadedFile && !formData.image_url) {
        await handleFileUpload(uploadedFile);
      }

      const priceValue = formData.price_per_night ? parseFloat(formData.price_per_night) : 0;
      
      const validatedData = hotelSchema.parse({
        ...formData,
        price_per_night: priceValue,
        image_url: formData.image_url || "",
      });

      const { error } = await supabase.from("hotels").insert([{
        name: validatedData.name,
        location: validatedData.location,
        description: validatedData.description,
        image_url: validatedData.image_url || null,
        price_per_night: validatedData.price_per_night || null,
        user_id: user.id,
        status: "pending",
      }]);

      if (error) throw error;

      toast({ title: "Hotel submitted for review!" });
      navigate("/");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to submit hotel",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Submit a Hotel</CardTitle>
            <CardDescription>
              Share your favorite hotel with the Nightout community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Hotel Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="Image URL (optional)"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Or upload an image (optional)
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadedFile(file);
                      handleFileUpload(file);
                    }
                  }}
                  disabled={uploading}
                />
                {uploading && (
                  <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
                )}
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Price per Night (optional)"
                  value={formData.price_per_night}
                  onChange={(e) =>
                    setFormData({ ...formData, price_per_night: e.target.value })
                  }
                  step="0.01"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Hotel"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
