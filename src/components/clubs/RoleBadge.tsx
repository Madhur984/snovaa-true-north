
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, User, Star } from "lucide-react";
import { ClubRole } from "@/hooks/useClubRoles";

interface RoleBadgeProps {
    role: ClubRole;
    className?: string;
}

export const RoleBadge = ({ role, className }: RoleBadgeProps) => {
    switch (role) {
        case "owner":
            return (
                <Badge variant="outline" className={`gap-1 border-yellow-500/50 text-yellow-600 bg-yellow-500/10 hover:bg-yellow-500/20 ${className}`}>
                    <Star className="w-3 h-3 fill-yellow-600" />
                    Owner
                </Badge>
            );
        case "co-organizer":
            return (
                <Badge variant="secondary" className={`gap-1 bg-primary text-primary-foreground hover:bg-primary/90 ${className}`}>
                    <ShieldCheck className="w-3 h-3" />
                    Co-Organizer
                </Badge>
            );
        case "volunteer":
            return (
                <Badge variant="outline" className={`gap-1 border-blue-500/30 text-blue-600 bg-blue-500/5 hover:bg-blue-500/10 ${className}`}>
                    <Shield className="w-3 h-3" />
                    Volunteer
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className={`gap-1 text-muted-foreground ${className}`}>
                    <User className="w-3 h-3" />
                    Member
                </Badge>
            );
    }
};
