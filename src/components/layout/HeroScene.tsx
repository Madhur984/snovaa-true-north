
import { motion } from "framer-motion";
import { TrustBadge } from "@/components/clubs/TrustBadge";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Activity } from "lucide-react";

export const HeroScene = () => {
    return (
        <div className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden bg-transparent">

            {/* Background Gradient Mesh */}
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-50/50 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px]" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 container max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">

                {/* Text Side (Left) */}
                <div className="space-y-8 text-center lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] text-display mb-6">
                            Infrastructure<br />
                            <span className="text-muted-foreground italic font-light text-5xl md:text-6xl lg:text-7xl">not entertainment.</span>
                        </h1>
                    </motion.div>

                    <motion.p
                        className="text-xl text-gray-500 font-light max-w-lg mx-auto lg:mx-0 leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    >
                        A participation ledger for the real world. Verified check-ins, immutable records, and clubs that actually meet.
                    </motion.p>
                </div>

                {/* Visual Side (Right) - Floating Cards */}
                <div className="relative h-[600px] hidden lg:block perspective-1000">

                    {/* Active Event Card (Floating Main) */}
                    <motion.div
                        className="absolute top-[20%] right-[10%] w-80 z-20"
                        initial={{ opacity: 0, rotateY: 10, rotateX: 5, y: 40 }}
                        animate={{ opacity: 1, rotateY: -5, rotateX: 2, y: 0 }}
                        transition={{
                            delay: 0.2,
                            duration: 1.2,
                            y: { duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" } // Floating
                        }}
                    >
                        <Card className="p-0 border-0 shadow-2xl overflow-hidden glass-panel">
                            <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                                <Activity className="absolute bottom-[-10px] right-[-10px] w-32 h-32 text-white/10" />
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Live Now</Badge>
                                    <Badge variant="outline" className="border-green-200 text-green-700">98% Verified</Badge>
                                </div>
                                <h3 className="font-serif text-xl mb-1">Morning Run Club</h3>
                                <p className="text-sm text-muted-foreground mb-4">Golden Gate Park · 42 Attending</p>
                                <div className="flex -space-x-2 overflow-hidden">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200" />
                                    ))}
                                    <div className="h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">+38</div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Verified Club Card (Floating Back) */}
                    <motion.div
                        className="absolute bottom-[20%] left-[20%] w-72 z-10"
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 3 }}
                        transition={{ delay: 0.6, duration: 1 }}
                    >
                        <Card className="p-5 shadow-xl border-t-4 border-emerald-500 bg-white/90 backdrop-blur">
                            <TrustBadge tier="Verified Elite" className="mb-4" />
                            <h3 className="font-medium text-lg leading-snug mb-1">Bay Area Cycling</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="w-4 h-4" />
                                <span>2.4k Members</span>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Location Pin (Floating Top) */}
                    <motion.div
                        className="absolute top-[10%] left-[30%]"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.5 }}
                    >
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-lg border border-gray-100">
                            <MapPin className="w-4 h-4 text-rose-500" />
                            <span className="text-xs font-medium">San Francisco</span>
                        </div>
                    </motion.div>

                </div>
            </div>

        </div>
    );
};
