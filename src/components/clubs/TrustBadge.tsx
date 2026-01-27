
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Shield, ShieldCheck, ShieldAlert, Star } from "lucide-react";

interface TrustBadgeProps {
    tier: "Verified Elite" | "Highly Reliable" | "Consistent Performer" | "Building Track Record";
    className?: string;
    showIcon?: boolean;
}

export const TrustBadge = ({ tier, className, showIcon = true }: TrustBadgeProps) => {
    const getStyles = () => {
        switch (tier) {
            case "Verified Elite":
                return {
                    variant: "default" as const, // Uses primary color (likely black/dark)
                    className: "bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white",
                    icon: ShieldCheck,
                };
            case "Highly Reliable":
                return {
                    variant: "default" as const,
                    className: "bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white",
                    icon: Shield,
                };
            case "Consistent Performer":
                return {
                    variant: "secondary" as const,
                    className: "bg-blue-100 text-blue-800 border-blue-200",
                    icon: Star,
                };
            default:
                return {
                    variant: "outline" as const,
                    className: "text-muted-foreground border-dashed",
                    icon: ShieldAlert,
                };
        }
    };

    const styles = getStyles();
    const Icon = styles.icon;

    return (
        <Badge
            variant={styles.variant}
            className={cn("gap-1.5 py-1 px-3 transition-all", styles.className, className)}
        >
            {showIcon && <Icon className="w-3.5 h-3.5" />}
            {tier}
        </Badge>
    );
};
