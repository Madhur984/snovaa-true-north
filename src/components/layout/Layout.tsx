import { ReactNode } from "react";
import { Header } from "./Header";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export const Layout = ({ children, showHeader = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-transparent">
      {showHeader && <Header />}
      <main>{children}</main>
      <footer className="py-12 border-t border-border mt-auto">
        <div className="container max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-semibold text-xs">S</span>
              </div>
              <span className="font-serif text-sm text-display">SNOVAA</span>
            </div>
            <p className="text-sm text-subtle text-center md:text-right">
              Boring. Calm. Correct. — A truth-first participation system.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
