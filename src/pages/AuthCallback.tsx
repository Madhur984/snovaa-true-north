import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SnovaaLoader } from "@/components/ui/SnovaaLoader";

const AuthCallback = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [status, setStatus] = useState("Finalizing login...");

    useEffect(() => {
        if (user) {
            navigate("/dashboard");
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const error = params.get("error");
        const code = params.get("code");
        const errorDesc = params.get("error_description");

        if (error) {
            setStatus(`Login Failed: ${errorDesc || error}`);
            return;
        }

        if (code) {
            // Attempt manual exchange if not already handled
            supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
                if (error) {
                    setStatus(`Error exchanging code: ${error.message}`);
                } else if (data.session) {
                    navigate("/dashboard");
                } else {
                    // If data.session is null but no error, wait for onAuthStateChange
                    setTimeout(() => {
                        if (!user) setStatus("Stuck? Click retry below.");
                    }, 3000);
                }
            });
        }
    }, [user, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground animate-in fade-in zoom-in duration-500">
            <div className="bg-card p-8 rounded-xl shadow-2xl border border-border flex flex-col items-center gap-6 max-w-sm w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />

                <SnovaaLoader />

                <div className="text-center space-y-4 z-10">
                    <h2 className="text-xl font-bold tracking-tight">One moment</h2>
                    <p className="text-muted-foreground text-sm font-medium px-4">{status}</p>

                    <button
                        onClick={() => {
                            // Clear everything and go back
                            localStorage.clear();
                            navigate("/login");
                        }}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        Clear Cache & Retry Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthCallback;
