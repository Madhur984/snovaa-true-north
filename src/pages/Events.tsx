import { useEffect, useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GlassCard, GlassImageCard } from "@/components/ui/GlassCard";
import { Calendar, MapPin, Clock, Search, Users, ArrowRight, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { WebGLFallback, GradientFallback } from "@/components/3d/WebGLFallback";
import eventsHero from "@/assets/events-hero.jpg";

// Event category images
import eventFitness from "@/assets/event-fitness.jpg";
import eventTech from "@/assets/event-tech.jpg";
import eventMusic from "@/assets/event-music.jpg";
import eventWorkshop from "@/assets/event-workshop.jpg";
import eventSocial from "@/assets/event-social.jpg";
import eventArt from "@/assets/event-art.jpg";

const FloatingShapes = lazy(() => import("@/components/3d/FloatingShapes").then(m => ({ default: m.FloatingShapes })));

// Array of event images to cycle through
const eventImages = [eventFitness, eventTech, eventMusic, eventWorkshop, eventSocial, eventArt];

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

  // Get an image for an event based on its index
  const getEventImage = (index: number) => {
    return eventImages[index % eventImages.length];
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Image with stronger blur */}
        <div className="absolute inset-0 -z-20">
          <img 
            src={eventsHero} 
            alt="" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 backdrop-blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        </div>
        
        <WebGLFallback fallback={<GradientFallback className="opacity-50" />}>
          <Suspense fallback={null}>
            <FloatingShapes />
          </Suspense>
        </WebGLFallback>
        
        <div className="container max-w-6xl relative z-10">
          <div className="max-w-3xl">
            <Badge className="mb-4 px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-0 backdrop-blur-sm">
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

            {/* Enhanced Glass Search Bar */}
            <GlassCard variant="frosted" className="p-2">
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-muted/30 rounded-t-2xl backdrop-blur-sm"></div>
                  <div className="h-48 bg-muted/50 rounded-b-2xl backdrop-blur-sm"></div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <GlassCard variant="gradient" className="p-16 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-teal-500/20 flex items-center justify-center mb-6 backdrop-blur-sm">
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
                <GlassCard variant="frosted" className="px-4 py-2 inline-flex">
                  <p className="text-body">
                    <span className="font-medium text-display">{filteredEvents.length}</span> events found
                  </p>
                </GlassCard>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event, index) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="block opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 80}ms`, animationFillMode: "forwards" }}
                  >
                    <GlassImageCard imageUrl={getEventImage(index)}>
                      <div className="p-5">
                        {/* Top badges - positioned over the image transition */}
                        <div className="flex items-start justify-between mb-3 -mt-12 relative z-20">
                          <Badge className="bg-white/90 dark:bg-black/70 text-foreground border-0 backdrop-blur-md shadow-lg">
                            {event.city ? `${event.city.name}` : "TBA"}
                          </Badge>
                          {event.max_participants && (
                            <span className="flex items-center gap-1 text-xs text-white bg-black/50 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-lg">
                              <Users className="w-3 h-3" />
                              {event.max_participants}
                            </span>
                          )}
                        </div>

                        <h2 className="font-serif text-xl font-medium text-display mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {event.title}
                        </h2>

                        {event.description && (
                          <p className="text-body text-sm mb-4 line-clamp-2">
                            {event.description}
                          </p>
                        )}

                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 backdrop-blur-sm flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-primary" />
                            </div>
                            <span>{format(new Date(event.event_date), "EEE, MMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 backdrop-blur-sm flex items-center justify-center">
                              <Clock className="w-4 h-4 text-primary" />
                            </div>
                            <span>
                              {event.start_time.slice(0, 5)}
                              {event.end_time && ` - ${event.end_time.slice(0, 5)}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 backdrop-blur-sm flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-primary" />
                            </div>
                            <span className="line-clamp-1">{event.venue}</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border/30 flex items-center justify-between">
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
                      </div>
                    </GlassImageCard>
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