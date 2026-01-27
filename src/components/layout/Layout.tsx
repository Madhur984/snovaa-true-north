import { ReactNode } from "react";
import { GlobalNavbar } from "@/components/layout/GlobalNavbar";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans text-gray-900 selection:bg-gray-900 selection:text-white">
      <GlobalNavbar />

      {/* Main Content Area: Padding for fixed navbar (h-16 = 64px) + extra spacing */}
      <main className="pt-16 flex-1 flex flex-col">
        {children}
      </main>

      {/* Optional Minimal Footer if needed, or remove completely for 'App-like' feel */}
    </div>
  );
};
