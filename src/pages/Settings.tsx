import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { User, Shield, Clock } from "lucide-react";
import { format } from "date-fns";

const Settings = () => {
  const { profile, updateRole } = useAuth();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [role, setRole] = useState<"participant" | "organizer">(profile?.role as "participant" | "organizer" || "participant");
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", profile.id);

    if (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
    }

    setSaving(false);
  };

  const handleRoleChange = async (newRole: "participant" | "organizer") => {
    setRole(newRole);
    const { error } = await updateRole(newRole);

    if (error) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
      setRole(profile?.role as "participant" | "organizer" || "participant");
    } else {
      toast({
        title: "Role updated",
        description: `You are now a ${newRole}.`,
      });
    }
  };

  if (!profile) {
    return (
      <Layout>
        <div className="container max-w-3xl py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-medium text-display mb-2">Settings</h1>
          <p className="text-body">Manage your account and preferences.</p>
        </div>

        <div className="space-y-6">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Your public identity on SNOVAA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile.email || ""} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Role Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account Role
              </CardTitle>
              <CardDescription>Choose how you want to use SNOVAA</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={role} onValueChange={(v) => handleRoleChange(v as "participant" | "organizer")}>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="participant" id="participant" />
                  <div className="flex-1">
                    <Label htmlFor="participant" className="cursor-pointer font-medium">Participant</Label>
                    <p className="text-sm text-muted-foreground">Attend events and track your participation history</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="organizer" id="organizer" />
                  <div className="flex-1">
                    <Label htmlFor="organizer" className="cursor-pointer font-medium">Organizer</Label>
                    <p className="text-sm text-muted-foreground">Create and manage events, track attendance</p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Account Information
              </CardTitle>
              <CardDescription>Details about your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Account ID</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">{profile.id.slice(0, 8)}...</code>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Member since</span>
                <span className="text-sm">{format(new Date(profile.created_at), "MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Verification status</span>
                <Badge variant={profile.verified_at ? "default" : "secondary"}>
                  {profile.verified_at ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
