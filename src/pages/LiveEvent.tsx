import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
    Radio,
    Users,
    QrCode,
    ArrowLeft,
    CheckCircle,
    Clock,
    TrendingUp,
    Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Event {
    id: string;
    title: string;
    venue: string;
    event_date: string;
    start_time: string;
    status: string;
    live_started_at?: string | null;
}

interface CheckIn {
    id: string;
    participant_id: string;
    recorded_at: string;
    profile: {
        display_name: string;
    };
}

const LiveEvent = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const { toast } = useToast();

    const [event, setEvent] = useState<Event | null>(null);
    const [totalRegistered, setTotalRegistered] = useState(0);
    const [totalCheckedIn, setTotalCheckedIn] = useState(0);
    const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchEvent();
            fetchStats();
            generateQRCode();
            subscribeToCheckIns();
        }
    }, [id]);

    const fetchEvent = async () => {
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("id", id)
            .single();

        if (!error && data) {
            setEvent(data as Event);
            if (data.status !== "live") {
                toast({
                    title: "Event Not Live",
                    description: "This event is not currently live",
                    variant: "destructive",
                });
                navigate(`/events/${id}/manage`);
            }
        }
        setLoading(false);
    };

    const fetchStats = async () => {
        // Get total registered
        const { count: registered } = await supabase
            .from("participation_ledger")
            .select("*", { count: "exact", head: true })
            .eq("event_id", id)
            .eq("action", "registered");

        setTotalRegistered(registered || 0);

        // Get total checked in
        const { count: checkedIn } = await supabase
            .from("participation_ledger")
            .select("*", { count: "exact", head: true })
            .eq("event_id", id)
            .eq("action", "attended");

        setTotalCheckedIn(checkedIn || 0);

        // Get recent check-ins
        const { data: recent } = await supabase
            .from("participation_ledger")
            .select("id, participant_id, recorded_at, profiles:participant_id(display_name)")
            .eq("event_id", id)
            .eq("action", "attended")
            .order("recorded_at", { ascending: false })
            .limit(10);

        if (recent) {
            setRecentCheckIns(recent as any);
        }
    };

    const generateQRCode = () => {
        const checkInUrl = `${window.location.origin}/events/${id}/checkin`;
        // Use free QR code API instead of library
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(checkInUrl)}`;
        setQrCodeUrl(qrApiUrl);
    };

    const subscribeToCheckIns = () => {
        const subscription = supabase
            .channel(`event-${id}-live`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "participation_ledger",
                    filter: `event_id=eq.${id}`,
                },
                (payload) => {
                    if ((payload.new as any).action === "attended") {
                        // Refresh stats
                        fetchStats();
                    }
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    };

    const handleCompleteEvent = async () => {
        if (!confirm("Are you sure you want to mark this event as completed?")) {
            return;
        }

        const { error } = await supabase
            .from("events")
            .update({ status: "completed" })
            .eq("id", id);

        if (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Event Completed",
                description: "Event has been marked as completed",
            });
            navigate(`/events/${id}/manage`);
        }
    };

    const downloadQRCode = () => {
        const link = document.createElement("a");
        link.download = `event-${id}-qr.png`;
        link.href = qrCodeUrl;
        link.click();
    };

    if (loading || !event) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-pulse text-white/40 font-mono">LOADING...</div>
            </div>
        );
    }

    const checkInPercentage = totalRegistered > 0
        ? Math.round((totalCheckedIn / totalRegistered) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-black text-white font-mono">
            {/* Header */}
            <div className="border-b border-white/10 bg-black/90 backdrop-blur-xl sticky top-0 z-10">
                <div className="container max-w-7xl mx-auto p-6">
                    <Link
                        to={`/events/${id}/manage`}
                        className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Manage
                    </Link>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="relative">
                                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
                                </div>
                                <h1 className="text-3xl font-display tracking-wider">EVENT LIVE</h1>
                            </div>
                            <p className="text-white/60 text-sm">{event.title}</p>
                        </div>

                        <button
                            onClick={handleCompleteEvent}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-300"
                        >
                            <span className="text-sm uppercase tracking-wider">Complete Event</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Stats & Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Participant Counter */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Users className="w-6 h-6 text-cyan-400" />
                                <h2 className="text-xl font-display uppercase tracking-wider">Attendance</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Checked In</p>
                                    <motion.p
                                        key={totalCheckedIn}
                                        initial={{ scale: 1.2, color: "#06b6d4" }}
                                        animate={{ scale: 1, color: "#ffffff" }}
                                        className="text-5xl font-display"
                                    >
                                        {totalCheckedIn}
                                    </motion.p>
                                </div>
                                <div>
                                    <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Registered</p>
                                    <p className="text-5xl font-display text-white/60">{totalRegistered}</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-white/40">
                                    <span>PROGRESS</span>
                                    <span>{checkInPercentage}%</span>
                                </div>
                                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${checkInPercentage}%` }}
                                        transition={{ duration: 0.5 }}
                                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Live Activity Feed */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <TrendingUp className="w-6 h-6 text-green-400" />
                                <h2 className="text-xl font-display uppercase tracking-wider">Live Feed</h2>
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                <AnimatePresence>
                                    {recentCheckIns.length === 0 ? (
                                        <p className="text-white/40 text-center py-8 text-sm">
                                            Waiting for check-ins...
                                        </p>
                                    ) : (
                                        recentCheckIns.map((checkIn, index) => (
                                            <motion.div
                                                key={checkIn.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white font-display">
                                                        {(checkIn.profile as any)?.display_name?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{(checkIn.profile as any)?.display_name}</p>
                                                    <p className="text-xs text-white/40">
                                                        {format(new Date(checkIn.recorded_at), "HH:mm:ss")}
                                                    </p>
                                                </div>
                                                <CheckCircle className="w-5 h-5 text-green-400" />
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - QR & Controls */}
                    <div className="space-y-6">
                        {/* QR Code */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <QrCode className="w-6 h-6 text-white" />
                                <h2 className="text-xl font-display uppercase tracking-wider">Check-In</h2>
                            </div>

                            {qrCodeUrl && (
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-lg">
                                        <img src={qrCodeUrl} alt="Check-in QR Code" className="w-full" />
                                    </div>
                                    <button
                                        onClick={downloadQRCode}
                                        className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span className="text-sm uppercase tracking-wider">Download QR</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Event Info */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Clock className="w-6 h-6 text-amber-400" />
                                <h2 className="text-xl font-display uppercase tracking-wider">Info</h2>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="text-white/40 uppercase tracking-widest text-xs mb-1">Venue</p>
                                    <p className="text-white/80">{event.venue}</p>
                                </div>
                                <div>
                                    <p className="text-white/40 uppercase tracking-widest text-xs mb-1">Date</p>
                                    <p className="text-white/80">
                                        {format(new Date(event.event_date), "MMMM d, yyyy")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-white/40 uppercase tracking-widest text-xs mb-1">Time</p>
                                    <p className="text-white/80">{event.start_time}</p>
                                </div>
                                {event.live_started_at && (
                                    <div>
                                        <p className="text-white/40 uppercase tracking-widest text-xs mb-1">
                                            Live Since
                                        </p>
                                        <p className="text-white/80">
                                            {format(new Date(event.live_started_at), "HH:mm:ss")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Link to Check-In Page */}
                        <Link
                            to={`/events/${id}/checkin`}
                            className="block w-full px-6 py-4 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg transition-all duration-300 text-center"
                        >
                            <span className="text-sm uppercase tracking-wider text-cyan-400">
                                Open Check-In Station
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveEvent;
