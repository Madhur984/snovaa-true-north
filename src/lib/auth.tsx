import * as React from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  email: string | null;
  role: "participant" | "organizer" | "sponsor";
  verified_at: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateRole: (role: "participant" | "organizer") => Promise<{ error: Error | null }>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => fetchProfile(session.user.id), 100);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: displayName },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signInWithGoogle = async () => {
    try {
      alert("2. Auth: Starting Google Sign In");
      const redirectUrl = `${window.location.origin}/auth/callback`;
      alert(`3. Auth: Redirect URL is ${redirectUrl}`);
      // console.log("Generating OAuth URL...", redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true, // We will handle redirect manually
        }
      });

      if (error) {
        alert(`4. Auth Error: ${error.message}`);
        console.error("OAuth Generation Error:", error);
        return { error };
      }

      if (data) {
        alert(`5. Auth Data Received. URL present: ${!!data.url}`);
        if (data.url) {
          // console.log("OAuth URL generated:", data.url);
          window.location.href = data.url; // Manual Redirect
          return { error: null };
        }
      }

      alert("6. No URL returned!");
      return { error: new Error("No OAuth URL returned") };
    } catch (err: any) {
      alert(`7. EXCEPTION: ${err.message}`);
      console.error("Unexpected OAuth Error:", err);
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateRole = async (role: "participant" | "organizer") => {
    if (!profile) return { error: new Error("No profile found") };

    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", profile.id);

    if (!error) {
      setProfile({ ...profile, role });
    }
    return { error };
  };

  const value = React.useMemo(
    () => ({ user, session, profile, loading, signUp, signIn, signInWithGoogle, signOut, updateRole }),
    [user, session, profile, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
