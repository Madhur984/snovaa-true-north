// Silent Luxury Motion Tokens - Source of Truth
// Inspired by Prada's editorial restraint

export const motionTokens = {
  // Easing: calm, confident, no bounce
  easing: [0.4, 0, 0.2, 1] as const,
  
  // Durations in seconds
  duration: {
    hero: 0.9,      // Major reveals, page entries
    section: 0.7,   // Section-level animations
    body: 0.5,      // Content reveals
    ui: 0.35,       // Micro-interactions
  },
  
  // Offset in pixels - subtle, not dramatic
  offset: {
    subtle: 4,      // Standard fade-up distance
  },
  
  // Stagger delays for lists
  stagger: {
    soft: 0.1,      // Tight stagger for feeds
    editorial: 0.15, // Wider for editorial layouts
  },
  
  // Viewport settings
  viewport: {
    margin: "-80px",
    once: true,
  },
} as const;

// CSS-compatible easing string
export const easingCSS = "cubic-bezier(0.4, 0, 0.2, 1)";

// Duration in milliseconds for CSS
export const durationMS = {
  hero: 900,
  section: 700,
  body: 500,
  ui: 350,
} as const;
