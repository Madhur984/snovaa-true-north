import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { ArrowRight, Users, Zap, Hash, Shield, Terminal } from "lucide-react";

const EventConstellationScene = lazy(() => import("@/components/3d/EventConstellationScene").then(m => ({ default: m.EventConstellationScene })));

const Index = () => {

  return (
    <Layout showHeader={false}>
      {/* SECTION 1: CYBER HERO - Fully Transparent for 3D Bots */}
      <section className="sticky top-0 h-screen w-full flex flex-col justify-center items-center overflow-hidden z-0">

        {/* Soft Contrast Gradient to ensure text pop */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/50 pointer-events-none" />

        <div className="relative z-10 text-center space-y-12 max-w-5xl px-6">
          <motion.img
            src="/snovaa-logo.png"
            alt="SNOVAA Logo"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="w-24 h-24 md:w-32 md:h-32 dark:invert mx-auto mb-[-2rem] relative z-20 drop-shadow-2xl"
          />
          <div className="relative">
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-[15vw] leading-[0.8] tracking-tighter relative z-10 select-none text-foreground mix-blend-overlay"
            >
              snovaa
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1.2 }}
            className="flex items-center justify-center gap-4 text-muted-foreground"
          >
            <Terminal className="w-5 h-5" />
            <p className="font-mono text-sm md:text-lg tracking-widest uppercase">
              Protocol <span className="text-foreground">v3.0</span>
            </p>
            <div className="w-12 h-px bg-border" />
            <p className="font-mono text-sm md:text-lg tracking-widest uppercase">
              Systems Nominal
            </p>
          </motion.div>

          {/* Action Grid - Glass Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 1.0, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
          >
            {[
              { to: "/clubs/create", icon: Users, label: "Create", delay: 0 },
              { to: "/clubs", icon: Hash, label: "Join", delay: 0.1 },
              { to: "/events/create", icon: Zap, label: "Instant", delay: 0.2 }
            ].map((item) => (
              <Link key={item.label} to={item.to} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 hover:bg-white/10 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <item.icon className="w-8 h-8 text-foreground/70 group-hover:text-foreground transition-colors" />
                  <span className="text-xl text-foreground/80 group-hover:text-foreground uppercase tracking-widest transition-colors font-bold">{item.label}</span>
                </div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: DATA MANIFESTO - Glass Panel */}
      <section className="sticky top-0 min-h-screen w-full flex flex-col justify-center z-10 rounded-t-[3rem] -mt-12 overflow-hidden shadow-2xl glass border-t border-white/20">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-20 items-center py-20">
          <div className="space-y-12 pl-6 md:pl-12">
            <h2 className="text-7xl md:text-9xl leading-[0.85] tracking-tighter text-foreground">
              ZERO<br />NOISE.
            </h2>
            <div className="space-y-6 font-mono text-sm border-l-2 border-foreground/20 pl-6 text-muted-foreground">
              <p className="uppercase tracking-widest opacity-60">System Architecture</p>
              <p className="flex items-center gap-2">&gt; Algorithm: <span className="bg-foreground/5 rounded-md px-2 py-0.5 text-foreground">DISABLED</span></p>
              <p className="flex items-center gap-2">&gt; Tracking: <span className="bg-foreground/5 rounded-md px-2 py-0.5 text-foreground">BLOCKED</span></p>
              <p className="flex items-center gap-2">&gt; Connection: <span className="bg-foreground/5 rounded-md px-2 py-0.5 text-foreground">ENCRYPTED</span></p>
            </div>
          </div>

          <div className="relative pr-6 md:pr-12">
            <div className="relative border border-white/20 rounded-[3rem] p-12 bg-white/5 backdrop-blur-3xl flex flex-col items-center text-center gap-8 hover:scale-[1.02] transition-transform duration-1000 shadow-2xl">
              <Shield className="w-20 h-20 stroke-1 text-foreground" />
              <h3 className="text-4xl text-foreground">Immutable Record</h3>
              <p className="font-mono text-sm max-w-xs text-muted-foreground leading-relaxed">
                Every interaction cryptographically verified. Your history is permanent, private, and yours alone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ACCESS - Glass Overlay */}
      <section className="sticky top-0 h-screen w-full flex flex-col justify-center z-20 rounded-t-[3rem] -mt-12 overflow-hidden shadow-2xl glass-dark border-t border-white/10 text-white">
        <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
          <h2 className="text-6xl md:text-8xl mb-12 opacity-90 tracking-tighter">
            INITIALIZE_
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/signup" className="group rounded-[2rem] border border-white/20 bg-white/5 p-10 hover:bg-white hover:text-black transition-all duration-500 ease-out backdrop-blur-md">
              <div className="flex flex-col items-center gap-4">
                <span className="font-mono text-xs uppercase tracking-[0.5em] opacity-60 group-hover:opacity-100 transition-opacity">Command 01</span>
                <span className="text-4xl font-bold">REGISTER</span>
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-500" />
              </div>
            </Link>
            <Link to="/login" className="group rounded-[2rem] border border-white/10 p-10 hover:border-white/30 hover:bg-white/5 transition-all duration-500 ease-out backdrop-blur-md">
              <div className="flex flex-col items-center gap-4">
                <span className="font-mono text-xs uppercase tracking-[0.5em] text-white/40">Command 02</span>
                <span className="text-4xl text-white/70 group-hover:text-white transition-colors font-bold">LOGIN</span>
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
