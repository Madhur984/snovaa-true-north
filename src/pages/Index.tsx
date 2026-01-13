import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Button } from "@/components/ui/button";
import { Shield, Database, Eye, Lock, ArrowRight, Calendar, Users, MapPin, Sparkles } from "lucide-react";
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
    gradient: "from-teal-500/20 to-cyan-500/20",
  },
  {
    icon: Shield,
    title: "Truth-First Design",
    description: "Built on integrity. The ledger cannot be modified by any view or module.",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    icon: Eye,
    title: "Calm Experience",
    description: "No feeds, no notifications, no engagement metrics. Just verified participation.",
    gradient: "from-cyan-500/20 to-blue-500/20",
  },
  {
    icon: Lock,
    title: "Privacy Preserved",
    description: "Your data is protected. No live tracking, no social graphs, no surveillance.",
    gradient: "from-blue-500/20 to-indigo-500/20",
  },
];

const Index = () => {
  const parallaxOffset = useParallax(0.4);

  return (
    <Layout showHeader={true}>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image with Parallax */}
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <img 
            src={heroBg} 
            alt="" 
            className="w-full h-[120%] object-cover opacity-95"
            style={{ transform: `translateY(${parallaxOffset}px) scale(1.1)` }}
          />
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        </div>
        
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
        
        <div className="container max-w-6xl relative z-10">
          <div className="max-w-3xl space-y-8">
            <AnimatedText as="h1" className="font-serif text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.1] text-display">
              Where People{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-teal-600 bg-clip-text text-transparent">
                Truly Gather
              </span>
            </AnimatedText>
            
            <AnimatedText as="p" delay={100} className="text-xl md:text-2xl text-body leading-relaxed max-w-2xl">
              A calm, immutable record of participation. No feeds. No likes. 
              No notifications. Just truth, preserved with integrity.
            </AnimatedText>

            <AnimatedText delay={200} className="flex flex-wrap gap-4 pt-4">
              <Button asChild size="lg" className="group text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                <Link to="/signup">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8 py-6 rounded-xl backdrop-blur-sm bg-background/50 hover:bg-background/80 transition-all">
                <Link to="/events">Explore Events</Link>
              </Button>
            </AnimatedText>

            {/* Stats */}
            <AnimatedText delay={300} className="flex flex-wrap gap-8 pt-8">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-serif font-medium text-display">{stat.value}</p>
                    <p className="text-sm text-subtle">{stat.label}</p>
                  </div>
                </div>
              ))}
            </AnimatedText>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-sm text-subtle">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-border flex items-start justify-center p-1">
            <div className="w-1.5 h-3 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 overflow-hidden">
        
        <div className="container max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <AnimatedText as="h2" className="font-serif text-4xl md:text-5xl font-medium text-display mb-4">
              Built on{" "}
              <span className="bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
                Principles
              </span>
            </AnimatedText>
            <AnimatedText as="p" delay={100} className="text-lg text-body max-w-2xl mx-auto">
              SNOVAA is designed to be boring, calm, and correct. Truth first, 
              then carefully exposed views that preserve integrity.
            </AnimatedText>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <GlassCard key={feature.title} hover className="p-8">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-medium text-display mb-3">
                  {feature.title}
                </h3>
                <p className="text-body leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-gradient-to-b from-background via-sunken to-background">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <AnimatedText as="h2" className="font-serif text-4xl md:text-5xl font-medium text-display mb-4">
              Simple.{" "}
              <span className="bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
                Verified.
              </span>{" "}
              Permanent.
            </AnimatedText>
            <AnimatedText as="p" delay={100} className="text-lg text-body max-w-2xl mx-auto">
              Three steps to authenticated participation
            </AnimatedText>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Discover Events",
                description: "Browse curated events and clubs in your city. No algorithmic feeds—just authentic gatherings.",
                icon: Calendar,
              },
              {
                step: "02", 
                title: "Register & Attend",
                description: "Confirm your participation with a simple check-in. QR codes make verification seamless.",
                icon: Users,
              },
              {
                step: "03",
                title: "Build Your Record",
                description: "Every attendance is permanently recorded. Your participation history, verified and immutable.",
                icon: Sparkles,
              },
            ].map((item, index) => (
              <GlassCard key={item.step} hover className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-teal-500/20 mb-6">
                  <span className="font-serif text-2xl font-medium text-primary">{item.step}</span>
                </div>
                <h3 className="font-serif text-xl font-medium text-display mb-3">
                  {item.title}
                </h3>
                <p className="text-body text-sm leading-relaxed">
                  {item.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-teal-500/10 to-cyan-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="container max-w-4xl relative z-10 text-center">
          <GlassCard className="p-12 md:p-16">
            <AnimatedText as="h2" className="font-serif text-4xl md:text-5xl font-medium text-display mb-6">
              Ready to participate{" "}
              <span className="bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
                authentically?
              </span>
            </AnimatedText>
            <AnimatedText as="p" delay={100} className="text-lg text-body max-w-xl mx-auto mb-10">
              Join the truth-first event network. Your participation matters—and it will be 
              recorded with integrity.
            </AnimatedText>
            <AnimatedText delay={200} className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="text-base px-10 py-6 rounded-xl shadow-lg shadow-primary/20">
                <Link to="/signup">Create Free Account</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-10 py-6 rounded-xl">
                <Link to="/philosophy">Our Philosophy</Link>
              </Button>
            </AnimatedText>
          </GlassCard>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
