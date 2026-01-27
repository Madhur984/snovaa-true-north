
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScoringEngine, ClubScore } from "@/lib/scoring-engine";
import { TrustBadge } from "./TrustBadge";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const ClubCredibility = ({ clubId }: { clubId: string }) => {
    const [score, setScore] = useState<ClubScore | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        ScoringEngine.calculateClubScore(clubId).then((data) => {
            setScore(data);
            setLoading(false);
        });
    }, [clubId]);

    if (loading) return <div className="h-48 bg-muted animate-pulse rounded-xl" />;
    if (!score) return null;

    return (
        <Card className="overflow-hidden border-t-4 border-t-primary">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="font-serif">Club Credibility</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                            Live Trust Score based on Verified Data
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <span className="text-4xl font-bold font-serif text-primary">{score.totalScore}</span>
                        <span className="text-muted-foreground text-sm">/100</span>
                    </div>
                </div>
                <div className="mt-2">
                    <TrustBadge tier={score.tier} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <ScoreRow
                        label="Consistency"
                        value={score.metrics.consistency}
                        desc="Frequency of scheduled events"
                    />
                    <ScoreRow
                        label="Verification Rate"
                        value={score.metrics.verificationRate}
                        desc="% of attendees verified via Offline Ledger"
                    />
                    <ScoreRow
                        label="Retention"
                        value={score.metrics.retention}
                        desc="% of participants who return"
                    />
                    <ScoreRow
                        label="Growth"
                        value={score.metrics.growth}
                        desc="New member acquisition trend"
                    />
                </div>

                <div className="mt-6 pt-4 border-t text-xs text-muted-foreground flex items-center gap-2">
                    <Info className="w-3 h-3" />
                    <span>Scores updated dynamically based on SNOVAA Ledger data.</span>
                </div>
            </CardContent>
        </Card>
    );
};

const ScoreRow = ({ label, value, desc }: { label: string; value: number; desc: string }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1.5">
                <span className="font-medium">{label}</span>
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger>
                            <Info className="w-3 h-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">{desc}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <span className="text-muted-foreground">{value}%</span>
        </div>
        <Progress value={value} className="h-2" />
    </div>
);
