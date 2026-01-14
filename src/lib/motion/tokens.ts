// Silent Luxury Motion System — Tokens
// Exact schema specification

export const motionTokens = {
  // Easing curve - calm, confident, no bounce
  easing: [0.4, 0, 0.2, 1] as const,
  easingCSS: "cubic-bezier(0.4, 0, 0.2, 1)",
  
  // Offset in pixels - subtle, not dramatic
  offsetPx: 4,
  
  // Durations in milliseconds
  durationsMs: {
    hero: 900,
    section: 700,
    body: 500,
    ui: 350,
  },
  
  // Durations in seconds (for Framer Motion)
  duration: {
    hero: 0.9,
    section: 0.7,
    body: 0.5,
    ui: 0.35,
  },
  
  // Stagger delays
  staggerMs: {
    soft: 100,
    editorial: 150,
  },
  
  stagger: {
    soft: 0.1,
    editorial: 0.15,
  },
  
  // Scroll reveal settings
  scrollReveal: {
    enabled: true,
    once: true,
    viewportMargin: "-80px",
  },
  
  // Hover constraints
  hover: {
    text: {
      opacity: 0.9,
      translateY: 1,
    },
    link: {
      underline: true,
    },
    disallowed: ["scale", "shadow", "glow"] as const,
  },
  
  // Button states
  buttons: {
    hover: { opacity: 0.85 },
    active: { opacity: 0.75 },
  },
  
  // Performance targets
  performance: {
    cssFirst: true,
    targetFPS: 60,
  },
} as const;

export type MotionTokens = typeof motionTokens;
