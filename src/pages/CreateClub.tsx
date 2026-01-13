import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface City {
  id: string;
  name: string;
  country: string;
}

const CATEGORIES = [
  { value: "run", label: "Running" },
  { value: "fitness", label: "Fitness" },
  { value: "chess", label: "Chess" },
  { value: "tech", label: "Technology" },
  { value: "photography", label: "Photography" },
  { value: "workshop", label: "Workshops" },
  { value: "meetup", label: "Meetups" },
];

const CreateClub = () => {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [cities, setCities] = useState<City[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    city_id: "",
  });

  useEffect(() => {
    if (authLoading) return;

    if (!profile || profile.role !== "organizer") {
      toast({
        title: "Access denied",
        description: "You must be an organizer to create clubs.",
        variant: "destructive",
      });
      navigate("/clubs", { replace: true });
      return;
    }

    fetchCities();
  }, [authLoading, profile?.id, profile?.role, navigate, toast]);

  const fetchCities = async () => {
    const { data } = await supabase.from("cities").select("*").order("name");
    if (data) setCities(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSubmitting(true);

    // Create club
    const { data: club, error: clubError } = await supabase
      .from("clubs")
      .insert({
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        city_id: formData.city_id || null,
        created_by: profile.id,
      })
      .select()
      .single();

    if (clubError) {
      toast({
        title: "Failed to create club",
        description: clubError.message,
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    // Add creator as owner
    const { error: orgError } = await supabase.from("club_organizers").insert({
      club_id: club.id,
      profile_id: profile.id,
      role: "owner",
    });

    if (orgError) {
      toast({
        title: "Club created but failed to add you as owner",
        description: orgError.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Club created!",
        description: "Your club is now live.",
      });
    }

    navigate(`/clubs/${club.id}`);
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container max-w-2xl py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl py-12">
        <Link
          to="/clubs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-display mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clubs
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Create a Club</CardTitle>
            <CardDescription>
              Clubs are the organizing units for events. Create one to start hosting events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Club Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Downtown Runners"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select
                  value={formData.city_id}
                  onValueChange={(value) => setFormData({ ...formData, city_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}, {city.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this club about?"
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={submitting || !formData.name || !formData.category}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Club
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateClub;
