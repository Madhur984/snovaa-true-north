import { cn } from "@/lib/utils";

interface PhaseCardProps {
  number: number;
  title: string;
  description: string;
  status?: "locked" | "current" | "future";
}

export const PhaseCard = ({ number, title, description, status = "future" }: PhaseCardProps) => {
  return (
    <div
      className={cn(
        "group relative p-6 rounded-lg border transition-all duration-300",
        status === "current" && "bg-accent-soft border-primary/20",
        status === "locked" && "bg-sunken border-border opacity-60",
        status === "future" && "bg-elevated border-border hover:border-primary/30"
      )}
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
            status === "current" && "bg-primary text-primary-foreground",
            status === "locked" && "bg-muted text-muted-foreground",
            status === "future" && "bg-secondary text-secondary-foreground"
          )}
        >
          {number}
        </span>
        <div className="space-y-1">
          <h3 className="font-serif text-lg font-medium text-display">{title}</h3>
          <p className="text-sm text-body leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};
