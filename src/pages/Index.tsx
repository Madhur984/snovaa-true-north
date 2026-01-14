import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/GlassCard";
import { HeroBackground } from "@/components/ui/HeroBackground";
import { Shield, Database, Eye, Lock, ArrowRight, Calendar, Users, MapPin } from "lucide-react";
import { 
  fadeUp, 
  fadeUpHero, 
  editorialContainer, 
  statsContainer, 
  statCard,
  scrollViewport 
} from "@/lib/motion";
import heroBg from "@/assets/hero-bg.jpg";

const HeroScene = lazy(() => import("@/components/3d/HeroScene").then(m => ({ default: m.HeroScene })));

const stats = [
  { label: "Active Events", value: "500+", icon: Calendar },
  { label: "Verified Attendees", value: "12K+", icon: Users },
  { label: "Cities Worldwide", value: "45+", icon: MapPin },
];

const features = [
  {
    icon: Database,
    title: "Immutable Records",
    description: "Every participation is permanently recorded. No edits, no deletions.",
  },
  {
    icon: Shield,
    title: "Truth-First Design",
    description: "Built on integrity. The ledger cannot be modified by any view or module.",
  },
  {
    icon: Eye,
    title: "Calm Experience",
    description: "No feeds, no notifications, no engagement metrics. Just verified participation.",
  },
  {
    icon: Lock,
    title: "Privacy Preserved",
    description: "Your data is protected. No live tracking, no social graphs, no surveillance.",
  },
];

