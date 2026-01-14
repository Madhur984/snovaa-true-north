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
    <header className="border-b border-hairline border-border/30 sticky top-0 bg-background/95 backdrop-blur-sm z-50">
      <div className="container max-w-6xl py-6">
        <div className="flex items-center justify-between">
          {/* Logo - Minimal, typographic */}
          <Link to="/" className="group">
            <span className="font-serif text-xl md:text-2xl font-light tracking-wider text-display">
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
