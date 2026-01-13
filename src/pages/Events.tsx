import { useEffect, useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { Calendar, MapPin, Clock, Search, Users, ArrowRight, Sparkles } from "lucide-react";
import { format } from "date-fns";

const FloatingShapes = lazy(() => import("@/components/3d/FloatingShapes").then(m => ({ default: m.FloatingShapes })));

interface Event {
  id: string;
  title: string;
  description: string | null;
  venue: string;
  event_date: string;
  start_time: string;
  end_time: string | null;
  max_participants: number | null;
  status: string;
  city: { name: string; country: string } | null;
  organizer: { display_name: string } | null;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*, city:cities(name, country), organizer:profiles!events_organizer_id_fkey(display_name)")
      .eq("status", "published")
      .gte("event_date", new Date().toISOString().split("T")[0])
      .order("event_date", { ascending: true });

    if (!error && data) {
      setEvents(data as unknown as Event[]);
    }
    setLoading(false);
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <Suspense fallback={null}>
          <FloatingShapes />
        </Suspense>
        
        <div className="container max-w-6xl relative z-10">
          <div className="max-w-3xl">
            <Badge className="mb-4 px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-0">
              <Sparkles className="w-4 h-4 mr-2" />
              Verified Gatherings
            </Badge>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-display mb-4 leading-tight">
              Discover{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-teal-600 bg-clip-text text-transparent">
                Authentic Events
              </span>
            </h1>
            
            <p className="text-xl text-body max-w-2xl mb-8">
              Browse verified events and register your participation. Every registration 
              is recorded in the immutable ledger.
            </p>

            {/* Search */}
            <GlassCard className="p-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by event name, venue, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="container max-w-6xl">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-64 bg-muted/50 rounded-2xl backdrop-blur-sm"></div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <GlassCard className="p-16 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-teal-500/20 flex items-center justify-center mb-6">
                <Calendar className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-serif text-2xl font-medium text-display mb-3">No events found</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery ? "Try adjusting your search terms" : "Check back soon for upcoming verified events"}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery("")} className="rounded-xl">
                  Clear search
                </Button>
              )}
            </GlassCard>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-body">
                  <span className="font-medium text-display">{filteredEvents.length}</span> events found
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="group block opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}
                  >
                    <GlassCard hover className="h-full p-6 flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <Badge className="bg-primary/10 text-primary border-0 hover:bg-primary/20">
                          {event.city ? `${event.city.name}` : "TBA"}
                        </Badge>
                        {event.max_participants && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                            <Users className="w-3 h-3" />
                            {event.max_participants}
                          </span>
                        )}
                      </div>

                      <h2 className="font-serif text-xl font-medium text-display mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {event.title}
                      </h2>

                      {event.description && (
                        <p className="text-body text-sm mb-4 line-clamp-2 flex-grow">
                          {event.description}
                        </p>
                      )}

                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-primary" />
                          </div>
                          <span>{format(new Date(event.event_date), "EEE, MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-primary" />
                          </div>
                          <span>
                            {event.start_time.slice(0, 5)}
                            {event.end_time && ` - ${event.end_time.slice(0, 5)}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-primary" />
                          </div>
                          <span className="line-clamp-1">{event.venue}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                        {event.organizer && (
                          <p className="text-xs text-subtle">
                            by {event.organizer.display_name}
                          </p>
                        )}
                        <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          View Event
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

export default Events;
