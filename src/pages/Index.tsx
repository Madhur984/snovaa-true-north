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
      <section className="sticky top-0 h-screen w-full bg-black text-white flex flex-col justify-center items-center overflow-hidden z-0 border-b border-white/20">

        {/* Cyber Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 text-center space-y-12 max-w-5xl px-6">
          <div className="relative">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1, delay: 0.2 }}
              className="font-display text-[15vw] leading-[0.8] tracking-tighter mix-blend-difference relative z-10 select-none animate-glitch"
            >
              snovaa
            </motion.h1>
            <div className="absolute top-0 left-0 w-full h-full text-[15vw] leading-[0.8] tracking-tighter text-red-500 opacity-20 animate-glitch" style={{ animationDelay: '0.1s' }}>snovaa</div>
            <div className="absolute top-0 left-0 w-full h-full text-[15vw] leading-[0.8] tracking-tighter text-cyan-500 opacity-20 animate-glitch" style={{ animationDelay: '-0.1s' }}>snovaa</div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-4"
          >
            <Terminal className="w-5 h-5 text-white/50" />
            <p className="font-mono text-sm md:text-lg text-white/70 tracking-widest uppercase">
              Protocol <span className="text-white">v2.0</span> Initiated
            </p>
            <div className="w-12 h-px bg-white/30" />
            <p className="font-mono text-sm md:text-lg text-white/70 tracking-widest uppercase">
              System Verified
            </p>
          </motion.div>

          {/* Cyber Action Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/20 divide-y md:divide-y-0 md:divide-x divide-white/20 bg-black/80 backdrop-blur-xl"
          >
            {/* Create Club */}
            <Link to="/clubs/create" className="group p-8 hover:bg-white hover:text-black transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <Users className="w-6 h-6" />
                <span className="font-display text-2xl uppercase tracking-widest">Create</span>
              </div>
            </Link>

            {/* Join Club */}
            <Link to="/clubs" className="group p-8 hover:bg-white hover:text-black transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <Hash className="w-6 h-6" />
                <span className="font-display text-2xl uppercase tracking-widest">Join</span>
              </div>
            </Link>

            {/* Instant Event */}
            <Link to="/events/create" className="group p-8 hover:bg-white hover:text-black transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <Zap className="w-6 h-6" />
                <span className="font-display text-2xl uppercase tracking-widest">Instant</span>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: DATA MANIFESTO */}
      <section className="sticky top-0 h-screen w-full bg-white text-black flex flex-col justify-center z-10">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <h2 className="font-display text-7xl md:text-9xl leading-[0.85] tracking-tighter">
              ZERO<br />NOISE.
            </h2>
            <div className="space-y-6 font-mono text-sm border-l-2 border-black pl-6">
              <p className="uppercase tracking-widest text-black/50">System Logs</p>
              <p>&gt; Algorithm: <span className="bg-black text-white px-2">DISABLED</span></p>
              <p>&gt; Tracking: <span className="bg-black text-white px-2">BLOCKED</span></p>
              <p>&gt; Connection: <span className="bg-black text-white px-2">ENCRYPTED</span></p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-black/5 rounded-full animate-cyber-pulse blur-3xl" />
            <div className="relative border-2 border-black p-12 bg-white flex flex-col items-center text-center gap-8 hover:scale-105 transition-transform duration-500">
              <Shield className="w-20 h-20 stroke-1" />
              <h3 className="font-display text-4xl">Immutable Record</h3>
              <p className="font-mono text-sm max-w-xs text-black/60">
                Every interaction cryptographically verified. Your history is permanent and yours alone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ACCESS */}
      <section className="sticky top-0 h-screen w-full bg-black text-white flex flex-col justify-center z-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-black to-black opacity-50" />

        <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
          <h2 className="font-display text-6xl md:text-8xl mb-12 animate-pulse">
            INITIALIZE_
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/signup" className="group border border-white p-8 hover:bg-white hover:text-black transition-colors duration-300">
              <div className="flex flex-col items-center gap-4">
                <span className="font-mono text-xs uppercase tracking-[0.5em]">Command 01</span>
                <span className="font-display text-4xl">REGISTER</span>
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
            <Link to="/login" className="group border border-white/30 p-8 hover:border-white hover:bg-white/5 transition-colors duration-300">
              <div className="flex flex-col items-center gap-4">
                <span className="font-mono text-xs uppercase tracking-[0.5em] text-white/50">Command 02</span>
                <span className="font-display text-4xl text-white/80 group-hover:text-white">LOGIN</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-[20vh] bg-black" />

    </Layout>
  );
};

export default Index;
