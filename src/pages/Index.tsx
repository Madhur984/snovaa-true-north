import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Shield, Database, Eye, Lock, ArrowRight, Calendar, Users, MapPin } from "lucide-react";
import { useParallax } from "@/hooks/use-parallax";
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
  const parallaxOffset = useParallax(0.4);

  return (
    <Layout showHeader={true}>
      {/* Hero Section - Silent Luxury */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image with Parallax */}
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <img 
            src={heroBg} 
            alt="" 
            className="w-full h-[120%] object-cover opacity-50 grayscale-[40%]"
            style={{ transform: `translateY(${parallaxOffset}px) scale(1.1)` }}
          />
          <div className="absolute inset-0 bg-background/50" />
        </div>
        
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
        
        <div className="container max-w-5xl relative z-10 py-32">
          <div className="max-w-3xl space-y-12">
            <AnimatedText 
              as="p" 
              className="text-xs font-sans font-light tracking-luxury uppercase text-subtle"
            >
              A Private Members Network
            </AnimatedText>

            <AnimatedText as="h1" delay={100} className="font-serif font-light text-display">
              Where People<br />
              <span className="italic">Truly</span> Gather
            </AnimatedText>
            
            <AnimatedText as="p" delay={200} className="text-lg md:text-xl text-body font-light leading-relaxed max-w-xl">
              A calm, immutable record of participation. No feeds. No likes. 
              No notifications. Just truth, preserved with integrity.
            </AnimatedText>

            <AnimatedText delay={300} className="flex flex-wrap gap-6 pt-4">
              <Link 
                to="/signup"
                className="inline-flex items-center gap-3 text-xs font-sans tracking-luxury uppercase bg-primary text-primary-foreground px-8 py-4 hover:opacity-90 transition-opacity duration-500"
              >
                Request Access
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/events"
                className="inline-flex items-center gap-3 text-xs font-sans tracking-luxury uppercase text-display border border-border/60 px-8 py-4 hover:bg-muted/30 transition-all duration-500"
              >
                Explore Events
              </Link>
            </AnimatedText>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
          <span className="text-xs font-sans tracking-luxury uppercase text-subtle">Scroll</span>
          <div className="w-px h-12 bg-border/60 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-4 bg-display animate-slide-down" 
                 style={{ animation: "slide-down 2s ease-in-out infinite" }} />
          </div>
        </div>
      </section>

      {/* Stats Section - Minimal */}
      <section className="py-20 border-y border-border/30">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <AnimatedText 
                key={stat.label} 
                delay={index * 100}
                className="text-center"
              >
                <p className="font-serif text-4xl md:text-5xl font-light text-display mb-2">
                  {stat.value}
                </p>
                <p className="text-xs font-sans tracking-luxury uppercase text-subtle">
                  {stat.label}
                </p>
              </AnimatedText>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Editorial Grid */}
      <section className="py-32 md:py-40">
        <div className="container max-w-5xl">
          <div className="max-w-2xl mb-20">
            <AnimatedText 
              as="p" 
              className="text-xs font-sans font-light tracking-luxury uppercase text-subtle mb-8"
            >
              Our Principles
            </AnimatedText>
            <AnimatedText as="h2" delay={100} className="font-serif font-light text-display">
              Built on Integrity
            </AnimatedText>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-border/30">
            {features.map((feature, index) => (
              <GlassCard 
                key={feature.title} 
                variant="minimal"
                className="p-12 md:p-16 bg-background opacity-0 animate-fade-in"
                style={{ animationDelay: `${200 + index * 100}ms`, animationFillMode: "forwards" }}
              >
                <feature.icon className="w-5 h-5 text-display mb-8" strokeWidth={1} />
                <h3 className="font-serif text-xl md:text-2xl font-light text-display mb-4">
                  {feature.title}
                </h3>
                <p className="text-body font-light leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Numbered Steps */}
      <section className="py-32 md:py-40 bg-sunken">
        <div className="container max-w-5xl">
          <div className="max-w-2xl mb-20">
            <AnimatedText 
              as="p" 
              className="text-xs font-sans font-light tracking-luxury uppercase text-subtle mb-8"
            >
              The Process
            </AnimatedText>
            <AnimatedText as="h2" delay={100} className="font-serif font-light text-display">
              Simple. Verified. Permanent.
            </AnimatedText>
          </div>

          <div className="space-y-0">
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
            ].map((item, index) => (
              <div 
                key={item.step} 
                className="grid md:grid-cols-12 gap-8 py-12 border-t border-border/30 opacity-0 animate-fade-in"
                style={{ animationDelay: `${200 + index * 150}ms`, animationFillMode: "forwards" }}
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Minimal */}
      <section className="py-32 md:py-40">
        <div className="container max-w-3xl text-center">
          <AnimatedText 
            as="p" 
            className="text-xs font-sans font-light tracking-luxury uppercase text-subtle mb-8"
          >
            Join the Network
          </AnimatedText>
          <AnimatedText as="h2" delay={100} className="font-serif font-light text-display mb-8">
            Ready to participate<br />
            <span className="italic">authentically?</span>
          </AnimatedText>
          <AnimatedText as="p" delay={200} className="text-lg text-body font-light max-w-xl mx-auto mb-12">
            Join the truth-first event network. Your participation matters—and it will be 
            recorded with integrity.
          </AnimatedText>
          <AnimatedText delay={300} className="flex flex-wrap justify-center gap-6">
            <Link 
              to="/signup"
              className="inline-flex items-center gap-3 text-xs font-sans tracking-luxury uppercase bg-primary text-primary-foreground px-10 py-5 hover:opacity-90 transition-opacity duration-500"
            >
              Create Account
            </Link>
            <Link 
              to="/philosophy"
              className="inline-flex items-center gap-3 text-xs font-sans tracking-luxury uppercase text-display link-underline"
            >
              Our Philosophy
            </Link>
          </AnimatedText>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
