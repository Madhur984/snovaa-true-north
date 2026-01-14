import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { GlassCard, GlassImageCard } from "@/components/ui/GlassCard";
import { HeroBackground } from "@/components/ui/HeroBackground";
import { Calendar, MapPin, Clock, Search, Users, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { fadeUp, fadeOnly, feedContainer, feedItem, editorialContainer, scrollViewport } from "@/lib/motion";
import eventsHero from "@/assets/events-hero.jpg";

// Event category images
import eventFitness from "@/assets/event-fitness.jpg";
import eventTech from "@/assets/event-tech.jpg";
import eventMusic from "@/assets/event-music.jpg";
import eventWorkshop from "@/assets/event-workshop.jpg";
import eventSocial from "@/assets/event-social.jpg";
import eventArt from "@/assets/event-art.jpg";

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
      {/* Full-page background with vignette */}
      <HeroBackground 
        image={eventsHero} 
        speed={0.25} 
        opacity={75} 
        grayscale={30} 
        overlay="medium"
        vignette
      />

      {/* Hero Section - Editorial, minimal */}
      <section className="relative py-32 md:py-40 overflow-hidden">
        
        <div className="container max-w-5xl relative z-10">
          <motion.div 
            className="max-w-3xl"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewport}
          >
            <p className="text-xs font-sans font-light tracking-luxury uppercase text-subtle mb-8">
              Curated Gatherings
            </p>
            
            <h1 className="font-serif text-4xl md:text-5xl font-light text-display mb-8">
              Discover Events
            </h1>
            
            <p className="text-lg md:text-xl text-body font-light leading-relaxed max-w-xl mb-12">
              Browse verified events and register your participation. Every registration 
              is recorded with integrity.
            </p>

            {/* Minimal Search */}
            <div className="border-b border-border/60 pb-4">
              <div className="relative">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-12 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-subtle font-light"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-20 md:py-32">
        <div className="container max-w-5xl">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-12">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-muted/30"></div>
                  <div className="h-32 bg-muted/20 mt-6"></div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-8 h-8 text-subtle mx-auto mb-6" />
              <h2 className="font-serif text-2xl font-light text-display mb-4">No events found</h2>
              <p className="text-body font-light max-w-md mx-auto mb-8">
                {searchQuery ? "Try adjusting your search terms" : "Check back soon for upcoming events"}
              </p>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="text-xs font-sans tracking-luxury uppercase text-display link-underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-16 border-b border-border/40 pb-6">
                <p className="text-xs font-sans tracking-luxury uppercase text-subtle">
                  {filteredEvents.length} Events
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
                {filteredEvents.map((event, index) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="group block opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
                  >
                    <GlassImageCard imageUrl={getEventImage(index)}>
                      <div className="p-6 md:p-8">
                        {/* Location */}
                        <p className="text-xs font-sans tracking-luxury uppercase text-subtle mb-4">
                          {event.city ? event.city.name : "Location TBA"}
                        </p>

                        <h2 className="font-serif text-xl md:text-2xl font-light text-display mb-4 group-hover:opacity-70 transition-opacity duration-500">
                          {event.title}
                        </h2>

                        {event.description && (
                          <p className="text-body text-sm font-light mb-6 line-clamp-2 leading-relaxed">
                            {event.description}
                          </p>
                        )}

                        <div className="space-y-3 text-sm text-subtle font-light mb-6">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(event.event_date), "MMMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4" />
                            <span>
                              {event.start_time.slice(0, 5)}
                              {event.end_time && ` — ${event.end_time.slice(0, 5)}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{event.venue}</span>
                          </div>
                          {event.max_participants && (
                            <div className="flex items-center gap-3">
                              <Users className="w-4 h-4" />
                              <span>{event.max_participants} seats</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-6 border-t border-border/30 flex items-center justify-between">
                          {event.organizer && (
                            <p className="text-xs text-subtle font-light">
                              by {event.organizer.display_name}
                            </p>
                          )}
                          <span className="text-xs font-sans tracking-luxury uppercase text-display flex items-center gap-2 group-hover:gap-4 transition-all duration-500">
                            View
                            <ArrowRight className="w-3 h-3" />
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
