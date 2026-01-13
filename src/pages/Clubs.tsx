import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/GlassCard";
import { Search, Users, Calendar, MapPin, Plus, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { useParallax } from "@/hooks/use-parallax";
import clubsHero from "@/assets/clubs-hero.jpg";

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

  const parallaxOffset = useParallax(0.3);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-32 md:py-40 overflow-hidden">
        {/* Background Image with Parallax */}
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <img 
            src={clubsHero} 
            alt="" 
            className="w-full h-[120%] object-cover opacity-40 grayscale-[30%]"
            style={{ transform: `translateY(${parallaxOffset}px) scale(1.1)` }}
          />
          <div className="absolute inset-0 bg-background/60" />
        </div>
        
        <div className="container max-w-5xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <AnimatedText 
                as="p" 
                className="text-xs font-sans font-light tracking-luxury uppercase text-subtle mb-8"
              >
                Verified Communities
              </AnimatedText>
              
              <AnimatedText as="h1" delay={100} className="font-serif font-light text-display mb-8">
                Find Your Community
              </AnimatedText>
              
              <AnimatedText as="p" delay={200} className="text-lg md:text-xl text-body font-light leading-relaxed max-w-xl">
                Discover verified clubs organizing events in your city. Each club maintains an
                immutable record of their activities.
              </AnimatedText>
            </div>
            
            {profile?.role === "organizer" && (
              <AnimatedText delay={300}>
                <Link 
                  to="/clubs/create"
                  className="inline-flex items-center gap-3 text-xs font-sans tracking-luxury uppercase bg-primary text-primary-foreground px-6 py-4 hover:opacity-90 transition-opacity duration-500"
                >
                  <Plus className="w-4 h-4" />
                  Create Club
                </Link>
              </AnimatedText>
            )}
          </div>

          {/* Filters */}
          <div className="mt-16 space-y-8">
            <div className="border-b border-border/60 pb-4">
              <div className="relative">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
                <Input
                  placeholder="Search clubs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-12 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-subtle font-light"
                />
              </div>
            </div>
            
            <div className="flex gap-6 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`text-xs font-sans tracking-luxury uppercase transition-all duration-500 ${
                    selectedCategory === cat.value
                      ? "text-display"
                      : "text-subtle hover:text-body"
                  }`}
                >
                  {cat.label}
                  {selectedCategory === cat.value && (
                    <span className="block h-px bg-display mt-1" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Clubs Grid */}
      <section className="py-20 md:py-32">
        <div className="container max-w-5xl">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-muted/20"></div>
                </div>
              ))}
            </div>
          ) : filteredClubs.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-8 h-8 text-subtle mx-auto mb-6" />
              <h2 className="font-serif text-2xl font-light text-display mb-4">No clubs found</h2>
              <p className="text-body font-light max-w-md mx-auto mb-8">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your filters"
                  : "Be the first to create a club and build your community"}
              </p>
              {profile?.role === "organizer" && (
                <Link 
                  to="/clubs/create"
                  className="text-xs font-sans tracking-luxury uppercase text-display link-underline"
                >
                  Create a Club
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-16 border-b border-border/40 pb-6">
                <p className="text-xs font-sans tracking-luxury uppercase text-subtle">
                  {filteredClubs.length} Clubs
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredClubs.map((club, index) => (
                  <Link
                    key={club.id}
                    to={`/clubs/${club.id}`}
                    className="group block opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 80}ms`, animationFillMode: "forwards" }}
                  >
                    <GlassCard hover variant="bordered" className="h-full p-8">
                      <div className="flex items-start justify-between mb-6">
                        <span className="text-xs font-sans tracking-luxury uppercase text-subtle">
                          {club.category}
                        </span>
                        {club.city && (
                          <span className="flex items-center gap-1 text-xs text-subtle">
                            <MapPin className="w-3 h-3" />
                            {club.city.name}
                          </span>
                        )}
                      </div>

                      <h2 className="font-serif text-xl font-light text-display mb-4 group-hover:opacity-70 transition-opacity duration-500">
                        {club.name}
                      </h2>

                      {club.description && (
                        <p className="text-body text-sm font-light mb-8 line-clamp-2 leading-relaxed">
                          {club.description}
                        </p>
                      )}

                      <div className="flex items-center gap-6 text-xs text-subtle font-light mb-6">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{club.member_count}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{club.event_count}</span>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-border/30 flex items-center justify-end">
                        <span className="text-xs font-sans tracking-luxury uppercase text-display flex items-center gap-2 group-hover:gap-4 transition-all duration-500">
                          View
                          <ArrowRight className="w-3 h-3" />
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
