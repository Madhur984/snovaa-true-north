import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, MapPin, TrendingUp, BarChart3, Shield } from "lucide-react";
import { format } from "date-fns";
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
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container max-w-6xl py-12 text-center">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-serif text-2xl font-medium text-display mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild variant="outline">
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Background */}
      <div className="fixed inset-0 -z-10">
        <img 
          src={sponsorHero} 
          alt="" 
          className="w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/85 to-background" />
      </div>

      <div className="container max-w-6xl py-12">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-4">
            Sponsor View
          </Badge>
          <h1 className="font-serif text-3xl font-medium text-display mb-2">
            {access?.event.title}
          </h1>
          <p className="text-body">
            Welcome, {access?.sponsor_name}. Here's the verified participation data for this event.
          </p>
        </div>

        {/* Event Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-serif">Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {access?.event.event_date &&
                  format(new Date(access.event.event_date), "MMMM d, yyyy")}
              </div>
              {access?.event.city && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {access.event.city.name}, {access.event.city.country}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
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

          <Card>
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

          <Card className="border-primary">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-primary">
                <BarChart3 className="w-4 h-4" />
                Attended
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-serif font-medium text-primary">
                {analytics?.attended_count || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Verified attendance</p>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Rate */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-serif">Conversion Metrics</CardTitle>
            <CardDescription>
              Verified metrics from the immutable participation ledger
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
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
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${
                        analytics?.registered_count
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
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${
                        analytics?.confirmed_count
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
        <Card className="bg-accent/30 border-accent">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-serif font-medium text-display mb-1">
                  Verified Participation Data
                </h3>
                <p className="text-sm text-body">
                  All participation data is recorded in SNOVAA's immutable ledger. Records cannot be
                  edited or deleted, ensuring complete accuracy and accountability. This data
                  represents actual verified attendance, not self-reported metrics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SponsorDashboard;
