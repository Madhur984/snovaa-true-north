import * as React from "react";
import { Link } from "react-router-dom";
import { User, LogOut, Calendar, Map, Settings, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AccountMenuProps {
  label: string;
  onSignOut: () => Promise<void> | void;
}

export function AccountMenu({ label, onSignOut }: AccountMenuProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (root.contains(event.target as Node)) return;
      setOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <User className="w-4 h-4" />
        <span className="hidden sm:inline">{label || "Account"}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
      </Button>

      {open && (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 mt-2 w-56 z-50 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md"
        >
          <div className="p-1">
            <Link
              to="/dashboard"
              role="menuitem"
              className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent"
              onClick={() => setOpen(false)}
            >
              <Calendar className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              to="/my-events"
              role="menuitem"
              className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent"
              onClick={() => setOpen(false)}
            >
              <Calendar className="w-4 h-4" />
              My Events
            </Link>

            <Link
              to="/map"
              role="menuitem"
              className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent"
              onClick={() => setOpen(false)}
            >
              <Map className="w-4 h-4" />
              Participation Map
            </Link>

            <Link
              to="/settings"
              role="menuitem"
              className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent"
              onClick={() => setOpen(false)}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>

          <div className="h-px bg-border" />

          <button
            type="button"
            role="menuitem"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent focus:bg-accent outline-none"
            onClick={async () => {
              setOpen(false);
              await onSignOut();
            }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
