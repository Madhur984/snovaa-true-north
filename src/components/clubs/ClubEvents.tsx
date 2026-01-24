import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Calendar, Plus, Users, MapPin, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface Event {
    id: string;
    title: string;
    event_date: string;
    start_time: string;
    end_time: string | null;
    venue: string;
    status: string;
    max_participants: number | null;
    description: string | null;
    _count?: {
        registered: number;
        attended: number;
    };
}

const ClubEvents = () => {
    const { id } = useParams<{ id: string }>();
    const { profile } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "upcoming" | "live" | "completed">("all");
    const [isOrganizer, setIsOrganizer] = useState(false);

    useEffect(() => {
        if (id) {
            checkOrganizerStatus();
            fetchEvents();
        }
    }, [id, filter]);

    const checkOrganizerStatus = async () => {
        if (!profile) return;
        const { data } = await supabase
            .from("club_organizers")
            .select("id")
            .eq("club_id", id)
            .eq("profile_id", profile.id)
            .maybeSingle();
        setIsOrganizer(!!data);
    };

    const fetchEvents = async () => {
        let query = supabase
            .from("events")
            .select("*")
            .eq("club_id", id)
            .order("event_date", { ascending: false });

        if (filter !== "all") {
            query = query.eq("status", filter);
        }

        const { data, error } = await query;

        if (!error && data) {
            // Fetch participation counts for each event
            const eventsWithCounts = await Promise.all(
                data.map(async (event) => {
                    const { count: registered } = await supabase
                        .from("participation_ledger")
                        .select("*", { count: "exact", head: true })
                        .eq("event_id", event.id)
                        .eq("action", "registered");

                    const { count: attended } = await supabase
                        .from("participation_ledger")
                        .select("*", { count: "exact", head: true })
                        .eq("event_id", event.id)
                        .eq("action", "attended");

                    return {
                        ...event,
                        _count: {
                            registered: registered || 0,
                            attended: attended || 0,
                        },
                    };
                })
            );
            setEvents(eventsWithCounts);
        }
        setLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "published":
                return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
            case "live":
                return "text-green-400 bg-green-500/10 border-green-500/30";
            case "completed":
                return "text-white/40 bg-white/5 border-white/10";
            default:
                return "text-white/40 bg-white/5 border-white/10";
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-white/5 rounded w-1/4"></div>
                    <div className="h-32 bg-white/5 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-display mb-2">EVENT REGISTRY</h1>
                    <p className="text-white/50 font-mono text-sm">&gt;&gt; CLUB ACTIVITY TIMELINE</p>
                </div>
                {isOrganizer && (
                    <Link
                        to={`/events/create?club=${id}`}
                        className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg transition-all duration-300 group flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-mono tracking-wide">INITIALIZE EVENT</span>
                    </Link>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-4">
                {["all", "upcoming", "live", "completed"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as typeof filter)}
                        className={`px-4 py-2 text-xs font-mono uppercase tracking-widest transition-all duration-300 ${filter === f
                                ? "text-cyan-400 border-b-2 border-cyan-400"
                                : "text-white/40 hover:text-white/60"
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Events Grid */}
            {events.length === 0 ? (
                <div className="text-center py-16">
                    <Calendar className="w-16 h-16 mx-auto text-white/20 mb-4" />
                    <p className="text-white/40 font-mono text-sm">NO EVENTS DETECTED</p>
                    {isOrganizer && (
                        <Link
                            to={`/events/create?club=${id}`}
                            className="inline-block mt-4 text-cyan-400 hover:text-cyan-300 text-sm font-mono"
                        >
                            &gt;&gt; CREATE FIRST EVENT
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {events.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                to={`/events/${event.id}`}
                                className="block bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 hover:bg-white/10 transition-all duration-300 group"
                            >
                                {/* Status Badge */}
                                <div className="flex items-center justify-between mb-4">
                                    <span
                                        className={`px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-full border ${getStatusColor(
                                            event.status
                                        )}`}
                                    >
                                        {event.status}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                                </div>

                                {/* Event Title */}
                                <h3 className="text-xl font-display mb-3 group-hover:text-cyan-400 transition-colors">
                                    {event.title}
                                </h3>

                                {/* Event Details */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-white/60">
                                        <Calendar className="w-4 h-4" />
                                        <span className="font-mono">
                                            {format(new Date(event.event_date), "MMM dd, yyyy")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-white/60">
                                        <Clock className="w-4 h-4" />
                                        <span className="font-mono">{event.start_time}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-white/60">
                                        <MapPin className="w-4 h-4" />
                                        <span className="font-mono">{event.venue}</span>
                                    </div>
                                </div>

                                {/* Participation Stats */}
                                <div className="flex gap-4 pt-4 border-t border-white/10">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-cyan-400" />
                                        <span className="text-sm font-mono text-white/60">
                                            {event._count?.registered || 0} registered
                                        </span>
                                    </div>
                                    {event.status === "completed" && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-mono text-green-400">
                                                {event._count?.attended || 0} attended
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClubEvents;
