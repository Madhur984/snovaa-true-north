import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Clock, Plus, Users } from "lucide-react";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  venue: string;
  event_date: string;
  start_time: string;
  status: string;
  city: { name: string; country: string } | null;
}

const MyEvents = () => {
  const { profile } = useAuth();
  const [organizedEvents, setOrganizedEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchEvents();
    }
  }, [profile]);

  const fetchEvents = async () => {
    if (!profile) return;

    // Fetch events organized by user
    if (profile.role === "organizer") {
      const { data: organized } = await supabase
        .from("events")
        .select("*, city:cities(name, country)")
        .eq("organizer_id", profile.id)
        .order("event_date", { ascending: false });

      if (organized) setOrganizedEvents(organized);
    }

    // Fetch events user is registered for
    const { data: participation } = await supabase
      .from("participation_ledger")
      .select("event_id")
      .eq("participant_id", profile.id)
      .in("action", ["registered", "confirmed"]);

    if (participation && participation.length > 0) {
      const eventIds = [...new Set(participation.map(p => p.event_id))];
      
      const { data: events } = await supabase
        .from("events")
        .select("*, city:cities(name, country)")
        .in("id", eventIds)
        .order("event_date", { ascending: true });

      if (events) setRegisteredEvents(events);
    }

    setLoading(false);
  };

  const EventCard = ({ event }: { event: Event }) => (
    <Link
      to={`/events/${event.id}`}
      className="block p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-display">{event.title}</h3>
        <Badge variant={event.status === "published" ? "default" : event.status === "completed" ? "secondary" : "outline"}>
          {event.status}
        </Badge>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          {format(new Date(event.event_date), "MMM d, yyyy")}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          {event.start_time.slice(0, 5)}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5" />
          {event.venue}
          {event.city && ` • ${event.city.name}`}
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-4xl py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-medium text-display mb-1">My Events</h1>
            <p className="text-body">Manage your events and registrations.</p>
          </div>
          {profile?.role === "organizer" && (
            <Button asChild>
              <Link to="/events/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Link>
            </Button>
          )}
        </div>

        <Tabs defaultValue={profile?.role === "organizer" ? "organized" : "registered"}>
          <TabsList className="mb-6">
            {profile?.role === "organizer" && (
              <TabsTrigger value="organized">Organized</TabsTrigger>
            )}
            <TabsTrigger value="registered">Registered</TabsTrigger>
          </TabsList>

          {profile?.role === "organizer" && (
            <TabsContent value="organized">
              {organizedEvents.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-serif text-xl font-medium text-display mb-2">No events yet</h3>
                    <p className="text-muted-foreground mb-6">Create your first event to start tracking participation.</p>
                    <Button asChild>
                      <Link to="/events/create">Create Event</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Events You Organize</CardTitle>
                    <CardDescription>{organizedEvents.length} total events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {organizedEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          <TabsContent value="registered">
            {registeredEvents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-serif text-xl font-medium text-display mb-2">No registrations</h3>
                  <p className="text-muted-foreground mb-6">Browse upcoming events and register to participate.</p>
                  <Button asChild variant="outline">
                    <Link to="/events">Browse Events</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Your Registrations</CardTitle>
                  <CardDescription>{registeredEvents.length} events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {registeredEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyEvents;
