
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type PublicProfile = Database["public"]["Tables"]["profiles"]["Row"];
type ClubMember = Database["public"]["Tables"]["club_members"]["Row"];
type ClubOrganizer = Database["public"]["Tables"]["club_organizers"]["Row"];

export type ClubRole = "owner" | "co-organizer" | "volunteer" | "member";

export interface ClubUser {
    profileId: string;
    userId: string;
    displayName: string | null;
    avatarUrl: string | null;
    role: ClubRole;
    joinedAt: string;
    verifiedEventCount: number;
}

export const useClubRoles = (clubId: string) => {
    const [members, setMembers] = useState<ClubUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserRole, setCurrentUserRole] = useState<ClubRole | null>(null);

    const fetchMembers = async () => {
        try {
            setLoading(true);

            // 1. Fetch all members
            const { data: memberData, error: memberError } = await supabase
                .from("club_members")
                .select(`
          *,
          profiles:profile_id (*)
        `)
                .eq("club_id", clubId);

            if (memberError) throw memberError;

            // 2. Fetch all organizers (Owner, Co-Org, Volunteer)
            const { data: organizerData, error: organizerError } = await supabase
                .from("club_organizers")
                .select(`
          *,
          profiles:profile_id (*)
        `)
                .eq("club_id", clubId);

            if (organizerError) throw organizerError;

            // 3. Map and Merge
            // Priority: Organizer Role > Member Role
            const combinedUsers: ClubUser[] = [];
            const processedProfileIds = new Set<string>();

            // Process Organizers first
            organizerData?.forEach((org) => {
                const profile = org.profiles as unknown as PublicProfile;
                if (!profile) return;

                combinedUsers.push({
                    profileId: profile.id,
                    userId: profile.user_id || "",
                    displayName: profile.display_name,
                    avatarUrl: profile.avatar_url,
                    role: org.role as ClubRole, // owner, co-organizer, volunteer
                    joinedAt: org.added_at,
                    verifiedEventCount: 0, // Organizers might not have this tracked here, or check member record
                });
                processedProfileIds.add(profile.id);
            });

            // Process Members (skipping those who are also organizers)
            memberData?.forEach((mem) => {
                const profile = mem.profiles as unknown as PublicProfile;
                if (!profile) return;

                // Start with Member role
                let role: ClubRole = "member";

                // Check if they are already processed as organizer
                if (processedProfileIds.has(profile.id)) {
                    // We might want to update their verified count strictly from member record
                    const existingIndex = combinedUsers.findIndex(u => u.profileId === profile.id);
                    if (existingIndex !== -1) {
                        combinedUsers[existingIndex].verifiedEventCount = mem.verified_event_count || 0;
                    }
                    return;
                }

                combinedUsers.push({
                    profileId: profile.id,
                    userId: profile.user_id || "",
                    displayName: profile.display_name,
                    avatarUrl: profile.avatar_url,
                    role: "member",
                    joinedAt: mem.joined_at,
                    verifiedEventCount: mem.verified_event_count || 0,
                });
            });

            // Sort: Owner -> Co-Org -> Volunteer -> Member
            const rolePriority = { owner: 0, "co-organizer": 1, volunteer: 2, member: 3 };
            combinedUsers.sort((a, b) => rolePriority[a.role] - rolePriority[b.role]);

            setMembers(combinedUsers);

            // Determine Current User Role
            const { data: session } = await supabase.auth.getSession();
            if (session?.session?.user) {
                const myProfile = combinedUsers.find(u => u.userId === session.session.user.id);
                setCurrentUserRole(myProfile?.role || null);
            }

        } catch (error) {
            console.error("Error fetching club roles:", error);
            toast.error("Failed to load club members.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (clubId) {
            fetchMembers();

            // Realtime Subscriptions
            const memberChannel = supabase
                .channel('public:club_members')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'club_members', filter: `club_id=eq.${clubId}` }, fetchMembers)
                .subscribe();

            const organizerChannel = supabase
                .channel('public:club_organizers')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'club_organizers', filter: `club_id=eq.${clubId}` }, fetchMembers)
                .subscribe();

            return () => {
                supabase.removeChannel(memberChannel);
                supabase.removeChannel(organizerChannel);
            };
        }
    }, [clubId]);

    return { members, loading, currentUserRole, refetch: fetchMembers };
};
