import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Clock, Users, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
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
  organizer_id: string;
  city: { name: string; country: string } | null;
  organizer: { display_name: string } | null;
}

interface Module {
  id: string;
  module_type: string;
  config: unknown;
  enabled: boolean;
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [participationStatus, setParticipationStatus] = useState<string>("none");
  const [participantCount, setParticipantCount] = useState({ registered: 0, confirmed: 0, attended: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEvent();
      fetchModules();
      if (profile) {
        fetchParticipationStatus();
      }
    }
  }, [id, profile]);

  const fetchEvent = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*, city:cities(name, country), organizer:profiles!events_organizer_id_fkey(display_name)")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      navigate("/events");
      return;
    }

    setEvent(data as unknown as Event);
    
    // Fetch participant count
    const { data: countData } = await supabase.rpc("get_event_participation_count", { p_event_id: id });
    if (countData && countData[0]) {
      setParticipantCount({
        registered: Number(countData[0].registered) || 0,
        confirmed: Number(countData[0].confirmed) || 0,
        attended: Number(countData[0].attended) || 0,
      });
    }
    
    setLoading(false);
  };

  const fetchModules = async () => {
    const { data } = await supabase
      .from("event_modules")
      .select("*")
      .eq("event_id", id)
      .eq("enabled", true);

    if (data) setModules(data);
  };

  const fetchParticipationStatus = async () => {
    if (!profile) return;
    
    const { data } = await supabase.rpc("get_participation_status", {
      p_event_id: id,
      p_participant_id: profile.id,
    });

    if (data) setParticipationStatus(data);
  };

  const handleRegister = async () => {
    if (!profile) {
      navigate("/login");
      return;
    }

    setActionLoading(true);

    const { error } = await supabase.from("participation_ledger").insert({
      event_id: id,
      participant_id: profile.id,
      action: "registered",
      recorded_by: profile.id,
    });

    if (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Registered",
        description: "Your participation has been recorded in the ledger.",
      });
      setParticipationStatus("registered");
      setParticipantCount(prev => ({ ...prev, registered: prev.registered + 1 }));
    }

    setActionLoading(false);
  };

  const handleCancel = async () => {
    if (!profile) return;

    setActionLoading(true);

    const { error } = await supabase.from("participation_ledger").insert({
      event_id: id,
      participant_id: profile.id,
      action: "cancelled",
      recorded_by: profile.id,
    });

    if (error) {
      toast({
        title: "Cancellation failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Cancelled",
        description: "Your cancellation has been recorded.",
      });
      setParticipationStatus("cancelled");
    }

    setActionLoading(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-4xl py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!event) return null;

  const isOrganizer = profile?.id === event.organizer_id;
  const isPast = new Date(event.event_date) < new Date();

  return (
    <Layout>
      <div className="container max-w-4xl py-12">
        {/* Back Button */}
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Event Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <Badge variant="secondary" className="mb-3">
                {event.city ? `${event.city.name}, ${event.city.country}` : "Location TBA"}
              </Badge>
              <h1 className="font-serif text-3xl md:text-4xl font-medium text-display">
                {event.title}
              </h1>
            </div>
            <Badge variant={event.status === "published" ? "default" : "secondary"}>
              {event.status}
            </Badge>
          </div>

          {event.organizer && (
            <p className="text-muted-foreground">
              Organized by <span className="text-body">{event.organizer.display_name}</span>
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-body">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>{format(new Date(event.event_date), "EEEE, MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-3 text-body">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>
                    {event.start_time.slice(0, 5)}
                    {event.end_time && ` - ${event.end_time.slice(0, 5)}`}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-body">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{event.venue}</span>
                </div>
                {event.max_participants && (
                  <div className="flex items-center gap-3 text-body">
                    <Users className="w-5 h-5 text-primary" />
                    <span>{event.max_participants} maximum participants</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            {event.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">About This Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-body whitespace-pre-wrap">{event.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Modules */}
            {modules.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Event Modules</CardTitle>
                  <CardDescription>Additional event features</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={modules[0]?.module_type}>
                    <TabsList>
                      {modules.map((module) => (
                        <TabsTrigger key={module.id} value={module.module_type} className="capitalize">
                          {module.module_type}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {modules.map((module) => (
                      <TabsContent key={module.id} value={module.module_type} className="pt-4">
                        <p className="text-muted-foreground text-sm">
                          {module.module_type === "agenda" && "Event schedule and timeline"}
                          {module.module_type === "speakers" && "Featured speakers and presenters"}
                          {module.module_type === "resources" && "Event materials and documents"}
                          {module.module_type === "qna" && "Questions and answers"}
                          {module.module_type === "networking" && "Networking opportunities"}
                        </p>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participation Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">Participation</CardTitle>
                <CardDescription>Verified attendance records</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Registered</span>
                  <span className="font-medium">{participantCount.registered}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Confirmed</span>
                  <span className="font-medium">{participantCount.confirmed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Attended</span>
                  <span className="font-medium">{participantCount.attended}</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Card */}
            {!isOrganizer && !isPast && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Your Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {participationStatus === "none" ? (
                    <Button className="w-full" onClick={handleRegister} disabled={actionLoading}>
                      {actionLoading ? "Processing..." : "Register for Event"}
                    </Button>
                  ) : participationStatus === "cancelled" ? (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-destructive mb-3">
                        <XCircle className="w-5 h-5" />
                        <span className="font-medium">Cancelled</span>
                      </div>
                      <Button variant="outline" className="w-full" onClick={handleRegister} disabled={actionLoading}>
                        Re-register
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-primary mb-3">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium capitalize">{participationStatus}</span>
                      </div>
                      <Button variant="outline" className="w-full" onClick={handleCancel} disabled={actionLoading}>
                        Cancel Registration
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {isOrganizer && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">Organizer Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`/events/${id}/manage`}>Manage Event</a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`/events/${id}/attendance`}>Check-in Attendees</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetail;
