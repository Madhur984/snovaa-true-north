import { useParallax } from "@/hooks/use-parallax";
import { cn } from "@/lib/utils";

interface HeroBackgroundProps {
  image: string;
  /** Parallax speed - higher = more movement. Default: 0.3 */
  speed?: number;
  /** Base opacity for the image. Default: 0.6 */
  opacity?: number;
  /** Grayscale amount 0-100. Default: 30 */
  grayscale?: number;
  /** Enable vignette effect. Default: true */
  vignette?: boolean;
  /** Overlay intensity - how much the gradient covers. Default: "medium" */
  overlay?: "light" | "medium" | "heavy";
  className?: string;
}

/**
 * Full-page hero background with parallax, vignette, and layered gradients.
 * Silent luxury aesthetic - calm, confident transitions.
 */
export function HeroBackground({
  image,
  speed = 0.3,
  opacity = 60,
  grayscale = 30,
  vignette = true,
  overlay = "medium",
  className,
}: HeroBackgroundProps) {
  const parallaxOffset = useParallax(speed);
  
  // Slower secondary parallax for depth layering
  const parallaxOffsetSlow = useParallax(speed * 0.5);

  const overlayStyles = {
    light: "from-background/20 via-background/40 to-background/80",
    medium: "from-background/30 via-background/60 to-background/90",
    heavy: "from-background/50 via-background/75 to-background",
  };

  return (
    <div className={cn("fixed inset-0 -z-30 overflow-hidden", className)}>
      {/* Primary image layer with parallax */}
      <div 
        className="absolute inset-0 w-full h-[140%] -top-[20%]"
        style={{ 
          transform: `translateY(${parallaxOffset}px) scale(1.1)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        <img 
          src={image} 
          alt="" 
          className="w-full h-full object-cover"
          style={{ 
            opacity: opacity / 100,
            filter: `grayscale(${grayscale}%)`,
          }}
        />
      </div>

      {/* Vignette layer */}
      {vignette && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, transparent 0%, transparent 40%, hsl(var(--background) / 0.3) 70%, hsl(var(--background) / 0.7) 100%)`,
            transform: `translateY(${parallaxOffsetSlow}px)`,
          }}
        />
      )}

      {/* Primary gradient overlay - top to bottom */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-b",
          overlayStyles[overlay]
        )}
      />

      {/* Secondary radial gradient for center focus */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 30%, transparent 0%, hsl(var(--background) / 0.4) 100%)`,
        }}
      />

      {/* Bottom fade for content readability */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          background: `linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background) / 0.8) 40%, transparent 100%)`,
        }}
      />
    </div>
  );
}
