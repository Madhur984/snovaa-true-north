import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, TrendingUp, Users } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { HeroBackground } from "@/components/ui/HeroBackground";
import { fadeUp, statsContainer, statCard, feedContainer, feedItem, scrollViewport } from "@/lib/motion";
import mapHero from "@/assets/map-hero.jpg";

interface CityStats {
  id: string;
  name: string;
  country: string;
  event_count: number;
  total_participation: number;
}

const Map = () => {
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalParticipation, setTotalParticipation] = useState(0);

  useEffect(() => {
    fetchCityStats();
  }, []);

  const fetchCityStats = async () => {
    const { data: cities } = await supabase.from("cities").select("id, name, country");
    if (!cities) { setLoading(false); return; }

    const { data: events } = await supabase.from("events").select("city_id").in("status", ["published", "completed"]);
    const { data: participation } = await supabase.from("participation_ledger").select("event_id, action");

    const eventCountByCity: Record<string, number> = {};
    events?.forEach((event) => {
      if (event.city_id) eventCountByCity[event.city_id] = (eventCountByCity[event.city_id] || 0) + 1;
    });

    const stats: CityStats[] = cities.map((city) => ({
      id: city.id, name: city.name, country: city.country,
      event_count: eventCountByCity[city.id] || 0, total_participation: 0,
    }));

    stats.sort((a, b) => b.event_count - a.event_count);
    setCityStats(stats);
    setTotalEvents(events?.length || 0);
    setTotalParticipation(participation?.filter(p => p.action === "attended").length || 0);
    setLoading(false);
  };

  return (
    <Layout>
      {/* Full-page background with vignette */}
      <HeroBackground 
        image={mapHero} 
        speed={0.2} 
        opacity={65} 
        grayscale={40} 
        overlay="medium"
        vignette
      />

      <div className="container max-w-5xl py-32 relative z-10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
        >
          <p className="text-xs font-sans font-light tracking-luxury uppercase text-subtle mb-8">
            Global Presence
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-display mb-8">
            Participation Density
          </h1>
          <p className="text-lg text-body font-light max-w-xl mb-16">
            City-level view of participation volume. No live tracking—just aggregate truth.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid md:grid-cols-3 gap-px bg-border/30 mb-20"
          variants={statsContainer}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
        >
          {[
            { label: "Cities", value: cityStats.length, icon: MapPin },
            { label: "Events", value: totalEvents, icon: TrendingUp },
            { label: "Attendees", value: totalParticipation, icon: Users },
          ].map((stat) => (
            <motion.div 
              key={stat.label} 
              variants={statCard}
              className="bg-background p-12 text-center"
            >
              <p className="font-serif text-4xl font-light text-display mb-2">{stat.value}</p>
              <p className="text-xs font-sans tracking-luxury uppercase text-subtle">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* City List */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={scrollViewport}
        >
          <GlassCard variant="bordered" className="p-8 md:p-12">
            <h2 className="font-serif text-xl font-light text-display mb-8">City Rankings</h2>
            {loading ? (
              <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted/20 animate-pulse" />)}</div>
            ) : (
              <motion.div 
                className="space-y-0"
                variants={feedContainer}
                initial="hidden"
                animate="visible"
              >
                {cityStats.map((city, index) => (
                  <motion.div 
                    key={city.id} 
                    variants={feedItem}
                    className="flex items-center justify-between py-6 border-t border-border/30 first:border-0"
                  >
                    <div className="flex items-center gap-6">
                      <span className="font-serif text-2xl font-light text-subtle w-12">{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <p className="font-light text-display">{city.name}</p>
                        <p className="text-xs text-subtle">{city.country}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-2xl font-light text-display">{city.event_count}</p>
                      <p className="text-xs text-subtle">events</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Map;
