import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Search, Users } from "lucide-react";
import { format } from "date-fns";

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
      <div className="container max-w-6xl py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-medium text-display mb-3">
            Upcoming Events
          </h1>
          <p className="text-body text-lg max-w-2xl">
            Browse verified events and register your participation. Every registration 
            is recorded in the immutable ledger.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by event name, venue, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-serif text-2xl font-medium text-display mb-2">No events found</h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? "Try adjusting your search terms" : "Check back soon for upcoming events"}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="group block p-6 rounded-xl border border-border bg-elevated hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {event.city ? `${event.city.name}, ${event.city.country}` : "TBA"}
                  </Badge>
                  {event.max_participants && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      {event.max_participants} spots
                    </span>
                  )}
                </div>

                <h2 className="font-serif text-xl font-medium text-display mb-2 group-hover:text-primary transition-colors">
                  {event.title}
                </h2>

                {event.description && (
                  <p className="text-body text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(event.event_date), "EEEE, MMM d, yyyy")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {event.start_time.slice(0, 5)}
                    {event.end_time && ` - ${event.end_time.slice(0, 5)}`}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-4 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {event.venue}
                </div>

                {event.organizer && (
                  <p className="mt-4 pt-4 border-t border-border text-xs text-subtle">
                    Organized by {event.organizer.display_name}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Events;
