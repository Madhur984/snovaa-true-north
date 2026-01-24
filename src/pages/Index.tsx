import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { ArrowRight, Users, Zap, Hash, Shield, Terminal } from "lucide-react";

const EventConstellationScene = lazy(() => import("@/components/3d/EventConstellationScene").then(m => ({ default: m.EventConstellationScene })));

const Index = () => {

  return (
    <Layout showHeader={false}>
      {/* SECTION 1: CYBER HERO */}
      <section className="sticky top-0 h-screen w-full flex flex-col justify-center items-center overflow-hidden z-0">
        <div className="absolute top-8 left-8 md:top-12 md:left-12 font-mono text-xs md:text-sm tracking-widest text-muted-foreground opacity-50 z-20">
          N°001_HERO // PROTOCOL
        </div>

        {/* Soft Contrast Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/50 pointer-events-none" />

        <div className="relative z-10 text-center space-y-12 max-w-5xl px-6">
          <motion.img
            src="/snovaa-logo.png"
            alt="SNOVAA Logo"
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            className="w-24 h-24 md:w-32 md:h-32 dark:invert mx-auto mb-[-2rem] relative z-20 drop-shadow-2xl"
          />
          <div className="relative">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-[15vw] leading-[0.8] tracking-tighter relative z-10 select-none text-foreground mix-blend-overlay"
            >
              snovaa
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 2, ease: "easeOut" }}
            className="flex items-center justify-center gap-6 text-muted-foreground"
          >
            <p className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase opacity-70">
              Protocol v3.0
            </p>
            <div className="w-12 h-px bg-border opacity-50" />
            <p className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase opacity-70">
              Active
            </p>
          </motion.div>

          {/* Action Grid - Slower reveals */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 2, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-12"
          >
            {[
              { to: "/clubs/create", icon: Users, label: "Create", sub: "Start a movement" },
              { to: "/clubs", icon: Hash, label: "Join", sub: "Find your tribe" },
              { to: "/events/create", icon: Zap, label: "Instant", sub: "Launch event" }
            ].map((item, i) => (
              <Link key={item.label} to={item.to} className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl p-8 hover:bg-white/10 transition-all duration-1000">
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-1000 absolute top-0 right-0">0{i + 1}</span>
                  <item.icon className="w-6 h-6 text-foreground/50 group-hover:text-foreground transition-colors duration-700" />
                  <span className="text-lg text-foreground/80 group-hover:text-foreground uppercase tracking-widest transition-colors duration-700 font-bold">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-0 group-hover:opacity-60 transition-opacity duration-700 transform translate-y-2 group-hover:translate-y-0">{item.sub}</span>
                </div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: DATA MANIFESTO */}
      <section className="sticky top-0 min-h-screen w-full flex flex-col justify-center z-10 rounded-t-[3rem] -mt-12 overflow-hidden shadow-2xl glass border-t border-white/20">
        <div className="absolute top-12 left-12 font-mono text-xs md:text-sm tracking-widest text-muted-foreground opacity-50">
          N°002_DATA // MANIFESTO
        </div>

        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-20 items-center py-20">
          <div className="space-y-12 pl-6 md:pl-12">
            <h2 className="text-7xl md:text-9xl leading-[0.85] tracking-tighter text-foreground opacity-90">
              ZERO<br />NOISE.
            </h2>
            <div className="space-y-8 font-mono text-sm border-l border-foreground/10 pl-8 text-muted-foreground">
              <p className="uppercase tracking-[0.2em] opacity-40">System Architecture</p>
              <div className="space-y-4">
                <p className="flex items-center gap-4 group">
                  <span className="opacity-30">01</span>
                  <span className="group-hover:text-foreground transition-colors duration-700">Algorithm: DISABLED</span>
                </p>
                <p className="flex items-center gap-4 group">
                  <span className="opacity-30">02</span>
                  <span className="group-hover:text-foreground transition-colors duration-700">Tracking: BLOCKED</span>
                </p>
                <p className="flex items-center gap-4 group">
                  <span className="opacity-30">03</span>
                  <span className="group-hover:text-foreground transition-colors duration-700">Connection: ENCRYPTED</span>
                </p>
              </div>
            </div>
          </div>

          <div className="relative pr-6 md:pr-12">
            <div className="relative border border-white/10 rounded-[2rem] p-16 bg-white/5 backdrop-blur-3xl flex flex-col items-center text-center gap-8 hover:scale-[1.01] transition-transform duration-[1500ms] shadow-2xl">
              <Shield className="w-16 h-16 stroke-[0.5] text-foreground opacity-80" />
              <h3 className="text-3xl text-foreground font-light tracking-wide">Immutable Record</h3>
              <p className="font-mono text-xs max-w-xs text-muted-foreground leading-loose tracking-wide">
                Every interaction cryptographically verified. Your history is permanent, private, and yours alone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ACCESS */}
      <section className="sticky top-0 h-screen w-full flex flex-col justify-center z-20 rounded-t-[3rem] -mt-12 overflow-hidden shadow-2xl glass-dark border-t border-white/10 text-white">
        <div className="absolute top-12 left-12 font-mono text-xs md:text-sm tracking-widest text-white/30">
          N°003_ACCESS // INITIALIZE
        </div>

        <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
          <h2 className="text-6xl md:text-8xl mb-20 opacity-90 tracking-tighter">
            INITIALIZE_
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/signup" className="group h-64 flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/5 p-10 hover:bg-white hover:text-black transition-all duration-700 ease-out backdrop-blur-md">
              <span className="font-mono text-xs uppercase tracking-[0.5em] opacity-40 self-start">Cmd_01</span>
              <div className="flex items-center justify-between w-full">
                <span className="text-4xl font-bold tracking-tight">REGISTER</span>
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 duration-700" />
              </div>
            </Link>
            <Link to="/login" className="group h-64 flex flex-col justify-between rounded-[2rem] border border-white/5 p-10 hover:border-white/20 hover:bg-white/5 transition-all duration-700 ease-out backdrop-blur-md">
              <span className="font-mono text-xs uppercase tracking-[0.5em] opacity-40 self-start">Cmd_02</span>
              <div className="flex items-center justify-between w-full">
                <span className="text-4xl font-bold tracking-tight text-white/50 group-hover:text-white transition-colors duration-700">LOGIN</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-[20vh]" />

    </Layout>
  );
};

export default Index;
