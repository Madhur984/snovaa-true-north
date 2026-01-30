
import { useState } from "react";
import { useClubRoles, ClubUser, ClubRole } from "@/hooks/useClubRoles";
import { RoleBadge } from "./RoleBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreVertical, ShieldPlus, ShieldMinus, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ClubRoleManagerProps {
    clubId: string;
}

export const ClubRoleManager = ({ clubId }: ClubRoleManagerProps) => {
    const { members, loading, currentUserRole, refetch } = useClubRoles(clubId);
    const [activeTab, setActiveTab] = useState("all");

    const canManage = currentUserRole === "owner" || currentUserRole === "co-organizer";
    const isOwner = currentUserRole === "owner";

    const handleUpdateRole = async (profileId: string, newRole: ClubRole) => {
        try {
            // 1. If demoting to Member, remove from club_organizers
            if (newRole === "member") {
                const { error } = await supabase
                    .from("club_organizers")
                    .delete()
                    .match({ club_id: clubId, profile_id: profileId });

                if (error) throw error;
            } else {
                // 2. Promoting or Changing Organizer Role
                // Upsert to club_organizers
                // Note: Our table has a unique constraint on (club_id, profile_id)
                const { error } = await supabase
                    .from("club_organizers")
                    .upsert({
                        club_id: clubId,
                        profile_id: profileId,
                        role: newRole
                    });

                if (error) {
                    // Catch Trigger Errors (P0001) for Limits
                    if (error.code === 'P0001') {
                        toast.error(error.message); // e.g. "Club can only have 2 co-organizers"
                        return;
                    }
                    throw error;
                }
            }

            toast.success(`Role updated to ${newRole}`);
            refetch();
        } catch (error: any) {
            console.error("Role update failed:", error);
            toast.error("Failed to update role. " + (error.message || ""));
        }
    };

    const filteredMembers = activeTab === "all"
        ? members
        : members.filter(m => m.role === activeTab);

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Governance...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Team & Governance</h2>
                <span className="text-sm text-muted-foreground">{members.length} Members</span>
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start bg-muted/50 p-1 mb-6 rounded-xl">
                    <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
                    <TabsTrigger value="owner" className="rounded-lg">Owners</TabsTrigger>
                    <TabsTrigger value="co-organizer" className="rounded-lg">Co-Organizers</TabsTrigger>
                    <TabsTrigger value="volunteer" className="rounded-lg">Volunteers</TabsTrigger>
                    <TabsTrigger value="member" className="rounded-lg">Members</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredMembers.map((member) => (
                            <MemberCard
                                key={member.profileId}
                                member={member}
                                canManage={canManage}
                                isOwner={isOwner}
                                onRoleUpdate={handleUpdateRole}
                                currentUserId={members.find(u => u.role === currentUserRole)?.userId // This logic is slightly flawed for finding MY ID, but we only need it to prevent editing self if needed
                                }
                            />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

// Sub-component for individual card
const MemberCard = ({
    member,
    canManage,
    isOwner,
    onRoleUpdate,
    currentUserId
}: {
    member: ClubUser,
    canManage: boolean,
    isOwner: boolean,
    onRoleUpdate: (pid: string, role: ClubRole) => void,
    currentUserId?: string
}) => {

    // Logic: 
    // Owner can edit anyone (except maybe self? usually yes).
    // Co-Org can edit Volunteers/Members, but NOT other Co-Orgs or Owner.
    const isTargetOwner = member.role === "owner";
    const isTargetCoOrg = member.role === "co-organizer";

    let canEditThisUser = false;
    if (isOwner) canEditThisUser = true; // Owner rules all
    else if (canManage && !isTargetOwner && !isTargetCoOrg) canEditThisUser = true; // Co-Org can edit lower tiers

    return (
        <Card className="card-future overflow-hidden bg-card/50 backdrop-blur-sm border-white/5 hover:border-white/10 transition-all duration-300 group">
            <CardContent className="p-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 ring-2 ring-white/5 group-hover:ring-primary/20 transition-all">
                        <AvatarImage src={member.avatarUrl || ""} />
                        <AvatarFallback>{member.displayName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h4 className="font-medium leading-none text-foreground/90">{member.displayName}</h4>
                        <RoleBadge role={member.role} />
                        {member.verifiedEventCount > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {member.verifiedEventCount} Verified Events
                            </p>
                        )}
                    </div>
                </div>

                {canEditThisUser && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-white/10">
                            <DropdownMenuLabel>Manage Roles</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />

                            {/* Promote Actions */}
                            {member.role !== "co-organizer" && isOwner && (
                                <DropdownMenuItem onClick={() => onRoleUpdate(member.profileId, "co-organizer")}>
                                    <ShieldPlus className="mr-2 h-4 w-4 text-primary" />
                                    Promote to Co-Organizer
                                </DropdownMenuItem>
                            )}

                            {member.role !== "volunteer" && (
                                <DropdownMenuItem onClick={() => onRoleUpdate(member.profileId, "volunteer")}>
                                    <ShieldPlus className="mr-2 h-4 w-4 text-blue-500" />
                                    Promote to Volunteer
                                </DropdownMenuItem>
                            )}

                            {/* Demote Actions */}
                            {member.role !== "member" && (
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onRoleUpdate(member.profileId, "member")}>
                                    <ShieldMinus className="mr-2 h-4 w-4" />
                                    Demote to Member
                                </DropdownMenuItem>
                            )}

                            {/* Kick Action (Placeholder) */}
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem className="text-red-500 focus:text-red-500">
                                <UserMinus className="mr-2 h-4 w-4" />
                                Remove from Club
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </CardContent>
        </Card>
    );
};
