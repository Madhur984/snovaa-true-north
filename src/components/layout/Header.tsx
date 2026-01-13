import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/layout/AccountMenu";

export const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container max-w-6xl py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <span className="text-primary-foreground font-serif font-semibold text-lg">S</span>
            </div>
            <span className="font-serif text-2xl font-medium text-display">SNOVAA</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { to: "/clubs", label: "Clubs" },
              { to: "/events", label: "Events" },
              { to: "/map", label: "Map" },
              { to: "/philosophy", label: "Philosophy" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 text-sm text-body hover:text-display hover:bg-muted/50 rounded-lg transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <AccountMenu label={profile?.display_name || "Account"} onSignOut={handleSignOut} />
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="rounded-lg">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="rounded-lg shadow-md shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
