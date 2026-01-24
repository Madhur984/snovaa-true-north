import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/toaster";
import { AnimatedRoutes } from "@/components/layout/AnimatedRoutes";
import { SnovaaLoader } from "@/components/ui/SnovaaLoader";
import FuturisticBackground from "@/components/layout/FuturisticBackground";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Toaster />
      <SnovaaLoader />
      <FuturisticBackground />
      <BrowserRouter>
        <div className="relative z-10 min-h-screen text-foreground">
          <AnimatedRoutes />
        </div>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
