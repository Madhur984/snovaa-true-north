import { ReactNode, useEffect, useState } from "react";

interface WebGLFallbackProps {
  children: ReactNode;
  fallback?: ReactNode;
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return gl !== null && gl !== undefined;
  } catch {
    return false;
  }
}

export function WebGLFallback({ children, fallback }: WebGLFallbackProps) {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglSupported(detectWebGL());
  }, []);

  // Still loading detection
  if (webglSupported === null) {
    return fallback || null;
  }

  // WebGL not supported - show fallback
  if (!webglSupported) {
    return <>{fallback}</> || null;
  }

  return <>{children}</>;
}

// Default gradient fallback for hero sections
export function GradientFallback({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 -z-10 pointer-events-none ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
    </div>
  );
}
