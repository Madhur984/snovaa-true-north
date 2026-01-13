import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AnimatedTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
}

export function AnimatedText({ 
  children, 
  className, 
  delay = 0, 
  as: Component = "span" 
}: AnimatedTextProps) {
  return (
    <Component
      className={cn(
        "opacity-0 animate-fade-in",
        className
      )}
      style={{ 
        animationDelay: `${delay}ms`, 
        animationFillMode: "forwards",
        animationDuration: "0.8s",
        animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      }}
    >
      {children}
    </Component>
  );
}

// Reveal text with clip animation
export function RevealText({ 
  children, 
  className, 
  delay = 0 
}: Omit<AnimatedTextProps, "as">) {
  return (
    <span className="overflow-hidden inline-block">
      <span
        className={cn(
          "inline-block opacity-0 animate-reveal-text",
          className
        )}
        style={{ 
          animationDelay: `${delay}ms`, 
          animationFillMode: "forwards" 
        }}
      >
        {children}
      </span>
    </span>
  );
}
