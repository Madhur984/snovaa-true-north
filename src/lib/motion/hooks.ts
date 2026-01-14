// Motion hooks for accessibility and performance

import { useReducedMotion } from "framer-motion";
import { motionTokens } from "./tokens";
import { Variants } from "framer-motion";

// Hook to get safe motion variants with reduced motion support
export function useSafeMotion() {
  const shouldReduce = useReducedMotion();

  const safeFadeUp: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: shouldReduce ? 0.2 : motionTokens.duration.section },
    },
  };

  const safeFadeOnly: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: shouldReduce ? 0.15 : motionTokens.duration.body },
    },
  };

  return {
    shouldReduce,
    safeFadeUp,
    safeFadeOnly,
  };
}

// Viewport settings for scroll animations
export const scrollViewport = {
  once: motionTokens.viewport.once,
  margin: motionTokens.viewport.margin,
};
