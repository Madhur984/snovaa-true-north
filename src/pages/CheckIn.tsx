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
import { ArrowLeft, Search, Check, X, Users, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { QRScanner } from "@/components/QRScanner";
import { OfflineLedger, OfflineRecord } from "@/lib/offline-ledger";

interface Participant {
  id: string; // Ledger record ID (server) or Offline ID (local)
  profile_id: string;
  display_name: string;
  latest_action: string;
  recorded_at: string;
  is_pending?: boolean; // Offline flag
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [ledgerStats, setLedgerStats] = useState(OfflineLedger.getStats());

  useEffect(() => {
    // Network listeners
    const handleOnline = () => {
      setIsOnline(true);
      OfflineLedger.syncPendingRecords().then(() => updateStats());
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial Sync
    updateStats();

    if (id) {
      fetchEvent();
      fetchParticipants();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [id]);

  const updateStats = () => {
    setLedgerStats(OfflineLedger.getStats());
  };

  const fetchEvent = async () => {
    const { data } = await supabase
      .from("events")
      .select("id, title, status")
      .eq("id", id)
      .single();

    if (data) setEvent(data);
  };

  const fetchParticipants = async () => {
    // 1. Get SERVER records
    const { data: serverData } = await supabase
      .from("participation_ledger")
      .select("*, profile:profiles(id, display_name)")
      .eq("event_id", id)
      .order("recorded_at", { ascending: false });

    // 2. Get LOCAL records (Unsynced)
    const localQueue = OfflineLedger.getQueue().filter(r => r.event_id === id && !r.synced);

    // Group Map
    const participantMap = new Map<string, Participant>();

    interface ServerLedgerRecord {
      id: string;
      participant_id: string;
      action: string;
      recorded_at: string;
      profile: {
        display_name: string;
      } | null;
    }

    // Process Server Data First
    if (serverData) {
      (serverData as unknown as ServerLedgerRecord[]).forEach((record) => {
        if (!participantMap.has(record.participant_id)) {
          participantMap.set(record.participant_id, {
            id: record.id,
            profile_id: record.participant_id,
            display_name: record.profile?.display_name || "Unknown",
            latest_action: record.action,
            recorded_at: record.recorded_at,
            is_pending: false
          });
        }
      });
    }

    // Overlay Local Data (Takes Priority as "Latest")
    localQueue.forEach((record) => {
      // Since local is newer, we overwrite or add
      const existing = participantMap.get(record.participant_id);
      // Ideally we'd compare timestamps, but for check-in assume local is "now"
      participantMap.set(record.participant_id, {
        id: record.id,
        profile_id: record.participant_id,
        display_name: existing?.display_name || "Look up...", // We might lack name offline
        latest_action: record.action,
        recorded_at: record.recorded_at,
        is_pending: true
      });
    });

    setParticipants(Array.from(participantMap.values()));
    setLoading(false);
  };

  const handleManualSync = async () => {
    // Force sync and refresh
    setProcessingId("syncing");
    await OfflineLedger.syncPendingRecords();
    updateStats();
    await fetchParticipants();
    setProcessingId(null);
  };

  const handleCheckIn = useCallback(async (participantId: string) => {
    if (!profile || !id) return;
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

    try {
      // 1. Write to Offline Ledger (Always succeeds if storage available)
      await OfflineLedger.addRecord(id, participantId, profile.id, "attended");

      const participantName = participants.find(p => p.profile_id === participantId)?.display_name || "Participant";

      toast({
        title: "Checked in!",
        description: "Attendance recorded securely.",
      });

      // 2. Update Local State UI Immediately (Optimistic)
      setParticipants((prev) => {
        const existing = prev.find(p => p.profile_id === participantId);
        const newRecord: Participant = {
          id: "temp-id",
          profile_id: participantId,
          display_name: existing?.display_name || "Unknown",
          latest_action: "attended",
          recorded_at: new Date().toISOString(),
          is_pending: true
        };

        if (existing) {
          return prev.map(p => p.profile_id === participantId ? newRecord : p);
        } else {
          return [newRecord, ...prev];
        }
      });

      updateStats();

    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to save record locally", variant: "destructive" });
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

        {/* Network & Sync Status Bar */}
        <div className={`mb-6 p-4 rounded-lg flex items-center justify-between transition-colors ${isOnline ? 'bg-secondary/50' : 'bg-amber-100 border border-amber-300'}`}>
          <div className="flex items-center gap-3">
            {isOnline ? <Wifi className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-amber-600" />}
            <div>
              <p className={`font-medium ${isOnline ? 'text-foreground' : 'text-amber-900'}`}>{isOnline ? 'System Online' : 'Offline Mode Active'}</p>
              <p className="text-xs text-muted-foreground">{ledgerStats.pending} verification records pending upload</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={handleManualSync} disabled={ledgerStats.pending === 0 || !isOnline}>
            <RefreshCw className={`w-4 h-4 mr-2 ${processingId === 'syncing' ? 'animate-spin' : ''}`} />
            Sync Now
          </Button>
        </div>

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
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-serif font-medium text-primary">{stats.attended}</p>
                {ledgerStats.pending > 0 && <span className="text-xs text-amber-600 font-medium">({ledgerStats.pending} pending)</span>}
              </div>
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
                        <p className="font-medium text-display flex items-center gap-2">
                          {participant.display_name}
                          {participant.is_pending && <Badge variant="outline" className="text-xs h-4 text-amber-600 border-amber-300">Pending</Badge>}
                        </p>
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
