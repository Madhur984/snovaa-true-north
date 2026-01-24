import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Users, ArrowLeft, Plus, Settings } from "lucide-react";
import { format } from "date-fns";

interface Club {
  id: string;
  name: string;
  description: string | null;
  category: string;
  status: string;
  created_at: string;
  verified_at: string | null;
  city: { id: string; name: string; country: string } | null;
}

interface Event {
  id: string;
  title: string;
  event_date: string;
  start_time: string;
  venue: string;
  status: string;
}

interface Organizer {
  id: string;
  role: string;
  profile: { id: string; display_name: string };
}

const ClubDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchClub();
      fetchEvents();
      fetchOrganizers();
      fetchMemberStatus();
    }
  }, [id, profile?.id]);

  const fetchClub = async () => {
    const { data, error } = await supabase
      .from("clubs")
      .select("*, city:cities(id, name, country)")
      .eq("id", id)
      .single();

    if (!error && data) {
      setClub(data as Club);
    }
    setLoading(false);
  };

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("id, title, event_date, start_time, venue, status")
      .eq("club_id", id)
      .order("event_date", { ascending: false })
      .limit(10);

    if (data) setEvents(data);
  };

  const fetchOrganizers = async () => {
    const { data } = await supabase
      .from("club_organizers")
      .select("id, role, profile:profiles(id, display_name)")
      .eq("club_id", id);

    if (data) {
      setOrganizers(data as unknown as Organizer[]);
      // Check if current user is an organizer
      if (profile) {
        setIsOrganizer(data.some((o: Organizer) => o.profile?.id === profile.id));
      }
    }
  };

  const fetchMemberStatus = async () => {
    // Get member count
    const { count } = await supabase
      .from("club_members")
      .select("id", { count: "exact" })
      .eq("club_id", id);

    setMemberCount(count || 0);

    // Check if current user is a member
    if (profile) {
      const { data } = await supabase
        .from("club_members")
        .select("id")
        .eq("club_id", id)
        .eq("profile_id", profile.id)
        .maybeSingle();

      setIsMember(!!data);
    }
  };

  const handleJoinClub = async () => {
    if (!profile) {
      toast({ title: "Please sign in to join clubs", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("club_members").insert({
      club_id: id,
      profile_id: profile.id,
    });

    if (error) {
      toast({ title: "Failed to join club", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome!", description: "You've joined the club." });
      setIsMember(true);
      setMemberCount((prev) => prev + 1);
    }
  };

  if (loading) {
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

  if (!club) {
    return (
      <Layout>
        <div className="container max-w-6xl py-12 text-center">
          <h1 className="font-serif text-2xl font-medium text-display mb-4">Club not found</h1>
          <Button asChild variant="outline">
            <Link to="/clubs">Back to Clubs</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-6xl py-12">
        {/* Back Link */}
        <Link
          to="/clubs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-display mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clubs
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="secondary" className="capitalize">
                {club.category}
              </Badge>
              {club.verified_at && <Badge variant="default">Verified</Badge>}
            </div>
            <h1 className="font-serif text-4xl font-medium text-display mb-2">{club.name}</h1>
            {club.city && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {club.city.name}, {club.city.country}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            {isOrganizer && (
              <Button asChild variant="outline">
                <Link to={`/clubs/${id}/manage`}>
                  <Settings className="w-4 h-4 mr-2" />
                  Manage
                </Link>
              </Button>
            )}
            {!isMember && !isOrganizer && (
              <Button onClick={handleJoinClub}>
                <Users className="w-4 h-4 mr-2" />
                Join Club
              </Button>
            )}
            {isMember && <Badge variant="outline">Member</Badge>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Members</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-serif font-medium text-display">{memberCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Events</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-serif font-medium text-display">{events.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Organizers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-serif font-medium text-display">{organizers.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="organizers">Organizers</TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">About this Club</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body">{club.description || "No description provided."}</p>
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Created on {format(new Date(club.created_at), "MMMM d, yyyy")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-serif">Club Events</CardTitle>
                  <CardDescription>Events organized by this club</CardDescription>
                </div>
                {isOrganizer && (
                  <Button asChild size="sm">
                    <Link to={`/events/create?club=${id}`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Link>
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No events yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {events.map((event) => (
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
                              <span>{event.venue}</span>
                            </div>
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
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organizers">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Club Organizers</CardTitle>
                <CardDescription>People who manage this club</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {organizers.map((org) => (
                    <div
                      key={org.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {org.profile.display_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-display">{org.profile.display_name}</span>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {org.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ClubDetail;
