import { ArrowUpRight, Users, Zap, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Widget = ({ title, value, sub, icon: Icon, delay }: { title: string, value: string, sub: string, icon: React.ElementType, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-cyan-500/30 transition-colors"
    >
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
            <Icon className="w-12 h-12" />
        </div>
        <p className="text-xs uppercase tracking-widest text-white/40 mb-2">{title}</p>
        <h3 className="text-4xl font-display mb-2">{value}</h3>
        <div className="flex items-center gap-2 text-sm text-green-400 font-mono">
            <ArrowUpRight className="w-4 h-4" />
            <span>{sub}</span>
        </div>
    </motion.div>
);

const ClubDashboard = () => {
    interface DashboardActivity {
        id: string;
        action: string;
        recorded_at: string;
        events: {
            title: string;
            club_id: string; // Needed for !inner filter but good to have
        } | null;
        profiles: {
            display_name: string;
        } | null;
    }

    const { id } = useParams<{ id: string }>();
    const [stats, setStats] = useState({
        members: 0,
        activeEvents: 0,
        engagement: 0,
    });
    const [recentActivity, setRecentActivity] = useState<DashboardActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchDashboardData();
        }
    }, [id]);

    const fetchDashboardData = async () => {
        try {
            // 1. Get Member Count
            const { count: memberCount } = await supabase
                .from("club_members")
                .select("*", { count: "exact", head: true })
                .eq("club_id", id);

            // 2. Get Active Events
            const { count: eventCount } = await supabase
                .from("events")
                .select("*", { count: "exact", head: true })
                .eq("club_id", id)
                .in("status", ["published", "live"]);

            // 3. Get Recent Activity (Ledger joined with Events and Profiles)
            // Note: We use !inner to filter by club_id on the joined events table
            const { data: activityData } = await supabase
                .from("participation_ledger")
                .select(`
                    id, 
                    action, 
                    recorded_at, 
                    events!inner(title, club_id), 
                    profiles(display_name)
                `)
                .eq("events.club_id", id)
                .order("recorded_at", { ascending: false })
                .limit(5);

            setStats({
                members: memberCount || 0,
                activeEvents: eventCount || 0,
                engagement: 87, // Placeholder for complex metric
            });

            if (activityData) {
                setRecentActivity(activityData as unknown as DashboardActivity[]);
            }
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-white/50 font-mono">LOADING SYSTEM...</div>;
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-display mb-2">CONTROL DECK</h1>
                    <p className="text-white/50 font-mono text-sm">&gt;&gt; SYSTEM STATUS: ONLINE</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded-full border border-green-500/30">
                        LIVE SIGNAL
                    </span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Widget title="Total Personnel" value={stats.members.toString()} sub="Verified Members" icon={Users} delay={0.1} />
                <Widget title="Active Events" value={stats.activeEvents.toString().padStart(2, '0')} sub="Upcoming / Live" icon={Calendar} delay={0.2} />
                <Widget title="Engagement" value={`${stats.engagement}%`} sub="Optimal Levels" icon={Zap} delay={0.3} />
            </div>

            {/* Main Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[300px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-display tracking-wide">Recent Activity Log</h3>
                        <button className="text-xs font-mono px-3 py-1 border border-white/20 rounded hover:bg-white/10">FILTER</button>
                    </div>

                    <div className="space-y-4 font-mono text-sm">
                        {recentActivity.length === 0 ? (
                            <div className="text-white/30 text-center py-8">NO SIGNAL DETECTED</div>
                        ) : (
                            recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${activity.action === 'attended' ? 'bg-green-500' : 'bg-cyan-500'}`} />
                                        <span className="text-white/80">
                                            {activity.profiles?.display_name || "Unknown User"} {activity.action === 'attended' ? 'attended' : 'registered for'} "{activity.events?.title}"
                                        </span>
                                    </div>
                                    <span className="text-white/30">
                                        {new Date(activity.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-900/20 to-black border border-white/10 rounded-2xl p-6">
                    <h3 className="font-display tracking-wide mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link to={`/events/create?club=${id}`} className="block w-full text-left p-4 bg-white/5 hover:bg-cyan-500/20 border border-white/10 rounded-lg transition-all group">
                            <span className="text-sm font-bold block group-hover:text-cyan-400">INITIALIZE EVENT</span>
                            <span className="text-xs text-white/40">Create new gathering node</span>
                        </Link>
                        <button className="w-full text-left p-4 bg-white/5 hover:bg-amber-500/20 border border-white/10 rounded-lg transition-all group">
                            <span className="text-sm font-bold block group-hover:text-amber-400">BROADCAST SIGNAL</span>
                            <span className="text-xs text-white/40">Send alert to all personnel</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClubDashboard;
