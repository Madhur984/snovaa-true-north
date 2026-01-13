import { useEffect, useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { Search, Users, Calendar, MapPin, Plus, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { WebGLFallback, GradientFallback } from "@/components/3d/WebGLFallback";
import clubsHero from "@/assets/clubs-hero.jpg";

const FloatingShapes = lazy(() => import("@/components/3d/FloatingShapes").then(m => ({ default: m.FloatingShapes })));

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
  { value: "all", label: "All" },
  { value: "run", label: "Running" },
  { value: "fitness", label: "Fitness" },
  { value: "chess", label: "Chess" },
  { value: "tech", label: "Tech" },
  { value: "photography", label: "Photo" },
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
    const { data: clubsData, error } = await supabase
      .from("clubs")
      .select(`
        *,
        city:cities(name, country)
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (!error && clubsData) {
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
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Image - Enhanced visibility */}
        <div className="absolute inset-0 -z-20">
          <img 
            src={clubsHero} 
            alt="" 
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
        </div>
        
        <WebGLFallback fallback={<GradientFallback className="opacity-50" />}>
          <Suspense fallback={null}>
            <FloatingShapes />
          </Suspense>
        </WebGLFallback>
        
        <div className="container max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Badge className="mb-4 px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-0">
                <Sparkles className="w-4 h-4 mr-2" />
                Verified Communities
              </Badge>
              
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-display mb-4 leading-tight">
                Find Your{" "}
                <span className="bg-gradient-to-r from-primary via-primary/80 to-teal-600 bg-clip-text text-transparent">
                  Community
                </span>
              </h1>
              
              <p className="text-xl text-body max-w-2xl">
                Discover verified clubs organizing events in your city. Each club maintains an
                immutable record of their activities.
              </p>
            </div>
            
            {profile?.role === "organizer" && (
              <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/20">
                <Link to="/clubs/create">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Club
                </Link>
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mt-10">
            <GlassCard className="p-2 flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search clubs by name, description, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </GlassCard>
            
            <div className="flex gap-2 flex-wrap lg:flex-nowrap">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`rounded-full px-4 ${
                    selectedCategory === cat.value
                      ? "shadow-md shadow-primary/20"
                      : "bg-background/50 backdrop-blur-sm"
                  }`}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Clubs Grid */}
      <section className="py-16">
        <div className="container max-w-6xl">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-56 bg-muted/50 rounded-2xl backdrop-blur-sm"></div>
                </div>
              ))}
            </div>
          ) : filteredClubs.length === 0 ? (
            <GlassCard className="p-16 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-teal-500/20 flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-serif text-2xl font-medium text-display mb-3">No clubs found</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your filters"
                  : "Be the first to create a club and build your community"}
              </p>
              {profile?.role === "organizer" && (
                <Button asChild className="rounded-xl">
                  <Link to="/clubs/create">Create a Club</Link>
                </Button>
              )}
            </GlassCard>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-body">
                  <span className="font-medium text-display">{filteredClubs.length}</span> clubs found
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClubs.map((club, index) => (
                  <Link
                    key={club.id}
                    to={`/clubs/${club.id}`}
                    className="group block opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}
                  >
                    <GlassCard hover className="h-full p-6 flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <Badge className="bg-primary/10 text-primary border-0 capitalize hover:bg-primary/20">
                          {club.category}
                        </Badge>
                        {club.city && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                            <MapPin className="w-3 h-3" />
                            {club.city.name}
                          </span>
                        )}
                      </div>

                      <h2 className="font-serif text-xl font-medium text-display mb-3 group-hover:text-primary transition-colors">
                        {club.name}
                      </h2>

                      {club.description && (
                        <p className="text-body text-sm mb-6 line-clamp-2 flex-grow">
                          {club.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <span>{club.member_count} members</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-primary" />
                          </div>
                          <span>{club.event_count} events</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-end">
                        <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          View Club
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </GlassCard>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Clubs;
