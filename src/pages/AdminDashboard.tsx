import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Calendar, Building, 
  Shield, Database, Activity, BarChart3, UserCog
} from "lucide-react";
import { UserManagement } from "@/components/admin/UserManagement";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { 
  fadeUp, 
  fadeOnly, 
  statsContainer, 
  statCard, 
  feedContainer, 
  feedItem,
  scrollViewport 
} from "@/lib/motion";
import { useParallax } from "@/hooks/use-parallax";
import adminHero from "@/assets/admin-hero.jpg";

interface SystemStats {
  totalUsers: number;
  totalOrganizers: number;
  totalClubs: number;
  totalEvents: number;
  totalCities: number;
  totalParticipationRecords: number;
  publishedEvents: number;
  completedEvents: number;
}

interface RecentEvent {
  id: string;
  title: string;
  status: string;
  event_date: string;
  organizer: { display_name: string } | null;
}

interface TopClub {
  id: string;
  name: string;
  category: string;
  event_count: number;
}

const AdminDashboard = () => {
  const { profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [topClubs, setTopClubs] = useState<TopClub[]>([]);
  const [loading, setLoading] = useState(true);
  const parallaxOffset = useParallax(0.3);

  useEffect(() => {
    if (profile?.role === "organizer") {
      fetchStats();
      fetchRecentEvents();
      fetchTopClubs();
    }
  }, [profile]);

  const fetchStats = async () => {
    const [
      usersRes,
      organizersRes,
      clubsRes,
      eventsRes,
      citiesRes,
      ledgerRes,
      publishedRes,
      completedRes,
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase.from("profiles").select("id", { count: "exact" }).eq("role", "organizer"),
      supabase.from("clubs").select("id", { count: "exact" }),
      supabase.from("events").select("id", { count: "exact" }),
      supabase.from("cities").select("id", { count: "exact" }),
      supabase.from("participation_ledger").select("id", { count: "exact" }),
      supabase.from("events").select("id", { count: "exact" }).eq("status", "published"),
      supabase.from("events").select("id", { count: "exact" }).eq("status", "completed"),
    ]);

    setStats({
      totalUsers: usersRes.count || 0,
      totalOrganizers: organizersRes.count || 0,
      totalClubs: clubsRes.count || 0,
      totalEvents: eventsRes.count || 0,
      totalCities: citiesRes.count || 0,
      totalParticipationRecords: ledgerRes.count || 0,
      publishedEvents: publishedRes.count || 0,
      completedEvents: completedRes.count || 0,
    });
    setLoading(false);
  };

  const fetchRecentEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("id, title, status, event_date, organizer:profiles!events_organizer_id_fkey(display_name)")
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) setRecentEvents(data as unknown as RecentEvent[]);
  };

  const fetchTopClubs = async () => {
    const { data: clubs } = await supabase
      .from("clubs")
      .select("id, name, category")
      .eq("status", "active");

    if (clubs) {
      const clubsWithCounts = await Promise.all(
        clubs.map(async (club) => {
          const { count } = await supabase
            .from("events")
            .select("id", { count: "exact" })
            .eq("club_id", club.id);

          return { ...club, event_count: count || 0 };
        })
      );

      setTopClubs(
        clubsWithCounts.sort((a, b) => b.event_count - a.event_count).slice(0, 5)
      );
    }
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

  if (profile?.role !== "organizer") {
    return (
      <Layout>
        <motion.div 
          className="container max-w-6xl py-12 text-center"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" strokeWidth={1} />
          <h1 className="font-serif text-2xl font-light text-display mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6 font-light">You don't have permission to view this page.</p>
          <Button asChild variant="outline">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </motion.div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Background with Parallax */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <img 
          src={adminHero} 
          alt="" 
          className="w-full h-[120%] object-cover opacity-55"
          style={{ transform: `translateY(${parallaxOffset}px) scale(1.05)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />
      </div>

      <motion.div 
        className="container max-w-6xl py-12"
        variants={fadeOnly}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div 
          className="mb-8"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
        >
          <Badge variant="secondary" className="mb-4">
            Admin Analytics
          </Badge>
          <h1 className="font-serif text-3xl font-light text-display mb-2">System Overview</h1>
          <p className="text-body font-light">Monitor platform health and participation metrics.</p>
        </motion.div>

        {/* Main Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          variants={statsContainer}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
        >
          <motion.div variants={statCard}>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-serif font-light text-display">{stats?.totalUsers}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={statCard}>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Clubs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-serif font-light text-display">{stats?.totalClubs}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={statCard}>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Total Events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-serif font-light text-display">{stats?.totalEvents}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={statCard}>
            <Card className="border-primary/30">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-primary">
                  <Database className="w-4 h-4" />
                  Ledger Records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-serif font-light text-primary">
                  {stats?.totalParticipationRecords}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Secondary Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          variants={statsContainer}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
        >
          <motion.div variants={statCard}>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Organizers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-serif font-light text-display">
                  {stats?.totalOrganizers}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={statCard}>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Cities</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-serif font-light text-display">{stats?.totalCities}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={statCard}>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Published Events</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-serif font-light text-display">
                  {stats?.publishedEvents}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={statCard}>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Completed Events</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-serif font-light text-display">
                  {stats?.completedEvents}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Tabs Content */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="analytics" className="gap-1.5">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5">
              <UserCog className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="events">Recent Events</TabsTrigger>
            <TabsTrigger value="clubs">Top Clubs</TabsTrigger>
            <TabsTrigger value="health">System Health</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AnalyticsCharts />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="events">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif font-light">Recent Events</CardTitle>
                  <CardDescription>Latest events across the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div 
                    className="space-y-3"
                    variants={feedContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {recentEvents.map((event) => (
                      <motion.div key={event.id} variants={feedItem}>
                        <Link
                          to={`/events/${event.id}`}
                          className="flex items-center justify-between p-3 rounded-lg border border-border hover:opacity-95 transition-opacity duration-350"
                        >
                          <div>
                            <p className="font-medium text-display">{event.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {event.organizer?.display_name} • {event.event_date}
                            </p>
                          </div>
                          <Badge
                            variant={
                              event.status === "published"
                                ? "default"
                                : event.status === "live"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {event.status}
                          </Badge>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="clubs">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif font-light">Top Clubs by Events</CardTitle>
                  <CardDescription>Most active clubs on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div 
                    className="space-y-3"
                    variants={feedContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {topClubs.map((club, index) => (
                      <motion.div key={club.id} variants={feedItem}>
                        <Link
                          to={`/clubs/${club.id}`}
                          className="flex items-center justify-between p-3 rounded-lg border border-border hover:opacity-95 transition-opacity duration-350"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-display">{club.name}</p>
                              <Badge variant="outline" className="text-xs capitalize">
                                {club.category}
                              </Badge>
                            </div>
                          </div>
                          <span className="text-muted-foreground">{club.event_count} events</span>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="health">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif font-light flex items-center gap-2">
                    <Activity className="w-5 h-5" strokeWidth={1} />
                    System Health
                  </CardTitle>
                  <CardDescription>Platform status and metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div 
                    className="space-y-4"
                    variants={feedContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {[
                      { label: "Ledger Integrity", status: "Healthy" },
                      { label: "Database Status", status: "Operational" },
                      { label: "Authentication", status: "Active" },
                    ].map((item) => (
                      <motion.div 
                        key={item.label}
                        variants={feedItem}
                        className="flex items-center justify-between p-4 rounded-lg bg-accent/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {item.status}
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
};

export default AdminDashboard;
