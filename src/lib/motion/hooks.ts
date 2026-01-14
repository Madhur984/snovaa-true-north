// Silent Luxury Motion System — Hooks
// Accessibility and performance utilities

import { useReducedMotion } from "framer-motion";
import { Variants } from "framer-motion";
import { motionTokens } from "./tokens";

// ═══════════════════════════════════════════════════════════════
// REDUCED MOTION SUPPORT
// ═══════════════════════════════════════════════════════════════

/**
 * Hook that returns motion-safe variants
 * Falls back to fadeOnly with 200ms duration when user prefers reduced motion
 */
export function useSafeMotion() {
  const shouldReduce = useReducedMotion();
  
  // Reduced motion fallback: 200ms fadeOnly
  const reducedDuration = 0.2;

  const safeFadeUp: Variants = shouldReduce
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: reducedDuration },
        },
      }
    : {
        hidden: { opacity: 0, y: motionTokens.offsetPx },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: motionTokens.duration.section,
            ease: motionTokens.easing,
          },
        },
      };

  const safeFadeOnly: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        duration: shouldReduce ? reducedDuration : motionTokens.duration.body 
      },
    },
  };

  const safeHero: Variants = shouldReduce
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: reducedDuration },
        },
      }
    : {
        hidden: { opacity: 0, y: motionTokens.offsetPx },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: motionTokens.duration.hero,
            ease: motionTokens.easing,
          },
        },
      };

  return {
    shouldReduce,
    safeFadeUp,
    safeFadeOnly,
    safeHero,
  };
}

// ═══════════════════════════════════════════════════════════════
// SCROLL REVEAL SEQUENCE
// ═══════════════════════════════════════════════════════════════

/**
 * Creates staggered delays for scroll reveal sequence
 * Order: heading → text → media
 */
export function useScrollSequence() {
  return {
    heading: 0,
    text: motionTokens.stagger.editorial,
    media: motionTokens.stagger.editorial * 2,
  };
}

// Re-export viewport settings
export { scrollViewport } from "./variants";
