import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { SnovaaLoader } from "@/components/ui/SnovaaLoader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const AuthCallback = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [debugInfo, setDebugInfo] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Capture URL info for debugging
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const errorParam = params.get("error");
        const errorDesc = params.get("error_description");
        const hash = window.location.hash;

        const info = JSON.stringify({
            hasCode: !!code,
            hasHash: !!hash,
            error: errorParam,
            errorDesc,
            userPresent: !!user,
            loading
        }, null, 2);

        setDebugInfo(info);
        console.log("AuthCallback Debug:", info);

        if (errorParam || errorDesc) {
            setError(errorDesc || errorParam);
            return;
        }

        if (!loading) {
            if (user) {
                console.log("User found, redirecting to dashboard");
                navigate("/dashboard");
            } else {
                // If no user but we have a code, maybe wait a bit longer or supabase client is still processing?
                // But loading is false. If loading is false and no user, authentication failed or hasn't started.
                // However, Supabase client handles the code exchange internally.

                console.warn("Loading complete but no user found.");
                // We won't redirect immediately in debug mode so user can see what's up.
                // setTimeout(() => navigate("/login"), 3000);
            }
        }
    }, [user, loading, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Authenticating...</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-center">
                        <SnovaaLoader />
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Authentication Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="bg-muted p-4 rounded-md text-xs font-mono overflow-auto max-h-48">
                        <p className="font-bold mb-2">Debug Status:</p>
                        <pre>{debugInfo}</pre>
                    </div>

                    <div className="flex gap-2 justify-center mt-4">
                        <Button variant="outline" onClick={() => navigate("/login")}>
                            Back to Login
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AuthCallback;
