import { cn } from "@/lib/utils";
import { ReactNode, CSSProperties } from "react";

export interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
  variant?: "default" | "frosted" | "gradient";
}

export function GlassCard({ 
  children, 
  className, 
  hover = false, 
  style,
  variant = "default"
}: GlassCardProps) {
  const variants = {
    default: "bg-background/60 backdrop-blur-xl border-border/50",
    frosted: "bg-white/10 dark:bg-black/20 backdrop-blur-2xl border-white/20 dark:border-white/10",
    gradient: "bg-gradient-to-br from-background/80 via-background/60 to-background/40 backdrop-blur-2xl border-primary/20"
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        variants[variant],
        "border",
        "shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
        hover && [
          "transition-all duration-500 ease-out",
          "hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)]",
          "hover:border-primary/40",
          "hover:-translate-y-2",
          "hover:scale-[1.02]"
        ],
        className
      )}
      style={style}
    >
      {/* Glassmorphism highlight effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Subtle animated glow on hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
      
      {/* Top shine effect */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// New component for cards with images
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
        "group relative overflow-hidden rounded-2xl",
        "bg-background/60 backdrop-blur-xl",
        "border border-border/50",
        "shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
        "transition-all duration-500 ease-out",
        "hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)]",
        "hover:border-primary/40",
        "hover:-translate-y-2",
        className
      )}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt="" 
          className={cn(
            "w-full h-full object-cover",
            "transition-transform duration-700 ease-out",
            "group-hover:scale-110",
            imageClassName
          )}
        />
        {overlay && (
          <>
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        )}
      </div>
      
      {/* Content with glass effect */}
      <div className="relative z-10 bg-gradient-to-b from-transparent to-background/80 backdrop-blur-sm">
        {children}
      </div>
      
      {/* Top shine effect */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
    </div>
  );
}