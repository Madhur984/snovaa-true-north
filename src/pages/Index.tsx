import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { ArrowRight, Users, Zap, Hash, Shield, Terminal } from "lucide-react";

const EventConstellationScene = lazy(() => import("@/components/3d/EventConstellationScene").then(m => ({ default: m.EventConstellationScene })));

const Index = () => {

  return (
    <Layout showHeader={false}>
      {/* SECTION 1: CYBER HERO - Softened */}
      <section className="sticky top-0 h-screen w-full bg-black text-white flex flex-col justify-center items-center overflow-hidden z-0 border-b border-white/10">

        {/* Soft Cyber Grid Background with Radial Mask */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 text-center space-y-12 max-w-5xl px-6">
          <motion.img
            src="/snovaa-logo.png"
            alt="SNOVAA Logo"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="w-24 h-24 md:w-32 md:h-32 invert mix-blend-difference mx-auto mb-[-2rem] relative z-20"
          />
          <div className="relative">
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }} // Slower duration
              className="font-display text-[15vw] leading-[0.8] tracking-tighter mix-blend-difference relative z-10 select-none animate-glitch"
            >
              snovaa
            </motion.h1>
            {/* Glitch layers reduced opacity/speed if needed via CSS, here keeping layout but could adjust class if needed */}
            <div className="absolute top-0 left-0 w-full h-full text-[15vw] leading-[0.8] tracking-tighter text-white/5 blur-sm select-none">snovaa</div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1.2 }}
            className="flex items-center justify-center gap-4"
          >
            <Terminal className="w-5 h-5 text-white/40" />
            <p className="font-mono text-sm md:text-lg text-white/60 tracking-widest uppercase">
              Protocol <span className="text-white/80">v2.1</span>
            </p>
            <div className="w-12 h-px bg-white/20" />
            <p className="font-mono text-sm md:text-lg text-white/60 tracking-widest uppercase">
              Network Active
            </p>
          </motion.div>

          {/* Softened Action Grid - Rounded & Faded Borders */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 1.0, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 bg-transparent"
          >
            {/* Create Club */}
            <Link to="/clubs/create" className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-8 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-700 ease-in-out relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <Users className="w-8 h-8 text-white/70 group-hover:text-white transition-colors duration-500" />
                <span className="font-display text-xl text-white/80 group-hover:text-white uppercase tracking-widest transition-colors duration-500">Create</span>
              </div>
            </Link>

            {/* Join Club */}
            <Link to="/clubs" className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-8 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-700 ease-in-out relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <Hash className="w-8 h-8 text-white/70 group-hover:text-white transition-colors duration-500" />
                <span className="font-display text-xl text-white/80 group-hover:text-white uppercase tracking-widest transition-colors duration-500">Join</span>
              </div>
            </Link>

            {/* Instant Event */}
            <Link to="/events/create" className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-8 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-700 ease-in-out relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <Zap className="w-8 h-8 text-white/70 group-hover:text-white transition-colors duration-500" />
                <span className="font-display text-xl text-white/80 group-hover:text-white uppercase tracking-widest transition-colors duration-500">Instant</span>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: DATA MANIFESTO - Rounded Cards */}
      <section className="sticky top-0 h-screen w-full bg-white text-black flex flex-col justify-center z-10 rounded-t-[3rem] -mt-12 overflow-hidden shadow-[0_-20px_40px_rgba(0,0,0,0.2)]">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-12 pl-6 md:pl-12">
            <h2 className="font-display text-7xl md:text-9xl leading-[0.85] tracking-tighter opacity-90">
              ZERO<br />NOISE.
            </h2>
            <div className="space-y-6 font-mono text-sm border-l-2 border-black/10 pl-6">
              <p className="uppercase tracking-widest text-black/40">System Architecture</p>
              <p className="flex items-center gap-2">&gt; Algorithm: <span className="bg-black/5 rounded-md px-2 py-0.5 text-black/70">DISABLED</span></p>
              <p className="flex items-center gap-2">&gt; Tracking: <span className="bg-black/5 rounded-md px-2 py-0.5 text-black/70">BLOCKED</span></p>
              <p className="flex items-center gap-2">&gt; Connection: <span className="bg-black/5 rounded-md px-2 py-0.5 text-black/70">ENCRYPTED</span></p>
            </div>
          </div>

          <div className="relative pr-6 md:pr-12">
            <div className="absolute inset-0 bg-black/5 rounded-full animate-cyber-pulse blur-3xl" />
            <div className="relative border border-black/10 rounded-[3rem] p-12 bg-white/50 backdrop-blur-xl flex flex-col items-center text-center gap-8 hover:scale-[1.02] transition-transform duration-1000 shadow-xl shadow-black/5">
              <Shield className="w-20 h-20 stroke-1 text-black/80" />
              <h3 className="font-display text-4xl">Immutable Record</h3>
              <p className="font-mono text-sm max-w-xs text-black/60 leading-relaxed">
                Every interaction cryptographically verified. Your history is permanent, private, and yours alone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ACCESS - Curved Entry */}
      <section className="sticky top-0 h-screen w-full bg-black text-white flex flex-col justify-center z-20 rounded-t-[3rem] -mt-12 overflow-hidden shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-black to-black opacity-50" />

        <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
          <h2 className="font-display text-6xl md:text-8xl mb-12 opacity-90">
            INITIALIZE_
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/signup" className="group rounded-[2rem] border border-white/20 bg-white/5 p-10 hover:bg-white hover:text-black transition-all duration-500 ease-out">
              <div className="flex flex-col items-center gap-4">
                <span className="font-mono text-xs uppercase tracking-[0.5em] opacity-60 group-hover:opacity-100 transition-opacity">Command 01</span>
                <span className="font-display text-4xl">REGISTER</span>
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-500" />
              </div>
            </Link>
            <Link to="/login" className="group rounded-[2rem] border border-white/10 p-10 hover:border-white/30 hover:bg-white/5 transition-all duration-500 ease-out">
              <div className="flex flex-col items-center gap-4">
                <span className="font-mono text-xs uppercase tracking-[0.5em] text-white/40">Command 02</span>
                <span className="font-display text-4xl text-white/70 group-hover:text-white transition-colors">LOGIN</span>
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
