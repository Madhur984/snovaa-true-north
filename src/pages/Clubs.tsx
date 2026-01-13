import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Users, Calendar, MapPin, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface Club {
  id: string;
  name: string;
  description: string | null;
  category: string;
  status: string;
  created_at: string;
  city: { name: string; country: string } | null;
  organizer_count: number;
  member_count: number;
  event_count: number;
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "run", label: "Running" },
  { value: "fitness", label: "Fitness" },
  { value: "chess", label: "Chess" },
  { value: "tech", label: "Technology" },
  { value: "photography", label: "Photography" },
  { value: "workshop", label: "Workshops" },
  { value: "meetup", label: "Meetups" },
];

const Clubs = () => {
  const { profile } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    // Fetch clubs with aggregated counts
    const { data: clubsData, error } = await supabase
      .from("clubs")
      .select(`
        *,
        city:cities(name, country)
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (!error && clubsData) {
      // Get counts for each club
      const clubsWithCounts = await Promise.all(
        clubsData.map(async (club) => {
          const [organizerRes, memberRes, eventRes] = await Promise.all([
            supabase.from("club_organizers").select("id", { count: "exact" }).eq("club_id", club.id),
            supabase.from("club_members").select("id", { count: "exact" }).eq("club_id", club.id),
            supabase.from("events").select("id", { count: "exact" }).eq("club_id", club.id),
          ]);

          return {
            ...club,
            organizer_count: organizerRes.count || 0,
            member_count: memberRes.count || 0,
            event_count: eventRes.count || 0,
          } as Club;
        })
      );
      setClubs(clubsWithCounts);
    }
    setLoading(false);
  };

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.city?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="container max-w-6xl py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-4xl font-medium text-display mb-3">Clubs</h1>
            <p className="text-body text-lg max-w-2xl">
              Discover verified clubs organizing events in your city. Each club maintains an
              immutable record of their activities.
            </p>
          </div>
          {profile?.role === "organizer" && (
            <Button asChild>
              <Link to="/clubs/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Club
              </Link>
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search clubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Clubs Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : filteredClubs.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-serif text-2xl font-medium text-display mb-2">No clubs found</h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your filters"
                : "Be the first to create a club"}
            </p>
            {profile?.role === "organizer" && (
              <Button asChild>
                <Link to="/clubs/create">Create a Club</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => (
              <Link key={club.id} to={`/clubs/${club.id}`}>
                <Card className="h-full hover:border-primary/30 transition-all duration-300 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="capitalize">
                        {club.category}
                      </Badge>
                      {club.city && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {club.city.name}
                        </span>
                      )}
                    </div>
                    <CardTitle className="font-serif text-xl">{club.name}</CardTitle>
                    {club.description && (
                      <CardDescription className="line-clamp-2">{club.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {club.member_count} members
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {club.event_count} events
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Clubs;
