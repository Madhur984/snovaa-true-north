import { Link, Outlet, useLocation } from "react-router-dom";
import { Users, Calendar, MessageSquare, Shield, Activity, Radio, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

const ClubLayout = () => {
    const location = useLocation();
    const role = "owner"; // TODO: Mock role for development

    const navItems = [
        { icon: LayoutDashboard, label: "Overview", path: "" },
        { icon: Calendar, label: "Events", path: "/events" },
        { icon: Users, label: "Members", path: "/members" },
        { icon: MessageSquare, label: "Comms", path: "/chat", locked: true }, // Locked for Phase 1
    ];

    const adminItems = [
        { icon: Radio, label: "Broadcast", path: "/broadcast" },
        { icon: Shield, label: "Settings", path: "/settings" },
    ];

    return (
        <div className="min-h-screen bg-black text-white font-mono selection:bg-cyan-500/30">
            {/* Sci-Fi Sidebar */}
            <nav className="fixed left-0 top-0 bottom-0 w-64 border-r border-white/10 bg-black/90 backdrop-blur-xl hidden md:flex flex-col p-6 z-20">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 animate-pulse" />
                    <span className="font-display text-xl tracking-wider">FOUNDERS</span>
                </div>

                <div className="space-y-8">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4 pl-3">Module // Core</p>
                        <div className="space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    to={`/clubs/founders${item.path}`}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 group ${location.pathname === `/clubs/founders${item.path}`
                                            ? "bg-white/10 text-cyan-400 border-l-2 border-cyan-400"
                                            : "text-white/60 hover:text-white"
                                        }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span className="text-sm tracking-wide">{item.label}</span>
                                    {item.locked && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500/50" />}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {role === "owner" && (
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4 pl-3">Module // Admin</p>
                            <div className="space-y-1">
                                {adminItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={`/clubs/founders${item.path}`}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 group ${location.pathname === `/clubs/founders${item.path}`
                                                ? "bg-white/10 text-amber-400 border-l-2 border-amber-400"
                                                : "text-white/60 hover:text-white"
                                            }`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        <span className="text-sm tracking-wide">{item.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-auto border-t border-white/10 pt-6">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-white/40">SYS.STATUS</span>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                        </div>
                        <div className="font-mono text-xs text-cyan-500">OPTIMAL</div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="md:ml-64 min-h-screen bg-[url('/grid.svg')] bg-fixed">
                <Outlet />
            </main>
        </div>
    );
};

export default ClubLayout;
