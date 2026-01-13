import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Eye, Users, Image, Sparkles, Link as LinkIcon, QrCode } from "lucide-react";
import { EventMediaUpload } from "@/components/EventMediaUpload";

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
}

interface Participant {
  id: string;
  display_name: string;
  email: string | null;
  status: string;
  recorded_at: string;
}

interface SponsorAccess {
  id: string;
  sponsor_name: string;
  access_token: string;
  expires_at: string | null;
}

const ManageEvent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [sponsorAccess, setSponsorAccess] = useState<SponsorAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSponsorName, setNewSponsorName] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venue: "",
    event_date: "",
    start_time: "",
    end_time: "",
    max_participants: "",
  });

  useEffect(() => {
    if (id && profile) {
      fetchEvent();
      fetchParticipants();
      fetchSponsorAccess();
    }
  }, [id, profile]);

  const fetchEvent = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      navigate("/my-events");
      return;
    }

    if (data.organizer_id !== profile?.id) {
      toast({
        title: "Access denied",
        description: "You don't have permission to manage this event.",
        variant: "destructive",
      });
      navigate("/my-events");
      return;
    }

    setEvent(data);
    setFormData({
      title: data.title,
      description: data.description || "",
      venue: data.venue,
      event_date: data.event_date,
      start_time: data.start_time,
      end_time: data.end_time || "",
      max_participants: data.max_participants?.toString() || "",
    });
    setLoading(false);
  };

  const fetchParticipants = async () => {
    // Get latest status for each participant
    const { data } = await supabase
      .from("participation_ledger")
      .select("participant_id, action, recorded_at, profiles:participant_id(display_name, email)")
      .eq("event_id", id)
      .order("recorded_at", { ascending: false });

    if (data) {
      const latestByParticipant = new Map<string, Participant>();
      data.forEach((record: any) => {
        if (!latestByParticipant.has(record.participant_id)) {
          latestByParticipant.set(record.participant_id, {
            id: record.participant_id,
            display_name: record.profiles?.display_name || "Unknown",
            email: record.profiles?.email || null,
            status: record.action,
            recorded_at: record.recorded_at,
          });
        }
      });
      setParticipants(Array.from(latestByParticipant.values()));
    }
  };

  const fetchSponsorAccess = async () => {
    const { data } = await supabase
      .from("sponsor_access")
      .select("*")
      .eq("event_id", id);

    if (data) setSponsorAccess(data);
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("events")
      .update({
        title: formData.title,
        description: formData.description || null,
        venue: formData.venue,
        event_date: formData.event_date,
        start_time: formData.start_time,
        end_time: formData.end_time || null,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
      })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error saving",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Changes saved",
        description: "Event details have been updated.",
      });
    }

    setSaving(false);
  };

  const handlePublish = async () => {
    const { error } = await supabase
      .from("events")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error publishing",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Event published",
        description: "Your event is now visible to participants.",
      });
      setEvent(prev => prev ? { ...prev, status: "published" } : null);
    }
  };

  const handleAddSponsor = async () => {
    if (!newSponsorName.trim()) return;

    const { data, error } = await supabase
      .from("sponsor_access")
      .insert({
        event_id: id,
        sponsor_name: newSponsorName.trim(),
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error creating sponsor access",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sponsor access created",
        description: "Share the access link with your sponsor.",
      });
      setSponsorAccess([...sponsorAccess, data]);
      setNewSponsorName("");
    }
  };

  const handleConfirmAttendance = async (participantId: string) => {
    const { error } = await supabase.from("participation_ledger").insert({
      event_id: id,
      participant_id: participantId,
      action: "attended",
      recorded_by: profile?.id,
    });

    if (error) {
      toast({
        title: "Error confirming attendance",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Attendance confirmed",
        description: "Participation recorded in the ledger.",
      });
      fetchParticipants();
    }
  };

  if (loading || !event) {
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

  return (
    <Layout>
      <div className="container max-w-4xl py-12">
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-medium text-display mb-1">Manage Event</h1>
            <p className="text-body">{event.title}</p>
          </div>
          <Badge variant={event.status === "published" ? "default" : "secondary"}>
            {event.status}
          </Badge>
        </div>

        <Tabs defaultValue="details">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Event Details</CardTitle>
                <CardDescription>Edit your event information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                      id="venue"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_participants">Max Participants</Label>
                    <Input
                      id="max_participants"
                      type="number"
                      value={formData.max_participants}
                      onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event_date">Date</Label>
                    <Input
                      id="event_date"
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  {event.status === "draft" && (
                    <Button variant="outline" onClick={handlePublish}>
                      <Eye className="w-4 h-4 mr-2" />
                      Publish Event
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="participants">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Participants
                  </CardTitle>
                  <CardDescription>
                    {participants.length} participants registered
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <a href={`/events/${id}/checkin`}>
                    <QrCode className="w-4 h-4 mr-2" />
                    Check-In Mode
                  </a>
                </Button>
              </CardHeader>
              <CardContent>
                {participants.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No participants yet</p>
                ) : (
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <div>
                          <p className="font-medium text-sm">{participant.display_name}</p>
                          {participant.email && (
                            <p className="text-xs text-muted-foreground">{participant.email}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              participant.status === "attended" ? "default" :
                              participant.status === "cancelled" ? "destructive" : "secondary"
                            }
                          >
                            {participant.status}
                          </Badge>
                          {participant.status !== "attended" && participant.status !== "cancelled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleConfirmAttendance(participant.id)}
                            >
                              Check In
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media">
            <EventMediaUpload eventId={id!} isOrganizer={true} />
          </TabsContent>

          <TabsContent value="sponsors">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Sponsor Access
                </CardTitle>
                <CardDescription>
                  Create read-only access links for sponsors (no social metrics)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Sponsor name"
                    value={newSponsorName}
                    onChange={(e) => setNewSponsorName(e.target.value)}
                  />
                  <Button onClick={handleAddSponsor}>Add Sponsor</Button>
                </div>

                {sponsorAccess.length > 0 && (
                  <div className="space-y-3">
                    {sponsorAccess.map((sponsor) => (
                      <div key={sponsor.id} className="p-4 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{sponsor.sponsor_name}</span>
                          <Badge variant="secondary">Read-only</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <LinkIcon className="w-3 h-3 text-muted-foreground" />
                          <code className="bg-muted px-2 py-1 rounded text-muted-foreground">
                            /sponsor/{sponsor.access_token.slice(0, 16)}...
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ManageEvent;
