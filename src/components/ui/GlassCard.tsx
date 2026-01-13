import { cn } from "@/lib/utils";
import { ReactNode, CSSProperties } from "react";

export interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
}

export function GlassCard({ children, className, hover = false, style }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-background/60 backdrop-blur-xl",
        "border border-border/50",
        "shadow-[0_8px_32px_rgba(0,0,0,0.08)]",
        hover && "transition-all duration-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] hover:border-primary/30 hover:-translate-y-1",
        className
      )}
      style={style}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
