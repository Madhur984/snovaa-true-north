import { ArrowUpRight, Users, Zap, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const Widget = ({ title, value, sub, icon: Icon, delay }: { title: string, value: string, sub: string, icon: any, delay: number }) => (
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
                <Widget title="Total Personnel" value="1,248" sub="+12% this cycle" icon={Users} delay={0.1} />
                <Widget title="Active Events" value="03" sub="Next: 24h" icon={Calendar} delay={0.2} />
                <Widget title="Engagement" value="87%" sub="Optimal Levels" icon={Zap} delay={0.3} />
            </div>

            {/* Main Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[300px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-display tracking-wide">Recent Activity Log</h3>
                        <button className="text-xs font-mono px-3 py-1 border border-white/20 rounded hover:bg-white/10">FILTER</button>
                    </div>

                    <div className="space-y-4 font-mono text-sm">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-cyan-500" />
                                    <span className="text-white/80">User_8X9 joined event "Crypto Night"</span>
                                </div>
                                <span className="text-white/30">12m ago</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-900/20 to-black border border-white/10 rounded-2xl p-6">
                    <h3 className="font-display tracking-wide mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full text-left p-4 bg-white/5 hover:bg-cyan-500/20 border border-white/10 rounded-lg transition-all group">
                            <span className="text-sm font-bold block group-hover:text-cyan-400">INITIALIZE EVENT</span>
                            <span className="text-xs text-white/40">Create new gathering node</span>
                        </button>
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
