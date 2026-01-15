import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";

const navLinks = [
  { to: "/clubs", label: "Clubs" },
  { to: "/events", label: "Events" },
  { to: "/map", label: "Map" },
  { to: "/philosophy", label: "Philosophy" },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // 🔒 Lock background scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate("/");
  };

  return (
    <div className="md:hidden">
      {/* Menu Toggle */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="p-2 text-display transition-opacity hover:opacity-70 relative z-[101]"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-[#faf9f6]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ backdropFilter: "saturate(0.9)" }}
          >
            <motion.nav
              className="flex h-full flex-col items-center justify-center space-y-6"
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: {
                  transition: {
                    staggerChildren: 0.06,
                    delayChildren: 0.08,
                  },
                },
                closed: {
                  transition: {
                    staggerChildren: 0.04,
                    staggerDirection: -1,
                  },
                },
              }}
            >
              {/* Primary Nav Links */}
              {navLinks.map((link) => (
                <motion.div
                  key={link.to}
                  variants={{
                    open: { opacity: 1, y: 0 },
                    closed: { opacity: 0, y: 12 },
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="text-2xl font-serif font-light tracking-wide text-display transition-opacity hover:opacity-70"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Auth Section */}
              <motion.div
                className="mt-8 flex flex-col items-center space-y-4"
                variants={{
                  open: { opacity: 1, y: 0 },
                  closed: { opacity: 0, y: 12 },
                }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-light text-body transition-opacity hover:opacity-70"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-light text-body transition-opacity hover:opacity-70"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="text-lg font-light text-subtle transition-opacity hover:opacity-70"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-light text-body transition-opacity hover:opacity-70"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="rounded-sm bg-primary px-6 py-3 text-lg font-light text-primary-foreground transition-opacity hover:opacity-85"
                    >
                      Join
                    </Link>
                  </>
                )}
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
