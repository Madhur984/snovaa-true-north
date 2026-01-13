import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"participant" | "organizer">("participant");
  const [loading, setLoading] = useState(false);
  const { signUp, updateRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(email, password, displayName);

    if (error) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Wait a moment for the profile to be created by the trigger
    setTimeout(async () => {
      if (role === "organizer") {
        await updateRole("organizer");
      }
      
      toast({
        title: "Account created",
        description: "Welcome to SNOVAA. Your participation journey begins.",
      });
      navigate("/dashboard");
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-semibold">S</span>
            </div>
            <span className="font-serif text-2xl font-medium text-display">SNOVAA</span>
          </Link>
          <h1 className="font-serif text-3xl font-medium text-display mb-2">Create your account</h1>
          <p className="text-body">Join the truth-first participation network.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>I am a...</Label>
            <RadioGroup value={role} onValueChange={(v) => setRole(v as "participant" | "organizer")}>
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="participant" id="participant" />
                <div className="flex-1">
                  <Label htmlFor="participant" className="cursor-pointer font-medium">Participant</Label>
                  <p className="text-sm text-muted-foreground">I want to attend events and track my participation</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="organizer" id="organizer" />
                <div className="flex-1">
                  <Label htmlFor="organizer" className="cursor-pointer font-medium">Organizer</Label>
                  <p className="text-sm text-muted-foreground">I want to create and manage events</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-subtle">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
