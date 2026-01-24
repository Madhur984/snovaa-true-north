import { motion } from "framer-motion";
import { User, Shield, Calendar, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data
const mockHistory = [
    { id: 1, event: "Crypto Night", date: "Jan 12, 2026", status: "Attended" },
    { id: 2, event: "Founders Meetup", date: "Jan 05, 2026", status: "Attended" },
    { id: 3, event: "Launch Party", date: "Dec 20, 2025", status: "Missed" },
];

const MemberProfile = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header Profile Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 text-white pointer-events-none">
                    <User className="w-32 h-32" />
                </div>

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-[2px]">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                            <span className="font-display text-3xl">JD</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl font-display">John Doe</h1>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 bg-cyan-500/10 gap-1">
                                <Shield className="w-3 h-3" /> FOUNDER
                            </Badge>
                            <Badge variant="outline" className="border-white/20 text-white/60">
                                Joined Dec 2025
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-white/40">Reliability</p>
                        <p className="text-2xl font-mono text-cyan-400">92%</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-widest text-white/40">Events</p>
                        <p className="text-2xl font-mono text-white">08</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-widest text-white/40">Status</p>
                        <p className="text-2xl font-mono text-green-400">ACTIVE</p>
                    </div>
                </div>
            </div>

            {/* Attendance Timeline */}
            <div className="space-y-4">
                <h3 className="font-display tracking-wide text-xl">Service History</h3>
                <div className="space-y-4">
                    {mockHistory.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors"
                        >
                            <div className={`w-2 h-full py-6 rounded-full ${item.status === "Attended" ? "bg-green-500" : "bg-red-500/50"}`} />
                            <div className="flex-1">
                                <h4 className="font-semibold text-lg">{item.event}</h4>
                                <p className="text-sm text-white/40 font-mono">{item.date}</p>
                            </div>
                            <div>
                                {item.status === "Attended" ? (
                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">VERIFIED</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-white/30">ABSENT</Badge>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MemberProfile;
