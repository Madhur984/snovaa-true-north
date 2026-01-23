import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { ArrowRight, Users, Zap, CheckCircle, Shield } from "lucide-react";

const EventConstellationScene = lazy(() => import("@/components/3d/EventConstellationScene").then(m => ({ default: m.EventConstellationScene })));

const Index = () => {

  return (
    <Layout showHeader={false}>
      {/* SECTION 1: HERO - Creates the Base Layer (z-0) */}
      <section className="sticky top-0 h-screen w-full bg-brand-light flex flex-col justify-center overflow-hidden z-0">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-brand-primary blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-cta blur-[120px]" />
        </div>

        <div className="container relative z-10 mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

          <div className="space-y-8">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-display text-8xl md:text-9xl text-brand-dark leading-[0.9] tracking-tighter"
            >
              TRULY<br />
              <span className="text-brand-primary">GATHER.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl md:text-2xl font-sans text-brand-dark/70 max-w-lg leading-relaxed"
            >
              The social platform for real life. verified attendance, permanent recognition, and absolutely no algorithmic feeds.
            </motion.p>

            {/* ACTION CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
              {/* Create Club */}
              <Link to="/clubs/create" className="group">
                <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-brand-primary/10 h-full">
                  <div className="bg-brand-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                    <Users className="w-6 h-6 text-brand-primary group-hover:text-white" />
                  </div>
                  <h3 className="font-display text-2xl text-brand-dark mb-2">Create Club</h3>
                  <p className="text-sm font-sans text-brand-dark/60">Start a verified community.</p>
                </div>
              </Link>

              {/* Join Club */}
              <Link to="/clubs" className="group">
                <div className="bg-brand-primary p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full transform scale-105 ring-4 ring-white/50">
                  <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <ArrowRight className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-2xl text-white mb-2">Join Club</h3>
                  <p className="text-sm font-sans text-white/80">Find your people nearby.</p>
                </div>
              </Link>

              {/* Instant Event */}
              <Link to="/events/create" className="group">
                <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-brand-cta/10 h-full">
                  <div className="bg-brand-cta/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-cta group-hover:text-white transition-colors">
                    <Zap className="w-6 h-6 text-brand-cta group-hover:text-white" />
                  </div>
                  <h3 className="font-display text-2xl text-brand-dark mb-2">Instant Event</h3>
                  <p className="text-sm font-sans text-brand-dark/60">Gather people right now.</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="hidden md:block h-[600px] w-full relative">
            <Suspense fallback={null}>
              <EventConstellationScene />
            </Suspense>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
          <span className="font-display text-brand-dark/40 text-sm tracking-widest">SCROLL TO DISCOVER</span>
          <div className="w-px h-12 bg-brand-dark/20 mt-2" />
        </div>
      </section>

      {/* SECTION 2: SPONSORS - Slides Over (z-10) */}
      <section className="sticky top-0 h-screen w-full bg-brand-primary text-white flex flex-col justify-center z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block bg-white/10 px-4 py-2 rounded-full mb-6 backdrop-blur-md border border-white/20">
              <span className="font-sans text-sm tracking-widest uppercase">Support the Mission</span>
            </div>
            <h2 className="font-display text-7xl md:text-9xl mb-12">OUR SPONSORS</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-80">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/5 h-32 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                  <span className="font-display text-3xl">LOGO {i}</span>
                </div>
              ))}
            </div>

            <div className="mt-16">
              <button className="bg-white text-brand-primary px-10 py-4 rounded-full font-display text-2xl hover:bg-brand-cta hover:text-white transition-colors duration-300">
                Become a Sponsor
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: PHILOSOPHY & AUTH - Slides Over (z-20) */}
      <section className="sticky top-0 h-screen w-full bg-brand-dark text-white flex flex-col justify-center z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">

          <div className="space-y-12">
            <h2 className="font-display text-6xl md:text-8xl leading-none">
              NO FEEDS.<br />
              <span className="text-brand-cta">JUST TRUTH.</span>
            </h2>

            <div className="space-y-6">
              {[
                { title: "Immutable Records", desc: "Every check-in is verified and permanently stored." },
                { title: "Zero Ads", desc: "You are the member, not the product." },
                { title: "Real connection", desc: "We optimize for offline time, not screen time." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1 bg-brand-cta/20 p-2 rounded-lg h-10 w-10 flex items-center justify-center">
                    <CheckCircle className="text-brand-cta w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-display text-2xl">{item.title}</h4>
                    <p className="font-sans text-white/60">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-12 rounded-3xl border border-white/10 text-center space-y-8">
            <Shield className="w-16 h-16 text-brand-cta mx-auto" />
            <div>
              <h3 className="font-display text-4xl mb-4">Start Your Journey</h3>
              <p className="font-sans text-lg text-white/60">
                Create your verified identity today. Join thousands of real people gathering in the real world.
              </p>
            </div>

            <div className="space-y-4">
              <Link to="/signup" className="block w-full bg-brand-cta hover:bg-brand-cta/90 text-white font-display text-2xl py-4 rounded-xl transition-colors">
                Create Account
              </Link>
              <Link to="/login" className="block w-full bg-brand-primary/20 hover:bg-brand-primary/30 text-white font-display text-2xl py-4 rounded-xl transition-colors border border-brand-primary/30">
                Sign In
              </Link>
            </div>

            <p className="text-xs font-sans text-white/30">
              By joining, you agree to our No-Algorithm Policy.
            </p>
          </div>

        </div>
      </section>

      {/* FINAL SPACER to ensure last section scrolls fully */}
      <div className="h-[50vh] bg-brand-dark" />

    </Layout>
  );
};

export default Index;
