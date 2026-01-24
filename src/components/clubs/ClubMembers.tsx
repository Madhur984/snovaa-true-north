import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Users, Calendar, TrendingUp, Search } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface Member {
    id: string;
    joined_at: string;
    profile: {
        id: string;
        display_name: string;
    };
    stats?: {
        events_attended: number;
        events_registered: number;
    };
}

interface Organizer {
    profile_id: string;
    role: string;
}

const ClubMembers = () => {
    const { id } = useParams<{ id: string }>();
    const [members, setMembers] = useState<Member[]>([]);
    const [organizers, setOrganizers] = useState<Organizer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (id) {
            fetchMembers();
            fetchOrganizers();
        }
    }, [id]);

    const fetchOrganizers = async () => {
        const { data } = await supabase
            .from("club_organizers")
            .select("profile_id, role")
            .eq("club_id", id);
        if (data) setOrganizers(data);
    };

    const fetchMembers = async () => {
        const { data, error } = await supabase
            .from("club_members")
            .select("id, joined_at, profile:profiles(id, display_name)")
            .eq("club_id", id)
            .order("joined_at", { ascending: false });

        if (!error && data) {
            // First, fetch all event IDs for this club
            const { data: clubEvents } = await supabase
                .from("events")
                .select("id")
                .eq("club_id", id);

            const eventIds = clubEvents?.map(e => e.id) || [];

            // Fetch participation stats for each member
            const membersWithStats = await Promise.all(
                data.map(async (member) => {
                    const profileId = (member.profile as any)?.id;

                    const { count: attended } = await supabase
                        .from("participation_ledger")
                        .select("*", { count: "exact", head: true })
                        .eq("participant_id", profileId)
                        .eq("action", "attended")
                        .in("event_id", eventIds);

                    const { count: registered } = await supabase
                        .from("participation_ledger")
                        .select("*", { count: "exact", head: true })
                        .eq("participant_id", profileId)
                        .eq("action", "registered")
                        .in("event_id", eventIds);

                    return {
                        ...member,
                        stats: {
                            events_attended: attended || 0,
                            events_registered: registered || 0,
                        },
                    };
                })
            );
            setMembers(membersWithStats as Member[]);
        }
        setLoading(false);
    };

    const isOrganizer = (profileId: string) => {
        return organizers.some((org) => org.profile_id === profileId);
    };

    const getOrganizerRole = (profileId: string) => {
        return organizers.find((org) => org.profile_id === profileId)?.role;
    };

    const filteredMembers = members.filter((member) =>
        (member.profile as any)?.display_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-white/5 rounded w-1/4"></div>
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-white/5 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-display mb-2">PERSONNEL DIRECTORY</h1>
                    <p className="text-white/50 font-mono text-sm">
                        &gt;&gt; {members.length} VERIFIED MEMBERS
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                    type="text"
                    placeholder="SEARCH PERSONNEL..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-white/40 font-mono text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-cyan-400" />
                        <span className="text-xs uppercase tracking-widest text-white/40">
                            Total Members
                        </span>
                    </div>
                    <p className="text-3xl font-display">{members.length}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <span className="text-xs uppercase tracking-widest text-white/40">
                            Organizers
                        </span>
                    </div>
                    <p className="text-3xl font-display">{organizers.length}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-amber-400" />
                        <span className="text-xs uppercase tracking-widest text-white/40">
                            Avg Attendance
                        </span>
                    </div>
                    <p className="text-3xl font-display">
                        {members.length > 0
                            ? Math.round(
                                members.reduce(
                                    (acc, m) => acc + (m.stats?.events_attended || 0),
                                    0
                                ) / members.length
                            )
                            : 0}
                    </p>
                </div>
            </div>

            {/* Members Grid */}
            {filteredMembers.length === 0 ? (
                <div className="text-center py-16">
                    <Users className="w-16 h-16 mx-auto text-white/20 mb-4" />
                    <p className="text-white/40 font-mono text-sm">
                        {searchQuery ? "NO MATCHES FOUND" : "NO MEMBERS DETECTED"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMembers.map((member, index) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 hover:bg-white/10 transition-all duration-300 group"
                        >
                            {/* Avatar */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                    <span className="text-white font-display text-lg">
                                        {(member.profile as any)?.display_name
                                            ?.charAt(0)
                                            .toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-display text-lg group-hover:text-cyan-400 transition-colors">
                                        {(member.profile as any)?.display_name}
                                    </h3>
                                    {isOrganizer((member.profile as any)?.id) && (
                                        <span className="text-xs uppercase tracking-wider text-amber-400 font-mono">
                                            {getOrganizerRole((member.profile as any)?.id)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="space-y-2 pt-4 border-t border-white/10">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40 font-mono">Joined</span>
                                    <span className="text-white/60 font-mono">
                                        {format(new Date(member.joined_at), "MMM yyyy")}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40 font-mono">Attended</span>
                                    <span className="text-cyan-400 font-mono">
                                        {member.stats?.events_attended || 0} events
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40 font-mono">Registered</span>
                                    <span className="text-white/60 font-mono">
                                        {member.stats?.events_registered || 0} events
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClubMembers;
