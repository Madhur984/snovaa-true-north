import { useState } from "react";
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
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate("/");
  };

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-display hover:opacity-70 transition-opacity"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-[73px] z-[100] bg-[#faf9f6] overflow-y-auto"
            style={{ backgroundColor: '#faf9f6' }}
          >
            <motion.nav
              className="flex flex-col items-center justify-center h-full pb-20"
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
                closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
              }}
            >
              {navLinks.map((link) => (
                <motion.div
                  key={link.to}
                  variants={{
                    open: { opacity: 1, y: 0 },
                    closed: { opacity: 0, y: 20 },
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="block py-4 text-2xl font-serif font-light text-display hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Auth Links */}
              <motion.div
                variants={{
                  open: { opacity: 1, y: 0 },
                  closed: { opacity: 0, y: 20 },
                }}
                transition={{ duration: 0.3 }}
                className="mt-8 pt-8 border-t border-border/30 w-48 text-center"
              >
                {user ? (
                  <div className="space-y-4">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block py-3 text-lg font-light text-body hover:text-display transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/my-events"
                      onClick={() => setIsOpen(false)}
                      className="block py-3 text-lg font-light text-body hover:text-display transition-colors"
                    >
                      My Events
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsOpen(false)}
                      className="block py-3 text-lg font-light text-body hover:text-display transition-colors"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full py-3 text-lg font-light text-subtle hover:text-display transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block py-3 text-lg font-light text-body hover:text-display transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="block py-4 text-lg font-light bg-primary text-primary-foreground hover:opacity-85 transition-opacity"
                    >
                      Join
                    </Link>
                  </div>
                )}
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
