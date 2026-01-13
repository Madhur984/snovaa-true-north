import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search, Check, X, Users } from "lucide-react";
import { QRScanner } from "@/components/QRScanner";

interface Participant {
  id: string;
  profile_id: string;
  display_name: string;
  latest_action: string;
  recorded_at: string;
}

interface Event {
  id: string;
  title: string;
  status: string;
}

const CheckIn = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchEvent();
      fetchParticipants();
    }
  }, [id]);

  const fetchEvent = async () => {
    const { data } = await supabase
      .from("events")
      .select("id, title, status")
      .eq("id", id)
      .single();

    if (data) setEvent(data);
  };

  const fetchParticipants = async () => {
    // Get all participation records for this event
    const { data } = await supabase
      .from("participation_ledger")
      .select("*, profile:profiles(id, display_name)")
      .eq("event_id", id)
      .order("recorded_at", { ascending: false });

    if (data) {
      // Group by participant and get latest status
      const participantMap = new Map<string, Participant>();
      
      data.forEach((record: any) => {
        if (!participantMap.has(record.participant_id)) {
          participantMap.set(record.participant_id, {
            id: record.id,
            profile_id: record.participant_id,
            display_name: record.profile?.display_name || "Unknown",
            latest_action: record.action,
            recorded_at: record.recorded_at,
          });
        }
      });

      setParticipants(Array.from(participantMap.values()));
    }
    setLoading(false);
  };

  const handleCheckIn = useCallback(async (participantId: string) => {
    if (!profile) return;
    setProcessingId(participantId);

    // Check if already checked in
    const participant = participants.find(p => p.profile_id === participantId);
    if (participant?.latest_action === "attended") {
      toast({
        title: "Already checked in",
        description: `${participant.display_name} is already checked in.`,
      });
      setProcessingId(null);
      return;
    }

    const { error } = await supabase.from("participation_ledger").insert({
      event_id: id,
      participant_id: participantId,
      action: "attended",
      recorded_by: profile.id,
    });

    if (error) {
      toast({
        title: "Check-in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const participantName = participants.find(p => p.profile_id === participantId)?.display_name || "Participant";
      toast({
        title: "Checked in!",
        description: `${participantName}'s attendance recorded in the ledger.`,
      });
      // Update local state
      setParticipants((prev) =>
        prev.map((p) =>
          p.profile_id === participantId ? { ...p, latest_action: "attended" } : p
        )
      );
    }
    setProcessingId(null);
  }, [id, profile, participants, toast]);

  const filteredParticipants = participants.filter((p) =>
    p.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    registered: participants.filter((p) => p.latest_action === "registered").length,
    confirmed: participants.filter((p) => p.latest_action === "confirmed").length,
    attended: participants.filter((p) => p.latest_action === "attended").length,
    cancelled: participants.filter((p) => p.latest_action === "cancelled").length,
  };

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-4xl py-12">
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
      <div className="container max-w-4xl py-12">
        <Link
          to={`/events/${id}/manage`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-display mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Event Management
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-medium text-display mb-2">
            Check-In: {event?.title}
          </h1>
          <div className="flex items-center gap-3">
            <Badge
              variant={
                event?.status === "live"
                  ? "destructive"
                  : event?.status === "published"
                  ? "default"
                  : "secondary"
              }
            >
              {event?.status}
            </Badge>
            {event?.status !== "live" && (
              <span className="text-sm text-muted-foreground">
                Event must be "live" to record attendance
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Registered</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-serif font-medium text-display">{stats.registered}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Confirmed</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-serif font-medium text-display">{stats.confirmed}</p>
            </CardContent>
          </Card>
          <Card className="border-primary">
            <CardHeader className="pb-2">
              <CardDescription>Attended</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-serif font-medium text-primary">{stats.attended}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Cancelled</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-serif font-medium text-muted-foreground">
                {stats.cancelled}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* QR Scanner */}
        <QRScanner
          eventId={id || ""}
          onScan={handleCheckIn}
          isProcessing={!!processingId}
        />

        {/* Manual Check-In */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Users className="w-5 h-5" />
              Manual Check-In
            </CardTitle>
            <CardDescription>Search and check in participants manually</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search participants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredParticipants.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No participants found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredParticipants.map((participant) => (
                  <div
                    key={participant.profile_id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {participant.display_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-display">{participant.display_name}</p>
                        <Badge
                          variant={
                            participant.latest_action === "attended"
                              ? "default"
                              : participant.latest_action === "cancelled"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {participant.latest_action}
                        </Badge>
                      </div>
                    </div>

                    {participant.latest_action === "attended" ? (
                      <div className="flex items-center gap-2 text-primary">
                        <Check className="w-5 h-5" />
                        <span className="text-sm font-medium">Checked In</span>
                      </div>
                    ) : participant.latest_action === "cancelled" ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <X className="w-5 h-5" />
                        <span className="text-sm">Cancelled</span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleCheckIn(participant.profile_id)}
                        disabled={processingId === participant.profile_id || event?.status !== "live"}
                      >
                        {processingId === participant.profile_id ? "..." : "Check In"}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CheckIn;
