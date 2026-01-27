import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserTrust, ScoringEngine } from "@/lib/scoring-engine";
import { Trophy, Map, Users, Award, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

export const UserIdentity = ({ userId }: { userId: string }) => {
    const [trust, setTrust] = useState<UserTrust | null>(null);

    useEffect(() => {
        ScoringEngine.calculateUserTrust(userId).then(setTrust);
    }, [userId]);

    if (!trust) return <div className="h-64 bg-muted animate-pulse rounded-xl" />;

    return (
        <div className="space-y-6">
            {/* Identity Card */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0 overflow-hidden relative">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <Badge className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border-0 mb-3">
                                    Trust Level: {trust.level}
                                </Badge>
                                <CardTitle className="font-serif text-3xl">Active Participant</CardTitle>
                                <CardDescription className="text-slate-300">
                                    verified across {trust.stats.clubsCount} clubs
                                </CardDescription>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-bold font-serif">{trust.stats.reliability}%</div>
                                <div className="text-xs text-slate-400 uppercase tracking-widest">Reliability</div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                            <div>
                                <div className="text-2xl font-medium">{trust.stats.totalEvents}</div>
                                <div className="text-xs text-slate-400">Events</div>
                            </div>
                            <div>
                                <div className="text-2xl font-medium">{trust.stats.clubsCount}</div>
                                <div className="text-xs text-slate-400">Clubs</div>
                            </div>
                            <div>
                                <div className="text-2xl font-medium">{trust.stats.citiesCount}</div>
                                <div className="text-xs text-slate-400">Cities</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {trust.badges.map((badge, i) => (
                    <motion.div
                        key={badge}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="hover:border-primary transition-colors cursor-default">
                            <CardContent className="pt-6 text-center">
                                <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
                                    {badge.includes("Runner") ? <Zap className="w-5 h-5" /> :
                                        badge.includes("Club") ? <Users className="w-5 h-5" /> :
                                            badge.includes("Explorer") ? <Map className="w-5 h-5" /> :
                                                <Award className="w-5 h-5" />}
                                </div>
                                <h4 className="font-medium text-sm">{badge}</h4>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {trust.badges.length === 0 && (
                <Card className="bg-muted/50 border-dashed">
                    <CardContent className="py-8 text-center text-muted-foreground">
                        <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p>Join more events to earn badges!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
