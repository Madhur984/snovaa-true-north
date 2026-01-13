import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

  useEffect(() => {
    if (profile?.role === "organizer") {
      // For now, allow organizers to see admin dashboard
      // In production, check for admin role
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
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (profile?.role !== "organizer") {
    return (
      <Layout>
        <div className="container max-w-6xl py-12 text-center">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-serif text-2xl font-medium text-display mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don't have permission to view this page.</p>
          <Button asChild variant="outline">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Background */}
      <div className="fixed inset-0 -z-10">
        <img 
          src={adminHero} 
          alt="" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />
      </div>

      <div className="container max-w-6xl py-12">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-4">
            Admin Analytics
          </Badge>
          <h1 className="font-serif text-3xl font-medium text-display mb-2">System Overview</h1>
          <p className="text-body">Monitor platform health and participation metrics.</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-serif font-medium text-display">{stats?.totalUsers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Clubs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-serif font-medium text-display">{stats?.totalClubs}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Total Events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-serif font-medium text-display">{stats?.totalEvents}</p>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-primary">
                <Database className="w-4 h-4" />
                Ledger Records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-serif font-medium text-primary">
                {stats?.totalParticipationRecords}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Organizers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-serif font-medium text-display">
                {stats?.totalOrganizers}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Cities</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-serif font-medium text-display">{stats?.totalCities}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Published Events</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-serif font-medium text-display">
                {stats?.publishedEvents}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed Events</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-serif font-medium text-display">
                {stats?.completedEvents}
              </p>
            </CardContent>
          </Card>
        </div>

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
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Recent Events</CardTitle>
                <CardDescription>Latest events across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentEvents.map((event) => (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clubs">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Top Clubs by Events</CardTitle>
                <CardDescription>Most active clubs on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topClubs.map((club, index) => (
                    <Link
                      key={club.id}
                      to={`/clubs/${club.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  System Health
                </CardTitle>
                <CardDescription>Platform status and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-accent/30">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="font-medium">Ledger Integrity</span>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Healthy
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-accent/30">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="font-medium">Database Status</span>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Operational
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-accent/30">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="font-medium">Authentication</span>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
