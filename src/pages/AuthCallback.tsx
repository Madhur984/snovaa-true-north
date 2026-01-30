import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SnovaaLoader } from "@/components/ui/SnovaaLoader";

const AuthCallback = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [status, setStatus] = useState<string>("Authenticating...");

    useEffect(() => {
        const handleAuthCallback = async () => {
            // 1. Check if user is already loaded (from persisted session)
            if (user) {
                navigate("/dashboard");
                return;
            }

            // 2. Check for 'code' query parameter (PKCE flow)
            const params = new URLSearchParams(window.location.search);
            const code = params.get("code");
            const error = params.get("error");
            const errorDescription = params.get("error_description");

            if (error) {
                console.error("Auth error:", error, errorDescription);
                setStatus(`Error: ${errorDescription || error}`);
                setTimeout(() => navigate("/login"), 3000);
                return;
            }

            if (code) {
                try {
                    setStatus("Verifying credentials...");
                    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) {
                        console.error("Exchange error:", error);
                        // If exchange fails, maybe the code was already used or expired.
                        // Sometimes supabase-js handles it automatically, so check session again.
                        const { data: sessionData } = await supabase.auth.getSession();
                        if (sessionData.session) {
                            navigate("/dashboard");
                        } else {
                            setStatus(`Login failed: ${error.message}`);
                            setTimeout(() => navigate("/login"), 3000);
                        }
                    } else {
                        // Success!
                        navigate("/dashboard");
                    }
                } catch (err) {
                    console.error("Unexpected error:", err);
                    setStatus("An unexpected error occurred.");
                }
            } else {
                // No code, no user. Maybe 'access_token' hash (Implicit flow)?
                // Supabase v2 prefers PKCE, but let's check hash just in case.
                const hash = window.location.hash;
                if (hash && hash.includes("access_token")) {
                    // The AuthProvider/Supabase client should handle this automatically.
                    // We just wait a bit.
                    setStatus("Finalizing login...");
                    setTimeout(() => {
                        // Check user again after delay
                        supabase.auth.getSession().then(({ data }) => {
                            if (data.session) navigate("/dashboard");
                            else navigate("/login");
                        });
                    }, 2000);
                } else {
                    // Nothing found.
                    navigate("/login");
                }
            }
        };

        handleAuthCallback();
    }, [user, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground animate-in fade-in zoom-in duration-500">
            <div className="bg-card p-8 rounded-xl shadow-2xl border border-border flex flex-col items-center gap-6 max-w-sm w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />

                <SnovaaLoader />

                <div className="text-center space-y-2 z-10">
                    <h2 className="text-2xl font-bold tracking-tight">One moment</h2>
                    <p className="text-muted-foreground text-sm font-medium">{status}</p>
                </div>
            </div>
        </div>
    );
};

export default AuthCallback;
