import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SnovaaLoader } from "@/components/ui/SnovaaLoader";

const AuthCallback = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [status, setStatus] = useState("Verifying login...");
    const [debug, setDebug] = useState("");
    const exchangeAttempted = useState(false); // Ref to track if we tried

    useEffect(() => {
        // 1. Success case
        if (user) {
            setStatus("Success! Redirecting...");
            setTimeout(() => navigate("/dashboard"), 500);
            return;
        }

        // 2. Handle Code Exchange
        const handleExchange = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get("code");
            const error = params.get("error");
            const errorDesc = params.get("error_description");

            if (error) {
                setStatus(`Login Error: ${errorDesc || error}`);
                return;
            }

            if (!code) {
                // No code, maybe just visiting the page?
                if (!user) {
                    setStatus("No login code found. Redirecting...");
                    setTimeout(() => navigate("/login"), 2000);
                }
                return;
            }

            setDebug("Code found. Waiting for Supabase SDK...");

            // WAIT 1.5s - Give the SDK's auto-detection a chance to work
            // This prevents the "Unable to exchange external code" (conflict) error
            await new Promise(r => setTimeout(r, 1500));

            // Re-check user after wait
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setStatus("Session detected via SDK. Redirecting...");
                navigate("/dashboard");
                return;
            }

            // If still no session, force manual exchange
            setDebug("SDK silent. Attempting manual exchange...");
            try {
                const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) {
                    // Ignore "both code and code verifier should be non-empty" if it occurs (race condition)
                    setDebug(`Manual exchange error: ${error.message}`);
                    setStatus("Login could not be completed. Please try again.");
                } else if (data.session) {
                    setStatus("Manual success! Redirecting...");
                    navigate("/dashboard");
                }
            } catch (err: any) {
                setDebug(`Exception: ${err.message}`);
            }
        };

        handleExchange();
    }, [user, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground animate-in fade-in zoom-in duration-500">
            <div className="bg-card p-8 rounded-xl shadow-2xl border border-border flex flex-col items-center gap-6 max-w-sm w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />

                <SnovaaLoader />

                <div className="text-center space-y-2 z-10">
                    <h2 className="text-xl font-bold tracking-tight">One moment</h2>
                    <p className="text-muted-foreground text-sm font-medium">{status}</p>

                    {/* Debug Info for User Feedback */}
                    <div className="mt-4 p-2 bg-muted/50 rounded text-[10px] font-mono text-left w-full h-24 overflow-auto border">
                        <p className="font-bold underline">Debug Log:</p>
                        <p>{debug || "Initializing..."}</p>
                        <p>User: {user ? "Yes" : "No"}</p>
                    </div>

                    <button
                        onClick={() => navigate("/login")}
                        className="mt-4 text-xs text-primary hover:underline"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthCallback;
