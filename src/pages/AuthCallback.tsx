import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { SnovaaLoader } from "@/components/ui/SnovaaLoader";

const AuthCallback = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check for error in URL immediately
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get("error");
        const errorDesc = params.get("error_description");
        if (errorParam) {
            setError(errorDesc || errorParam);
            return;
        }

        if (user) {
            // SDK has successfully exchanged code and updated session
            navigate("/dashboard");
        }
    }, [user, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground animate-in fade-in zoom-in duration-500">
            <div className="bg-card p-8 rounded-xl shadow-2xl border border-border flex flex-col items-center gap-6 max-w-sm w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />

                <SnovaaLoader />

                <div className="text-center space-y-2 z-10">
                    <p className="text-muted-foreground text-sm font-medium">{status}</p>
                </div>
            </div>
        </div>
    );
};

export default AuthCallback;
