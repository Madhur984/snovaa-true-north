import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroBackground } from "@/components/ui/HeroBackground";
import { Users, Calendar, MapPin, TrendingUp, BarChart3, Shield } from "lucide-react";
import { format } from "date-fns";
import { fadeUp, fadeOnly, statsContainer, statCard, scrollViewport } from "@/lib/motion";
import sponsorHero from "@/assets/sponsor-hero.jpg";

interface EventAnalytics {
  event_id: string;
  title: string;
  event_date: string;
  status: string;
  city_name: string | null;
  country: string | null;
  club_name: string | null;
  club_category: string | null;
  registered_count: number;
  confirmed_count: number;
  attended_count: number;
}

interface SponsorAccess {
  id: string;
  sponsor_name: string;
  permissions: {
    view_attendance: boolean;
    view_demographics: boolean;
  };
  event: {
    id: string;
    title: string;
    event_date: string;
    city: { name: string; country: string } | null;
  };
}

const SponsorDashboard = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [access, setAccess] = useState<SponsorAccess | null>(null);
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      validateAccess();
    } else {
      setError("No access token provided");
      setLoading(false);
    }
  }, [token]);

  const validateAccess = async () => {
    // Verify the sponsor access token
    const { data: accessData, error: accessError } = await supabase
      .from("sponsor_access")
      .select("*, event:events(id, title, event_date, city:cities(name, country))")
      .eq("access_token", token)
      .maybeSingle();

    if (accessError || !accessData) {
      setError("Invalid or expired access token");
      setLoading(false);
      return;
    }

    // Check expiration
    if (accessData.expires_at && new Date(accessData.expires_at) < new Date()) {
      setError("This access link has expired");
      setLoading(false);
      return;
    }

    setAccess(accessData as unknown as SponsorAccess);

    // Fetch analytics for this event
    const { data: participationData } = await supabase
      .from("participation_ledger")
      .select("action")
      .eq("event_id", accessData.event_id);

    if (participationData) {
      // Calculate stats
      const stats = {
        registered: new Set(participationData.filter(p => p.action === "registered").map((_, i) => i)).size,
        confirmed: participationData.filter(p => p.action === "confirmed").length,
        attended: participationData.filter(p => p.action === "attended").length,
      };

      setAnalytics({
        event_id: accessData.event_id,
        title: accessData.event.title,
        event_date: accessData.event.event_date,
        status: "published",
        city_name: accessData.event.city?.name || null,
        country: accessData.event.city?.country || null,
        club_name: null,
        club_category: null,
        registered_count: stats.registered,
        confirmed_count: stats.confirmed,
        attended_count: stats.attended,
      });
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-6xl py-12">
          <motion.div
            variants={fadeOnly}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <motion.div
          className="container max-w-6xl py-12 text-center"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" strokeWidth={1} />
          <h1 className="font-serif text-2xl font-light text-display mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6 font-light">{error}</p>
          <Button asChild variant="outline">
            <Link to="/">Go Home</Link>
          </Button>
        </motion.div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Full-page background with vignette */}
      <HeroBackground
        image={sponsorHero}
        speed={0.2}
        opacity={60}
        grayscale={20}
        vignette
      />

      <div className="container max-w-6xl py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-4 print:hidden">
              Sponsor View
            </Badge>
            <h1 className="font-serif text-3xl font-medium text-display mb-2 print:text-4xl">
              {access?.event.title}
            </h1>
            <p className="text-body print:hidden">
              Welcome, {access?.sponsor_name}. Here's the verified participation data for this event.
            </p>
            <p className="hidden print:block text-muted-foreground mt-2">
              Official Participation Report prepared for {access?.sponsor_name}
            </p>
          </div>
          <Button onClick={() => window.print()} variant="outline" className="print:hidden gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M6 9V2h12v7" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <path d="M6 14h12v8H6z" />
            </svg>
            Export / Print Report
          </Button>
        </div>

        {/* Event Info */}
        <Card className="mb-8 print:shadow-none print:border-none">
          <CardHeader className="print:hidden">
            <CardTitle className="font-serif">Event Details</CardTitle>
          </CardHeader>
          <CardContent className="print:p-0">
            <div className="flex flex-wrap gap-6 print:grid print:grid-cols-2">
              <div className="flex items-center gap-2 text-muted-foreground print:text-black">
                <Calendar className="w-4 h-4" />
                {access?.event.event_date &&
                  format(new Date(access.event.event_date), "MMMM d, yyyy")}
              </div>
              {access?.event.city && (
                <div className="flex items-center gap-2 text-muted-foreground print:text-black">
                  <MapPin className="w-4 h-4" />
                  {access.event.city.name}, {access.event.city.country}
                </div>
              )}
            </div>
            <div className="hidden print:block mt-6 border-t pt-4">
              <p className="text-sm text-muted-foreground">Generated on {format(new Date(), "PPpp")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8 print:grid-cols-3 print:gap-4">
          <Card className="print:shadow-none print:border-black">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Registered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-serif font-medium text-display">
                {analytics?.registered_count || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Total sign-ups</p>
            </CardContent>
          </Card>

          <Card className="print:shadow-none print:border-black">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Confirmed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-serif font-medium text-display">
                {analytics?.confirmed_count || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Confirmed attendance</p>
            </CardContent>
          </Card>

          <Card className="border-primary print:border-black print:shadow-none">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-primary print:text-black">
                <BarChart3 className="w-4 h-4" />
                Attended
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-serif font-medium text-primary print:text-black">
                {analytics?.attended_count || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Verified attendance</p>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Rate */}
        <Card className="mb-8 print:shadow-none print:break-inside-avoid">
          <CardHeader>
            <CardTitle className="font-serif">Conversion Metrics</CardTitle>
            <CardDescription>
              Verified metrics from the immutable participation ledger
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 print:gap-8">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Registration → Attendance Rate</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-serif font-medium text-display">
                    {analytics?.registered_count
                      ? Math.round(
                        ((analytics?.attended_count || 0) / analytics.registered_count) * 100
                      )
                      : 0}
                    %
                  </span>
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden print:border print:border-gray-300">
                  <div
                    className="h-full bg-primary rounded-full transition-all print:bg-black"
                    style={{
                      width: `${analytics?.registered_count
                        ? ((analytics?.attended_count || 0) / analytics.registered_count) * 100
                        : 0
                        }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Confirmation → Attendance Rate</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-serif font-medium text-display">
                    {analytics?.confirmed_count
                      ? Math.round(
                        ((analytics?.attended_count || 0) / analytics.confirmed_count) * 100
                      )
                      : 0}
                    %
                  </span>
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden print:border print:border-gray-300">
                  <div
                    className="h-full bg-primary rounded-full transition-all print:bg-black"
                    style={{
                      width: `${analytics?.confirmed_count
                        ? ((analytics?.attended_count || 0) / analytics.confirmed_count) * 100
                        : 0
                        }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Integrity Notice */}
        <Card className="bg-accent/30 border-accent print:border-2 print:border-black print:bg-transparent print:break-inside-avoid">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-primary flex-shrink-0 print:text-black" />
              <div>
                <h3 className="font-serif font-medium text-display mb-1 print:uppercase print:tracking-widest">
                  Verified Participation Data
                </h3>
                <p className="text-sm text-body print:text-justify">
                  All participation data is recorded in SNOVAA's immutable ledger. Records cannot be
                  edited or deleted, ensuring complete accuracy and accountability. This data
                  represents actual verified attendance, not self-reported metrics.
                </p>
                <div className="hidden print:block mt-8 border-t-2 border-black w-48 pt-2">
                  <p className="text-xs font-medium uppercase">Authorized Signature</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout >
  );
};

export default SponsorDashboard;
