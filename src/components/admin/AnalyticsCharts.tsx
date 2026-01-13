import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { TrendingUp, PieChartIcon, BarChart3 } from "lucide-react";

interface EventsByStatus {
  status: string;
  count: number;
}

interface EventsByDay {
  date: string;
  events: number;
  registrations: number;
}

interface CategoryBreakdown {
  category: string;
  count: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--muted))",
  "hsl(var(--destructive))",
];

export const AnalyticsCharts = () => {
  const [eventsByStatus, setEventsByStatus] = useState<EventsByStatus[]>([]);
  const [eventsByDay, setEventsByDay] = useState<EventsByDay[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);

    // Fetch events by status
    const { data: events } = await supabase.from("events").select("status, created_at");

    if (events) {
      const statusCounts: Record<string, number> = {};
      events.forEach((e) => {
        statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
      });
      setEventsByStatus(
        Object.entries(statusCounts).map(([status, count]) => ({ status, count }))
      );

      // Events created in last 14 days
      const last14Days: EventsByDay[] = [];
      for (let i = 13; i >= 0; i--) {
        const day = startOfDay(subDays(new Date(), i));
        const dayStr = format(day, "yyyy-MM-dd");
        const displayDate = format(day, "MMM d");
        const eventsOnDay = events.filter(
          (e) => format(new Date(e.created_at), "yyyy-MM-dd") === dayStr
        ).length;
        last14Days.push({ date: displayDate, events: eventsOnDay, registrations: 0 });
      }
      setEventsByDay(last14Days);
    }

    // Fetch participation counts for last 14 days
    const { data: ledger } = await supabase
      .from("participation_ledger")
      .select("recorded_at, action")
      .gte("recorded_at", subDays(new Date(), 14).toISOString());

    if (ledger) {
      setEventsByDay((prev) =>
        prev.map((day) => {
          const regsOnDay = ledger.filter(
            (l) =>
              format(new Date(l.recorded_at), "MMM d") === day.date &&
              l.action === "registered"
          ).length;
          return { ...day, registrations: regsOnDay };
        })
      );
    }

    // Fetch club categories
    const { data: clubs } = await supabase.from("clubs").select("category");

    if (clubs) {
      const categoryCounts: Record<string, number> = {};
      clubs.forEach((c) => {
        categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
      });
      setCategoryBreakdown(
        Object.entries(categoryCounts)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      );
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="py-8">
              <div className="h-48 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const chartConfig = {
    events: { label: "Events", color: "hsl(var(--primary))" },
    registrations: { label: "Registrations", color: "hsl(var(--secondary))" },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Activity Over Time */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Platform Activity (Last 14 Days)
          </CardTitle>
          <CardDescription>Events created and registrations over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <LineChart data={eventsByDay}>
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="events"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="registrations"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Events by Status */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Events by Status
          </CardTitle>
          <CardDescription>Distribution of event statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ status, count }) => `${status}: ${count}`}
                  labelLine={false}
                >
                  {eventsByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {eventsByStatus.map((item, index) => (
              <div key={item.status} className="flex items-center gap-1.5 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="capitalize">{item.status}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Club Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Top Club Categories
          </CardTitle>
          <CardDescription>Most popular club types</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ count: { label: "Clubs", color: "hsl(var(--primary))" } }} className="h-[200px] w-full">
            <BarChart data={categoryBreakdown} layout="vertical">
              <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="category"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
