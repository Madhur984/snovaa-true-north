// Silent Luxury Motion Variants
// Core animation patterns for Framer Motion

import { Variants } from "framer-motion";
import { motionTokens } from "./tokens";

// Fade up - The signature luxury reveal
export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: motionTokens.offset.subtle,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.section,
      ease: motionTokens.easing,
    },
  },
};

// Fade only - Ultra minimal, no movement
export const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: motionTokens.duration.body,
      ease: motionTokens.easing,
    },
  },
};

// Hero variant - Slower, more dramatic
export const fadeUpHero: Variants = {
  hidden: {
    opacity: 0,
    y: motionTokens.offset.subtle,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.hero,
      ease: motionTokens.easing,
    },
  },
};

// Route/Page transitions
export const routeTransition: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: motionTokens.duration.section,
      ease: motionTokens.easing,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: motionTokens.duration.ui,
      ease: motionTokens.easing,
    },
  },
};

// Dashboard card - No lift, no scale, just fade
export const dashboardCard: Variants = {
  hidden: {
    opacity: 0,
    y: motionTokens.offset.subtle,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.body,
      ease: motionTokens.easing,
    },
  },
};

// Feed container - For staggered children
export const feedContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: motionTokens.stagger.soft,
    },
  },
};

// Editorial container - Wider stagger for luxury layouts
export const editorialContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: motionTokens.stagger.editorial,
    },
  },
};

// Feed item - Individual list items
export const feedItem: Variants = {
  hidden: {
    opacity: 0,
    y: motionTokens.offset.subtle,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.body,
      ease: motionTokens.easing,
    },
  },
};

// Hover states - Ultra minimal
export const hoverOpacity = {
  whileHover: {
    opacity: 0.95,
    transition: {
      duration: motionTokens.duration.ui,
      ease: motionTokens.easing,
    },
  },
};

export const hoverSubtle = {
  whileHover: {
    opacity: 0.9,
    y: 1,
    transition: {
      duration: motionTokens.duration.ui,
      ease: motionTokens.easing,
    },
  },
};

// Button states
export const buttonMotion = {
  whileHover: { opacity: 0.85 },
  whileTap: { opacity: 0.75 },
  transition: {
    duration: motionTokens.duration.ui,
    ease: motionTokens.easing,
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

// Stat card
export const statCard: Variants = {
  hidden: {
    opacity: 0,
    y: motionTokens.offset.subtle,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.body,
      ease: motionTokens.easing,
    },
  },
};
