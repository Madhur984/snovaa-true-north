import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Users, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import dashboardHero from "@/assets/dashboard-hero.jpg";
interface Event {
  id: string;
  title: string;
  venue: string;
  event_date: string;
  start_time: string;
  status: string;
  city: { name: string; country: string } | null;
}

interface Participation {
  id: string;
  action: string;
  recorded_at: string;
  event: Event | null;
}

const Dashboard = () => {
  const { profile, loading: authLoading } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [myParticipation, setMyParticipation] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;

    // Fetch upcoming events for organizers
    if (profile.role === "organizer") {
      const { data: events } = await supabase
        .from("events")
        .select("*, city:cities(name, country)")
        .eq("organizer_id", profile.id)
        .gte("event_date", new Date().toISOString().split("T")[0])
        .order("event_date", { ascending: true })
        .limit(5);

      if (events) setUpcomingEvents(events);
    }

    // Fetch participation history
    const { data: participation } = await supabase
      .from("participation_ledger")
      .select("*, event:events(*, city:cities(name, country))")
      .eq("participant_id", profile.id)
      .order("recorded_at", { ascending: false })
      .limit(10);

    if (participation) {
      setMyParticipation(participation as unknown as Participation[]);
    }

    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container max-w-6xl py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Background */}
      <div className="fixed inset-0 -z-10">
        <img 
          src={dashboardHero} 
          alt="" 
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/90 to-background" />
      </div>

      <div className="container max-w-6xl py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-medium text-display mb-1">
              Welcome, {profile?.display_name}
            </h1>
            <p className="text-body">
              {profile?.role === "organizer" 
                ? "Manage your events and track participation." 
                : "View your participation history and upcoming events."}
            </p>
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

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {profile?.role}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Events Attended</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-serif font-medium text-display">
                {myParticipation.filter(p => p.action === "attended").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Upcoming Registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-serif font-medium text-display">
                {myParticipation.filter(p => p.action === "registered" || p.action === "confirmed").length}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Organizer: Upcoming Events */}
          {profile?.role === "organizer" && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl">Your Upcoming Events</CardTitle>
                <CardDescription>Events you're organizing</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-4">No upcoming events</p>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/events/create">Create your first event</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <Link 
                        key={event.id} 
                        to={`/events/${event.id}`}
                        className="block p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-display">{event.title}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {format(new Date(event.event_date), "MMM d, yyyy")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {event.start_time.slice(0, 5)}
                              </span>
                            </div>
                          </div>
                          <Badge variant={event.status === "published" ? "default" : "secondary"}>
                            {event.status}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Participation History */}
          <Card className={profile?.role === "participant" ? "lg:col-span-2" : ""}>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Participation Ledger</CardTitle>
              <CardDescription>Your immutable record of participation</CardDescription>
            </CardHeader>
            <CardContent>
              {myParticipation.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">No participation records yet</p>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/events">Browse events</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myParticipation
                    .filter((record) => record.event !== null)
                    .map((record) => (
                    <div 
                      key={record.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div>
                        <p className="font-medium text-display text-sm">{record.event!.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {record.event!.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {record.event!.city.name}
                            </span>
                          )}
                          <span>
                            {format(new Date(record.recorded_at), "MMM d, yyyy 'at' HH:mm")}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          record.action === "attended" ? "default" : 
                          record.action === "cancelled" ? "destructive" : "secondary"
                        }
                      >
                        {record.action}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
