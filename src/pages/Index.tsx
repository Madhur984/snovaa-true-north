import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { ArrowRight, Users, Zap, CheckCircle, Shield } from "lucide-react";

const EventConstellationScene = lazy(() => import("@/components/3d/EventConstellationScene").then(m => ({ default: m.EventConstellationScene })));

const Index = () => {

  return (
    <Layout showHeader={false}>
      {/* SECTION 1: MINIMALIST HERO (B&W) */}
      <section className="sticky top-0 h-screen w-full bg-brand-dark text-white flex flex-col justify-center items-center overflow-hidden z-0">

        {/* Subtle Constellation Background (Low Opacity) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Suspense fallback={null}>
            <EventConstellationScene />
          </Suspense>
        </div>

        <div className="relative z-10 text-center space-y-12 max-w-4xl px-6">
          <motion.h1
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[12vw] md:text-[14vw] leading-[0.8] tracking-tighter"
          >
            snovaa
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <p className="text-xl md:text-2xl font-sans font-light text-white/60 tracking-widest uppercase">
              Truly Gather.
            </p>
            <div className="h-16 w-px bg-white/20" />
          </motion.div>

          {/* Minimalist Action Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/20 border border-white/20 overflow-hidden"
          >
            {/* Create Club */}
            <Link to="/clubs/create" className="group bg-black/50 p-8 backdrop-blur-sm hover:bg-white/5 transition-colors duration-500">
              <div className="flex flex-col items-center gap-4">
                <Users className="w-6 h-6 text-white/80 group-hover:text-white transition-colors" />
                <span className="font-display text-2xl text-white group-hover:tracking-wider transition-all duration-300">Create</span>
              </div>
            </Link>

            {/* Join Club */}
            <Link to="/clubs" className="group bg-white p-8 hover:bg-white/90 transition-colors duration-500">
              <div className="flex flex-col items-center gap-4">
                <ArrowRight className="w-6 h-6 text-black group-hover:translate-x-1 transition-transform" />
                <span className="font-display text-2xl text-black">Join</span>
              </div>
            </Link>

            {/* Instant Event */}
            <Link to="/events/create" className="group bg-black/50 p-8 backdrop-blur-sm hover:bg-white/5 transition-colors duration-500">
              <div className="flex flex-col items-center gap-4">
                <Zap className="w-6 h-6 text-white/80 group-hover:text-white transition-colors" />
                <span className="font-display text-2xl text-white group-hover:tracking-wider transition-all duration-300">Instant</span>
              </div>
            </Link>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-pulse">
          <span className="font-display text-xs text-white/40 tracking-[0.3em]">SCROLL</span>
        </div>
      </section>

      {/* SECTION 2: MANIFESTO (White on Black -> Inverted check) */}
      <section className="sticky top-0 h-screen w-full bg-brand-secondary text-white flex flex-col justify-center z-10">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-12">
            <div className="w-12 h-1 bg-white" />
            <h2 className="font-display text-6xl md:text-8xl leading-none">
              NO<br />ALGORITHM.
            </h2>
            <p className="font-sans text-xl font-light text-white/60 leading-relaxed max-w-md">
              We removed the feed. We removed the metrics. We kept the human connection.
            </p>
            <div className="grid grid-cols-1 gap-8 border-t border-white/10 pt-8">
              {[
                { title: "Verifiable", desc: "Proof of attendance on chain." },
                { title: "Immutable", desc: "History that cannot be edited." },
                { title: "Private", desc: "Your data is yours alone." }
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <span className="font-display text-2xl">{item.title}</span>
                  <span className="font-sans text-sm text-white/40">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-full flex items-center justify-center">
            <div className="w-[80%] aspect-[3/4] border border-white/20 p-2 rotated-card">
              <div className="w-full h-full bg-white/5 backdrop-blur-md flex items-center justify-center">
                <Shield className="w-32 h-32 text-white/20" strokeWidth={0.5} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: AUTH (Strict B&W) */}
      <section className="sticky top-0 h-screen w-full bg-white text-black flex flex-col justify-center z-20">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <h2 className="font-display text-7xl md:text-9xl mb-8 tracking-tighter">
            BEGIN.
          </h2>
          <p className="font-sans text-xl text-black/60 mb-16 max-w-xl mx-auto">
            Join the network of verified humans. Real world gathering, permanently recorded.
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link to="/signup" className="group relative overflow-hidden bg-black text-white px-12 py-6 font-display text-2xl transition-all hover:px-14">
              <span className="relative z-10">Create Account</span>
            </Link>
            <Link to="/login" className="group relative overflow-hidden border border-black text-black px-12 py-6 font-display text-2xl transition-all hover:bg-black hover:text-white">
              <span className="relative z-10">Sign In</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-[50vh] bg-white" />

    </Layout>
  );
};

export default Index;
