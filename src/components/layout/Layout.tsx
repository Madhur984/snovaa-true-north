import { ReactNode } from "react";
import { Header } from "./Header";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export const Layout = ({ children, showHeader = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {showHeader && <Header />}
      <main className="flex-1">{children}</main>
      <footer className="py-12 border-t border-white/10 mt-auto bg-black/20 backdrop-blur-md">
        <div className="container max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-foreground flex items-center justify-center">
                <span className="text-background font-bold text-xs">S</span>
              </div>
              <span className="font-bold text-sm tracking-widest text-foreground">SNOVAA</span>
            </div>
            <p className="font-mono text-xs text-muted-foreground text-center md:text-right uppercase tracking-wider">
              System. Order. Truth. — v3.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
