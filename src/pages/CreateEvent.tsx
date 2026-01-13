import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus } from "lucide-react";

interface City {
  id: string;
  name: string;
  country: string;
}

const moduleTypes = [
  { id: "agenda", label: "Agenda / Schedule", description: "Show event timeline" },
  { id: "speakers", label: "Speakers", description: "Feature event speakers" },
  { id: "resources", label: "Resources", description: "Share materials and links" },
  { id: "qna", label: "Q&A", description: "Collect questions from attendees" },
  { id: "networking", label: "Networking", description: "Facilitate connections" },
];

const CreateEvent = () => {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venue: "",
    city_id: "",
    event_date: "",
    start_time: "",
    end_time: "",
    max_participants: "",
  });

  useEffect(() => {
    if (authLoading) return;

    // Don’t block while the profile is still loading.
    if (!profile || profile.role !== "organizer") {
      toast({
        title: "Access denied",
        description: "You must be an organizer to create events.",
        variant: "destructive",
      });
      navigate("/dashboard", { replace: true });
      return;
    }

    (async () => {
      const { data } = await supabase.from("cities").select("*").order("name");
      if (data) setCities(data);
    })();
  }, [authLoading, profile?.id, profile?.role, navigate, toast]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);

    // Create event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        organizer_id: profile.id,
        title: formData.title,
        description: formData.description || null,
        venue: formData.venue,
        city_id: formData.city_id || null,
        event_date: formData.event_date,
        start_time: formData.start_time,
        end_time: formData.end_time || null,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        status: "draft",
      })
      .select()
      .single();

    if (eventError) {
      toast({
        title: "Error creating event",
        description: eventError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Create selected modules
    if (selectedModules.length > 0) {
      await supabase.from("event_modules").insert(
        selectedModules.map((moduleType) => ({
          event_id: event.id,
          module_type: moduleType,
          enabled: true,
        }))
      );
    }

    toast({
      title: "Event created",
      description: "Your event has been created as a draft.",
    });

    navigate(`/events/${event.id}`);
    setLoading(false);
  };

  const toggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="font-serif text-3xl font-medium text-display mb-2">Create Event</h1>
          <p className="text-body">
            Create a new event. All participation will be recorded in the immutable ledger.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Event Details</CardTitle>
              <CardDescription>Basic information about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Tech Meetup San Francisco"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your event..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">When & Where</CardTitle>
              <CardDescription>Event location and timing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Select value={formData.city_id} onValueChange={(v) => setFormData({ ...formData, city_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}, {city.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue *</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g., Conference Center, Room 101"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date">Date *</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_participants">Maximum Participants</Label>
                <Input
                  id="max_participants"
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                  placeholder="Leave empty for unlimited"
                  min={1}
                />
              </div>
            </CardContent>
          </Card>

          {/* Modules */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Event Modules</CardTitle>
              <CardDescription>Select which modules to enable for this event</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {moduleTypes.map((module) => (
                  <div
                    key={module.id}
                    className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleModule(module.id)}
                  >
                    <Checkbox
                      checked={selectedModules.includes(module.id)}
                      onCheckedChange={() => toggleModule(module.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{module.label}</p>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "Creating..." : "Create Event"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateEvent;
