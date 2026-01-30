import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SnovaaLoader } from "@/components/ui/SnovaaLoader";

const AuthCallback = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const [status, setStatus] = useState("Authenticating...");
    const [isStuck, setIsStuck] = useState(false);

    useEffect(() => {
        // 1. If user appears, we are good.
        if (user) {
            setStatus("Success! Redirecting...");
            setTimeout(() => navigate("/dashboard"), 500);
            return;
        }

        // 2. If loading finishes and no user, we might be stuck or failed.
        if (!loading && !user) {
            const params = new URLSearchParams(window.location.search);
            const code = params.get("code");
            const error = params.get("error");

            if (error) {
                setStatus(`Error: ${params.get("error_description") || error}`);
                return;
            }

            if (code) {
                // SDK missed it? Let's try manual exchange one last time.
                setStatus("Finalizing exchange...");
                supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
                    if (error) {
                        console.error("Manual Exchange Error:", error);
                        setStatus("Login failed. Please try again.");
                        setIsStuck(true);
                    } else if (data.session) {
                        setStatus("Session established!");
                        // The AuthProvider should pick this up automatically via onAuthStateChange
                        // But we can force navigate
                        navigate("/dashboard");
                    }
                });
            } else {
                setStatus("No session found. Redirecting to login...");
                setTimeout(() => navigate("/login"), 2000);
            }
        }
    }, [user, loading, navigate]);

    // Safety timeout
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!user) {
                setIsStuck(true);
                setStatus("Request timed out. Please try again.");
            }
        }, 8000); // 8 seconds
        return () => clearTimeout(timer);
    }, [user]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground animate-in fade-in zoom-in duration-500">
            <div className="bg-card p-8 rounded-xl shadow-2xl border border-border flex flex-col items-center gap-6 max-w-sm w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />

                <SnovaaLoader />

                <div className="text-center space-y-2 z-10">
                    <h2 className="text-xl font-bold tracking-tight">One moment</h2>
                    <p className="text-muted-foreground text-sm font-medium">{status}</p>

                    {isStuck && (
                        <div className="pt-4">
                            <button
                                onClick={() => navigate("/login")}
                                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                Return to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthCallback;
