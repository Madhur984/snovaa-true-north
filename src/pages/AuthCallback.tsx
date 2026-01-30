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
                // If loading is done and no user, authentication failed
                navigate("/login");
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
