import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { SnovaaLoader } from "@/components/ui/SnovaaLoader";

const AuthCallback = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (user) {
                navigate("/dashboard");
            } else {
                // If loading is finished and no user, the exchange might have failed or 
                // the hash was invalid. 
                // We'll give it a small delay just in case, but usually this means failure.
                // However, onAuthStateChange might fire a bit later even if loading is false?
                // No, AuthProvider logic sets loading=false ONLY after initial check.
                // So if user is null here, they are not logged in.

                // Check for error in hash params manually if needed, or just redirect.
                const hash = window.location.hash;
                if (!hash && !window.location.search) {
                    console.warn("No auth data found in URL");
                    navigate("/login");
                } else {
                    // Hash exists but user is null? Supabase usually cleans hash after handling.
                    // If we are here, AuthProvider ran. 
                    navigate("/login");
                }
            }
        }
    }, [user, loading, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <SnovaaLoader />
            <p className="mt-4 text-muted-foreground font-serif">Authenticating...</p>
        </div>
    );
};

export default AuthCallback;
