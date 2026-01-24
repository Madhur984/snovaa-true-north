import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { MobileNav } from "@/components/layout/MobileNav";

export const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 glass">
      <div className="container max-w-6xl py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Futuristic, typographic */}
          <Link to="/" className="group flex items-center gap-2">
            <span className="font-sans text-xl md:text-2xl font-bold tracking-tight text-foreground transition-all duration-300 group-hover:tracking-widest">
              SNOVAA
            </span>
          </Link>

          {/* Navigation - Thin, spaced, understated */}
          <nav className="hidden md:flex items-center gap-12">
            {[
              { to: "/clubs", label: "Clubs" },
              { to: "/events", label: "Events" },
              { to: "/map", label: "Map" },
              { to: "/philosophy", label: "Philosophy" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-xs font-sans font-light tracking-luxury uppercase text-body hover:text-display link-underline transition-colors duration-500"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <AccountMenu label={profile?.display_name || "Account"} onSignOut={handleSignOut} />
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-sans font-light tracking-luxury uppercase text-body hover:text-display link-underline transition-colors duration-500"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-xs font-sans font-light tracking-luxury uppercase text-display border border-border/60 px-6 py-3 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-500"
                >
                  Join
                </Link>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
};
