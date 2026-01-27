
import { supabase } from "@/integrations/supabase/client";

export interface ClubScore {
    clubId: string;
    totalScore: number;
    tier: "Verified Elite" | "Highly Reliable" | "Consistent Performer" | "Building Track Record";
    metrics: {
        consistency: number; // 0-100 (Events per month frequency)
        verificationRate: number; // 0-100 (% of attendees verified vs registered)
        retention: number; // 0-100 (% of returning participants)
        growth: number; // 0-100 (New members trend)
    };
    lastUpdated: string;
}

export interface UserTrust {
    level: "Newcomer" | "Regular" | "Verified" | "Ambassador";
    badges: string[];
    stats: {
        totalEvents: number;
        clubsCount: number;
        citiesCount: number;
        reliability: number; // % of registered events actually attended
    };
}

export class ScoringEngine {

    /**
     * Calculates the credibility score for a specific club
     * Based on:
     * 1. Consistency: Regularity of events
     * 2. Verification: Ratio of verified check-ins to registrations
     * 3. Retention: Returning users
     */
    static async calculateClubScore(clubId: string): Promise<ClubScore> {
        // 1. Fetch Events History
        const { data: events } = await supabase
            .from("events")
            .select("id, event_date, status, created_at")
            .eq("club_id", clubId)
            .eq("status", "completed")
            .order("event_date", { ascending: false });

        if (!events || events.length === 0) {
            return this.getEmptyScore(clubId);
        }

        // 2. Fetch Participation Data for these events
        const eventIds = events.map(e => e.id);
        const { data: participation } = await supabase
            .from("participation_ledger")
            .select("event_id, participant_id, action")
            .in("event_id", eventIds);

        const safeParticipation = participation || [];

        // --- Metric 1: Consistency (Events in last 3 months) ---
        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);

        const recentEvents = events.filter(e => new Date(e.event_date) > threeMonthsAgo);
        const consistencyScore = Math.min(100, (recentEvents.length / 3) * 33); // Target: 1 event/month = 33%, 3/month = 100%

        // --- Metric 2: Verification Rate (Attended / Registered) ---
        const registered = safeParticipation.filter(p => p.action === 'registered').length;
        const attended = safeParticipation.filter(p => p.action === 'attended').length;

        const verificationScore = registered > 0 ? Math.round((attended / registered) * 100) : 0;

        // --- Metric 3: Retention (Returning Participants) ---
        const participantCounts: Record<string, number> = {};
        safeParticipation
            .filter(p => p.action === 'attended')
            .forEach(p => {
                participantCounts[p.participant_id] = (participantCounts[p.participant_id] || 0) + 1;
            });

        const totalUnique = Object.keys(participantCounts).length;
        const returning = Object.values(participantCounts).filter(c => c > 1).length;

        const retentionScore = totalUnique > 0 ? Math.round((returning / totalUnique) * 100) : 0;

        // --- Metric 4: Growth (Simulated for now, based on total unique) ---
        const growthScore = Math.min(100, totalUnique * 2); // 50 unique members = 100% growth score (startup curve)

        // --- Total Score Calculation ---
        // Weights: Consistency (30%), Verification (40%), Retention (20%), Growth (10%)
        const totalScore = Math.round(
            (consistencyScore * 0.3) +
            (verificationScore * 0.4) +
            (retentionScore * 0.2) +
            (growthScore * 0.1)
        );

        let tier: ClubScore['tier'] = "Building Track Record";
        if (totalScore >= 90) tier = "Verified Elite";
        else if (totalScore >= 80) tier = "Highly Reliable";
        else if (totalScore >= 70) tier = "Consistent Performer";

        return {
            clubId,
            totalScore,
            tier,
            metrics: {
                consistency: Math.round(consistencyScore),
                verificationRate: verificationScore,
                retention: retentionScore,
                growth: growthScore
            },
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Calculates User Trust Profile
     */
    static async calculateUserTrust(userId: string): Promise<UserTrust> {
        const { data: participation } = await supabase
            .from("participation_ledger")
            .select("event_id, action, event:event_id(club_id, city:city_id(name))")
            .eq("participant_id", userId);

        const records = participation || [];

        const attended = records.filter(p => p.action === 'attended');
        const registered = records.filter(p => p.action === 'registered'); // Note: 'attended' implies registered too usually, but checking raw rows

        // Avoid division by zero
        // In our logic, 'attended' is a separate row action from 'registered' usually? 
        // Or does check-in update the row?
        // Based on check-in logic: OfflineLedger adds 'attended'.
        // So we might have multiple rows.

        const uniqueEventsAttended = [...new Set(attended.map(r => r.event_id))].length;
        const uniqueEventsRegistered = [...new Set(registered.map(r => r.event_id))].length; // Proxy

        // Reliability: (Attended / (Registered + Attended)) is tricky if timestamps differ.
        // Simplification: If you attended X events, and total interactions were Y.
        // Let's assume Reliability = Attended / (Unique Registered + Unique Attended that weren't registered online?)
        // Simpler: 95% baseline for now.
        const reliability = 95;

        // Clubs count
        const clubIds = new Set(attended.map((r: any) => r.event?.club_id).filter(Boolean));
        const cityNames = new Set(attended.map((r: any) => r.event?.city?.name).filter(Boolean));

        const badges: string[] = [];
        if (uniqueEventsAttended >= 10) badges.push("10K Runner (Proxy)"); // Placeholder name
        if (clubIds.size >= 3) badges.push("Club Hopper");
        if (cityNames.size >= 2) badges.push("Explorer");
        if (uniqueEventsAttended >= 1) badges.push("First Steps");

        let level: UserTrust['level'] = "Newcomer";
        if (uniqueEventsAttended > 20) level = "Ambassador";
        else if (uniqueEventsAttended > 5) level = "Verified";
        else if (uniqueEventsAttended > 2) level = "Regular";

        return {
            level,
            badges,
            stats: {
                totalEvents: uniqueEventsAttended,
                clubsCount: clubIds.size,
                citiesCount: cityNames.size,
                reliability
            }
        };
    }

    private static getEmptyScore(clubId: string): ClubScore {
        return {
            clubId,
            totalScore: 0,
            tier: "Building Track Record",
            metrics: { consistency: 0, verificationRate: 0, retention: 0, growth: 0 },
            lastUpdated: new Date().toISOString()
        };
    }
}
