// Silent Luxury Motion System — Variants
// Exact schema specification

import { Variants, Transition } from "framer-motion";
import { motionTokens } from "./tokens";

// Base transition factory
const createTransition = (duration: keyof typeof motionTokens.duration): Transition => ({
  duration: motionTokens.duration[duration],
  ease: motionTokens.easing,
});

// ═══════════════════════════════════════════════════════════════
// CORE VARIANTS
// ═══════════════════════════════════════════════════════════════

// fadeUp - Primary reveal animation
export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: motionTokens.offsetPx,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: createTransition("section"),
  },
};

// fadeOnly - Ultra minimal, no movement
export const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: createTransition("body"),
  },
};

// fadeUpHero - Slower, more dramatic for hero sections
export const fadeUpHero: Variants = {
  hidden: {
    opacity: 0,
    y: motionTokens.offsetPx,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: createTransition("hero"),
  },
};

// ═══════════════════════════════════════════════════════════════
// PAGE TRANSITIONS
// ═══════════════════════════════════════════════════════════════

export const routeTransition: Variants = {
  initial: { 
    opacity: 0,
    y: 12,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: motionTokens.easing,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(2px)",
    transition: {
      duration: 0.4,
      ease: motionTokens.easing,
    },
  },
};

// Elegant slide transition for modals/overlays
export const slideUpTransition: Variants = {
  initial: {
    opacity: 0,
    y: 40,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: motionTokens.easing,
    },
  },
};

// Reveal from below with mask effect
export const revealUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    clipPath: "inset(100% 0% 0% 0%)",
  },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: "inset(0% 0% 0% 0%)",
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// CONTAINER VARIANTS (Stagger Children)
// ═══════════════════════════════════════════════════════════════

// Feed/List container - soft stagger
export const feedContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: motionTokens.stagger.soft,
    },
  },
};

// Editorial container - wider stagger for luxury layouts
export const editorialContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: motionTokens.stagger.editorial,
    },
  },
};

// Stats/Widget container
export const statsContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: motionTokens.stagger.soft,
      delayChildren: 0.1,
    },
  },
};

// Navigation container
export const navContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: motionTokens.stagger.soft,
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// ITEM VARIANTS (Children of Containers)
// ═══════════════════════════════════════════════════════════════

// Feed item - for lists
export const feedItem: Variants = {
  hidden: {
    opacity: 0,
    y: motionTokens.offsetPx,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: createTransition("body"),
  },
};

// Stat card - dashboard widgets
export const statCard: Variants = {
  hidden: {
    opacity: 0,
    y: motionTokens.offsetPx,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: createTransition("body"),
  },
};

// Dashboard card - NO lift, NO scale, just fade
export const dashboardCard: Variants = {
  hidden: {
    opacity: 0,
    y: motionTokens.offsetPx,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: createTransition("body"),
  },
};

// ═══════════════════════════════════════════════════════════════
// HOVER STATES (Ultra minimal - NO scale, shadow, glow)
// ═══════════════════════════════════════════════════════════════

// Text hover - subtle opacity + minimal translateY
export const hoverText = {
  whileHover: {
    opacity: motionTokens.hover.text.opacity,
    y: motionTokens.hover.text.translateY,
    transition: createTransition("ui"),
  },
};

// Generic opacity hover
export const hoverOpacity = {
  whileHover: {
    opacity: 0.95,
    transition: createTransition("ui"),
  },
};

// ═══════════════════════════════════════════════════════════════
// BUTTON MOTION
// ═══════════════════════════════════════════════════════════════

export const buttonMotion = {
  whileHover: { opacity: motionTokens.buttons.hover.opacity },
  whileTap: { opacity: motionTokens.buttons.active.opacity },
  transition: createTransition("ui"),
};

// ═══════════════════════════════════════════════════════════════
// SCROLL REVEAL VIEWPORT SETTINGS
// ═══════════════════════════════════════════════════════════════

export const scrollViewport = {
  once: motionTokens.scrollReveal.once,
  margin: motionTokens.scrollReveal.viewportMargin,
};
