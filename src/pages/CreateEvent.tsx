import { useEffect, useState, useCallback, useRef } from "react";
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
import { ArrowLeft, Plus, Sparkles, Loader2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ModuleSuggestion {
  module_id: string;
  recommended: boolean;
  reason: string;
}

interface AISuggestions {
  suggestions: ModuleSuggestion[];
  event_type_detected: string;
  overall_recommendation: string;
}

interface City {
  id: string;
  name: string;
  country: string;
}

interface Blueprint {
  id: string;
  name: string;
  category: string;
  description: string | null;
  default_modules: string[];
  default_config: { max_participants?: number; duration_hours?: number };
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
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [selectedBlueprint, setSelectedBlueprint] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);
  const [suggestingModules, setSuggestingModules] = useState(false);

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

  const hasCheckedAccess = useRef(false);
  const hasFetchedData = useRef(false);

  useEffect(() => {
    if (authLoading || hasCheckedAccess.current) return;

    // Only check access once profile is loaded
    if (!profile) return;
    
    hasCheckedAccess.current = true;

    if (profile.role !== "organizer") {
      navigate("/dashboard", { replace: true });
      return;
    }
  }, [authLoading, profile, navigate]);

  useEffect(() => {
    if (authLoading || !profile || profile.role !== "organizer" || hasFetchedData.current) return;
    
    hasFetchedData.current = true;

    (async () => {
      const [citiesRes, blueprintsRes] = await Promise.all([
        supabase.from("cities").select("*").order("name"),
        supabase.from("event_blueprints").select("*").order("name"),
      ]);
      if (citiesRes.data) setCities(citiesRes.data);
      if (blueprintsRes.data) {
        setBlueprints(
          blueprintsRes.data.map((b) => ({
            ...b,
            default_modules: Array.isArray(b.default_modules) ? b.default_modules : [],
            default_config: typeof b.default_config === "object" && b.default_config !== null ? b.default_config : {},
          })) as Blueprint[]
        );
      }
    })();
  }, [authLoading, profile]);

  const handleBlueprintChange = (blueprintId: string) => {
    setSelectedBlueprint(blueprintId);
    const blueprint = blueprints.find((b) => b.id === blueprintId);
    if (blueprint) {
      setSelectedModules(blueprint.default_modules);
      if (blueprint.default_config.max_participants) {
        setFormData((prev) => ({
          ...prev,
          max_participants: blueprint.default_config.max_participants?.toString() || "",
        }));
      }
      setAiSuggestions(null);
      toast({
        title: `${blueprint.name} template applied`,
        description: `${blueprint.default_modules.length} modules pre-selected.`,
      });
    }
  };


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

  const suggestModulesWithAI = useCallback(async () => {
    if (!formData.title && !formData.description) {
      toast({
        title: "Need more info",
        description: "Add a title or description first so AI can suggest modules.",
        variant: "destructive",
      });
      return;
    }

    setSuggestingModules(true);
    setAiSuggestions(null);

    try {
      const { data, error } = await supabase.functions.invoke("suggest-modules", {
        body: { title: formData.title, description: formData.description },
      });

      if (error) throw error;

      setAiSuggestions(data);

      // Auto-select recommended modules
      const recommendedModules = data.suggestions
        .filter((s: ModuleSuggestion) => s.recommended)
        .map((s: ModuleSuggestion) => s.module_id);
      setSelectedModules(recommendedModules);

      toast({
        title: "AI Suggestions Ready",
        description: `Detected: ${data.event_type_detected}. ${recommendedModules.length} modules recommended.`,
      });
    } catch (error) {
      console.error("AI suggestion error:", error);
      toast({
        title: "Suggestion failed",
        description: "Could not get AI suggestions. You can still select modules manually.",
        variant: "destructive",
      });
    } finally {
      setSuggestingModules(false);
    }
  }, [formData.title, formData.description, toast]);

  const getSuggestionForModule = (moduleId: string): ModuleSuggestion | undefined => {
    return aiSuggestions?.suggestions.find((s) => s.module_id === moduleId);
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
          {/* Blueprint Selection */}
          {blueprints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Start from Template
                </CardTitle>
                <CardDescription>
                  Choose a pre-configured template to auto-fill modules and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {blueprints.map((blueprint) => (
                    <div
                      key={blueprint.id}
                      onClick={() => handleBlueprintChange(blueprint.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedBlueprint === blueprint.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{blueprint.name}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {blueprint.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {blueprint.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {blueprint.default_modules.slice(0, 3).map((m) => (
                          <Badge key={m} variant="secondary" className="text-xs">
                            {m}
                          </Badge>
                        ))}
                        {blueprint.default_modules.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{blueprint.default_modules.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="font-serif">Event Modules</CardTitle>
                <CardDescription>Select which modules to enable for this event</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={suggestModulesWithAI}
                disabled={suggestingModules}
                className="shrink-0"
              >
                {suggestingModules ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {suggestingModules ? "Analyzing..." : "AI Suggest"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiSuggestions && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">AI Analysis</span>
                    <Badge variant="secondary" className="text-xs">
                      {aiSuggestions.event_type_detected}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {aiSuggestions.overall_recommendation}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {moduleTypes.map((module) => {
                  const suggestion = getSuggestionForModule(module.id);
                  return (
                    <div
                      key={module.id}
                      className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        suggestion?.recommended
                          ? "border-primary/50 bg-primary/5 hover:bg-primary/10"
                          : "border-border hover:bg-muted/50"
                      }`}
                      onClick={() => toggleModule(module.id)}
                    >
                      <Checkbox
                        checked={selectedModules.includes(module.id)}
                        onCheckedChange={() => toggleModule(module.id)}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{module.label}</p>
                          {suggestion?.recommended && (
                            <Badge variant="default" className="text-xs">
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                        {suggestion?.reason && (
                          <p className="text-xs text-primary/80 mt-1">
                            <Sparkles className="w-3 h-3 inline mr-1" />
                            {suggestion.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
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
