import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Users } from "lucide-react";

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
    // Get all cities with their event counts
    const { data: cities } = await supabase
      .from("cities")
      .select("id, name, country");

    if (!cities) {
      setLoading(false);
      return;
    }

    // Get event counts per city
    const { data: events } = await supabase
      .from("events")
      .select("city_id")
      .in("status", ["published", "completed"]);

    // Get participation counts per event
    const { data: participation } = await supabase
      .from("participation_ledger")
      .select("event_id, action");

    // Calculate stats
    const eventCountByCity: Record<string, number> = {};
    const participationByCity: Record<string, number> = {};

    events?.forEach((event) => {
      if (event.city_id) {
        eventCountByCity[event.city_id] = (eventCountByCity[event.city_id] || 0) + 1;
      }
    });

    // Count unique attended participants per city
    const attendedByEvent: Record<string, Set<string>> = {};
    participation?.filter(p => p.action === "attended").forEach((p) => {
      if (!attendedByEvent[p.event_id]) {
        attendedByEvent[p.event_id] = new Set();
      }
      attendedByEvent[p.event_id].add(p.event_id);
    });

    // Map events to cities for participation
    events?.forEach((event) => {
      if (event.city_id && attendedByEvent[event.city_id]) {
        participationByCity[event.city_id] = (participationByCity[event.city_id] || 0) + 
          attendedByEvent[event.city_id].size;
      }
    });

    const stats: CityStats[] = cities.map((city) => ({
      id: city.id,
      name: city.name,
      country: city.country,
      event_count: eventCountByCity[city.id] || 0,
      total_participation: participationByCity[city.id] || 0,
    }));

    // Sort by event count
    stats.sort((a, b) => b.event_count - a.event_count);

    setCityStats(stats);
    setTotalEvents(events?.length || 0);
    setTotalParticipation(participation?.filter(p => p.action === "attended").length || 0);
    setLoading(false);
  };

  const getIntensity = (count: number, max: number): string => {
    if (max === 0) return "bg-muted";
    const ratio = count / max;
    if (ratio > 0.7) return "bg-primary";
    if (ratio > 0.4) return "bg-primary/70";
    if (ratio > 0.1) return "bg-primary/40";
    if (ratio > 0) return "bg-primary/20";
    return "bg-muted";
  };

  const maxEvents = Math.max(...cityStats.map(c => c.event_count), 1);

  return (
    <Layout>
      <div className="container max-w-6xl py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-medium text-display mb-3">
            Participation Density Map
          </h1>
          <p className="text-body text-lg max-w-2xl">
            City-level view of participation volume. No live tracking, no individual 
            identification—just aggregate truth about where people gather.
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Cities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-3xl font-serif font-medium text-display">
                  {cityStats.length}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Published Events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-3xl font-serif font-medium text-display">
                  {totalEvents}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Attendance Records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-3xl font-serif font-medium text-display">
                  {totalParticipation}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* City Heatmap Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">City Participation Density</CardTitle>
            <CardDescription>
              Visual representation of event activity by city. Darker colors indicate higher volume.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cityStats.map((city) => (
                  <div
                    key={city.id}
                    className={`p-4 rounded-lg transition-all ${getIntensity(city.event_count, maxEvents)}`}
                  >
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <h3 className="font-medium text-primary-foreground text-sm mb-1">
                          {city.name}
                        </h3>
                        <p className="text-xs text-primary-foreground/70">{city.country}</p>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {city.event_count} events
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Legend */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">Density Legend</p>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-muted"></div>
                  <span className="text-xs text-muted-foreground">No events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary/20"></div>
                  <span className="text-xs text-muted-foreground">Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary/40"></div>
                  <span className="text-xs text-muted-foreground">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary/70"></div>
                  <span className="text-xs text-muted-foreground">High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary"></div>
                  <span className="text-xs text-muted-foreground">Very High</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* City List */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="font-serif">City Rankings</CardTitle>
            <CardDescription>Ordered by number of events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cityStats.map((city, index) => (
                <div
                  key={city.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-display">{city.name}</p>
                      <p className="text-sm text-muted-foreground">{city.country}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-display">{city.event_count}</p>
                    <p className="text-sm text-muted-foreground">events</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Map;
