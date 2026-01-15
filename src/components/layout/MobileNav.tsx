import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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

  // 🔒 Hard lock background
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate("/");
  };

  const menu = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-[#faf9f6]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-display p-2"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Menu Content */}
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
            {navLinks.map((link) => (
              <motion.div
                key={link.to}
                variants={{
                  open: { opacity: 1, y: 0 },
                  closed: { opacity: 0, y: 12 },
                }}
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

            <motion.div
              className="mt-8 flex flex-col items-center space-y-4"
              variants={{
                open: { opacity: 1, y: 0 },
                closed: { opacity: 0, y: 12 },
              }}
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
  );

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-display transition-opacity hover:opacity-70"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {typeof window !== "undefined" && createPortal(menu, document.body)}
    </div>
  );
}