const Index = () => {
  return (
    <Layout showHeader={true}>
      {/* Full-page background with vignette */}
      <HeroBackground 
        image={heroBg} 
        speed={0.4} 
        opacity={85} 
        grayscale={40} 
        overlay="light"
        vignette
      />

      {/* Hero Section - Silent Luxury */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
        
        <div className="container max-w-5xl relative z-10 py-32">
          <motion.div 
            className="max-w-3xl space-y-12"
            variants={editorialContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.p 
              variants={fadeUpHero}
              className="text-xs font-sans font-light tracking-luxury uppercase text-subtle"
            >
              A Private Members Network
            </motion.p>

            <motion.h1 
              variants={fadeUpHero}
              className="font-serif text-5xl md:text-6xl lg:text-7xl font-light text-display leading-[1.1]"
            >
              Where People<br />
              <span className="italic">Truly</span> Gather
            </motion.h1>
            
            <motion.p 
              variants={fadeUpHero}
              className="text-lg md:text-xl text-body font-light leading-relaxed max-w-xl"
            >
              A calm, immutable record of participation. No feeds. No likes. 
              No notifications. Just truth, preserved with integrity.
            </motion.p>

            <motion.div 
              variants={fadeUpHero}
              className="flex flex-wrap gap-6 pt-4"
            >
              <Link 
                to="/signup"
                className="inline-flex items-center gap-3 text-xs font-sans tracking-luxury uppercase bg-primary text-primary-foreground px-8 py-4 hover:opacity-85 transition-opacity duration-350"
              >
                Request Access
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/events"
                className="inline-flex items-center gap-3 text-xs font-sans tracking-luxury uppercase text-display border border-border/60 px-8 py-4 hover:opacity-85 transition-opacity duration-350"
              >
                Explore Events
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.7 }}
        >
          <span className="text-xs font-sans tracking-luxury uppercase text-subtle">Scroll</span>
          <div className="w-px h-12 bg-border/60 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-4 bg-display animate-slide-down" 
                 style={{ animation: "slide-down 2s ease-in-out infinite" }} />
          </div>
        </motion.div>
      </section>

      {/* Stats Section - Minimal */}
      <section className="py-20 border-y border-border/30">
        <div className="container max-w-5xl">
          <motion.div 
            className="grid grid-cols-3 gap-8"
            variants={statsContainer}
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewport}
          >
            {stats.map((stat) => (
              <motion.div 
                key={stat.label} 
                variants={statCard}
                className="text-center"
              >
                <p className="font-serif text-4xl md:text-5xl font-light text-display mb-2">
                  {stat.value}
                </p>
                <p className="text-xs font-sans tracking-luxury uppercase text-subtle">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section - Editorial Grid */}
      <section className="py-32 md:py-40">
        <div className="container max-w-5xl">
          <motion.div 
            className="max-w-2xl mb-20"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewport}
          >
            <p className="text-xs font-sans font-light tracking-luxury uppercase text-subtle mb-8">
              Our Principles
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-display">
              Built on Integrity
            </h2>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-px bg-border/30"
            variants={editorialContainer}
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewport}
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={fadeUp}>
                <GlassCard 
                  variant="minimal"
                  className="p-12 md:p-16 bg-background h-full"
                >
                  <feature.icon className="w-5 h-5 text-display mb-8" strokeWidth={1} />
                  <h3 className="font-serif text-xl md:text-2xl font-light text-display mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-body font-light leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works - Numbered Steps */}
      <section className="py-32 md:py-40 bg-sunken">
        <div className="container max-w-5xl">
          <motion.div 
            className="max-w-2xl mb-20"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewport}
          >
            <p className="text-xs font-sans font-light tracking-luxury uppercase text-subtle mb-8">
              The Process
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-display">
              Simple. Verified. Permanent.
            </h2>
          </motion.div>

          <motion.div 
            className="space-y-0"
            variants={editorialContainer}
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewport}
          >
            {[
              {
                step: "01",
                title: "Discover Events",
                description: "Browse curated events and clubs in your city. No algorithmic feeds—just authentic gatherings.",
              },
              {
                step: "02", 
                title: "Register & Attend",
                description: "Confirm your participation with a simple check-in. QR codes make verification seamless.",
              },
              {
                step: "03",
                title: "Build Your Record",
                description: "Every attendance is permanently recorded. Your participation history, verified and immutable.",
              },
            ].map((item) => (
              <motion.div 
                key={item.step} 
                variants={fadeUp}
                className="grid md:grid-cols-12 gap-8 py-12 border-t border-border/30"
              >
                <div className="md:col-span-2">
                  <span className="font-serif text-4xl font-light text-subtle">{item.step}</span>
                </div>
                <div className="md:col-span-4">
                  <h3 className="font-serif text-xl font-light text-display">{item.title}</h3>
                </div>
                <div className="md:col-span-6">
                  <p className="text-body font-light leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Minimal */}
      <section className="py-32 md:py-40">
        <div className="container max-w-3xl text-center">
          <motion.div
            variants={editorialContainer}
            initial="hidden"
            whileInView="visible"
            viewport={scrollViewport}
          >
            <motion.p 
              variants={fadeUp}
              className="text-xs font-sans font-light tracking-luxury uppercase text-subtle mb-8"
            >
              Join the Network
            </motion.p>
            <motion.h2 
              variants={fadeUp}
              className="font-serif text-4xl md:text-5xl font-light text-display mb-8"
            >
              Ready to participate<br />
              <span className="italic">authentically?</span>
            </motion.h2>
            <motion.p 
              variants={fadeUp}
              className="text-lg text-body font-light max-w-xl mx-auto mb-12"
            >
              Join the truth-first event network. Your participation matters—and it will be 
              recorded with integrity.
            </motion.p>
            <motion.div 
              variants={fadeUp}
              className="flex flex-wrap justify-center gap-6"
            >
              <Link 
                to="/signup"
                className="inline-flex items-center gap-3 text-xs font-sans tracking-luxury uppercase bg-primary text-primary-foreground px-10 py-5 hover:opacity-85 transition-opacity duration-350"
              >
                Create Account
              </Link>
              <Link 
                to="/philosophy"
                className="inline-flex items-center gap-3 text-xs font-sans tracking-luxury uppercase text-display link-underline"
              >
                Our Philosophy
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
