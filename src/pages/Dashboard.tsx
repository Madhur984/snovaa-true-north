import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Users, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { 
  fadeUp, 
  fadeOnly, 
  statsContainer, 
  statCard, 
  feedContainer, 
  feedItem,
  scrollViewport 
} from "@/lib/motion";
import dashboardHero from "@/assets/dashboard-hero.jpg";
import { useParallax } from "@/hooks/use-parallax";

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
  const parallaxOffset = useParallax(0.3);

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;

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
          <motion.div 
            variants={fadeOnly}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Background with Parallax */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <img 
          src={dashboardHero} 
          alt="" 
          className="w-full h-[120%] object-cover opacity-15"
          style={{ transform: `translateY(${parallaxOffset}px) scale(1.05)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/90 to-background" />
      </div>

      <motion.div 
        className="container max-w-6xl py-12"
        variants={fadeOnly}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div 
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
        >
          <div>
            <h1 className="font-serif text-3xl font-light text-display mb-1">
              Welcome, {profile?.display_name}
            </h1>
            <p className="text-body font-light">
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
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid md:grid-cols-3 gap-4 mb-8"
          variants={statsContainer}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
        >
          <motion.div variants={statCard}>
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
          </motion.div>
          
          <motion.div variants={statCard}>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Events Attended</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-serif font-light text-display">
                  {myParticipation.filter(p => p.action === "attended").length}
                </p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={statCard}>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Upcoming Registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-serif font-light text-display">
                  {myParticipation.filter(p => p.action === "registered" || p.action === "confirmed").length}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Organizer: Upcoming Events */}
          {profile?.role === "organizer" && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={scrollViewport}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-xl font-light">Your Upcoming Events</CardTitle>
                  <CardDescription>Events you're organizing</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" strokeWidth={1} />
                      <p className="text-muted-foreground mb-4 font-light">No upcoming events</p>
                      <Button asChild variant="outline" size="sm">
                        <Link to="/events/create">Create your first event</Link>
                      </Button>
                    </div>
                  ) : (
                    <motion.div 
                      className="space-y-4"
                      variants={feedContainer}
                      initial="hidden"
                      animate="visible"
                    >
                      {upcomingEvents.map((event) => (
                        <motion.div key={event.id} variants={feedItem}>
                          <Link 
                            to={`/events/${event.id}`}
                            className="block p-4 rounded-lg border border-border hover:opacity-95 transition-opacity duration-350"
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
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Participation History */}
          <motion.div 
            className={profile?.role === "participant" ? "lg:col-span-2" : ""}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewport}
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl font-light">Participation Ledger</CardTitle>
                <CardDescription>Your immutable record of participation</CardDescription>
              </CardHeader>
              <CardContent>
                {myParticipation.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" strokeWidth={1} />
                    <p className="text-muted-foreground mb-4 font-light">No participation records yet</p>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/events">Browse events</Link>
                    </Button>
                  </div>
                ) : (
                  <motion.div 
                    className="space-y-3"
                    variants={feedContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {myParticipation
                      .filter((record) => record.event !== null)
                      .map((record) => (
                      <motion.div 
                        key={record.id}
                        variants={feedItem}
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
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
