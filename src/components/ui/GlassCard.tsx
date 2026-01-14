import { cn } from "@/lib/utils";
import { ReactNode, CSSProperties } from "react";

export interface LuxuryCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
  variant?: "default" | "bordered" | "minimal";
}

export function GlassCard({
  children,
  className,
  hover = false,
  style,
  variant = "default"
}: LuxuryCardProps) {
  const variants = {
    default: "bg-card border-hairline border-border/80",
    bordered: "bg-transparent border border-border",
    minimal: "bg-transparent",
  };

  return (
    <div
      className={cn(
        "relative",
        variants[variant],
        hover && [
          "transition-all duration-600 ease-luxury",
          "hover:border-border",
        ],
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

// Luxury image card for editorial layouts
export interface GlassImageCardProps {
  children: ReactNode;
  imageUrl: string;
  className?: string;
  imageClassName?: string;
  overlay?: boolean;
}

export function GlassImageCard({
  children,
  imageUrl,
  className,
  imageClassName,
  overlay = true
}: GlassImageCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden",
        "bg-card",
        "border-hairline border-border/70",
        "transition-all duration-600 ease-luxury",
        "hover:border-border",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt=""
          className={cn(
            "w-full h-full object-cover",
            "transition-transform duration-800 ease-luxury",
            "group-hover:scale-105",
            "grayscale-[20%] group-hover:grayscale-0",
            imageClassName
          )}
        />
        {overlay && (
          <div className="absolute inset-0 bg-background/10 group-hover:bg-transparent transition-colors duration-600" />
        )}
      </div>

      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
