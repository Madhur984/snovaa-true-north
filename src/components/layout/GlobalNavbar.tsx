
import { Link, useLocation } from "react-router-dom";
import { User, Plus, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const GlobalNavbar = () => {
    const { profile, signOut } = useAuth();
    const location = useLocation();

    const navItems = [
        { label: "Home", path: "/" },
        { label: "My Events", path: "/my-events" },
        { label: "Clubs", path: "/clubs" },
    ];

    const isActive = (path: string) => {
        if (path === "/" && location.pathname !== "/") return false;
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 transition-all duration-300">
            <div className="container max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-serif font-bold text-lg rounded-sm group-hover:scale-105 transition-transform">
                        S
                    </div>
                    <span className="font-serif text-xl tracking-tight hidden sm:block text-display">SNOVAA</span>
                </Link>

                {/* Center Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                                isActive(item.path)
                                    ? "bg-black text-white"
                                    : "text-muted-foreground hover:text-black hover:bg-gray-100"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-black">
                        <Search className="w-5 h-5" />
                    </Button>

                    {profile ? (
                        <>
                            <Button asChild size="sm" className="hidden sm:flex rounded-full gap-1 pl-3 pr-4 bg-black text-white hover:bg-gray-900 border-0 shadow-sm hover:shadow-md transition-all">
                                <Link to="/events/create">
                                    <Plus className="w-4 h-4" />
                                    <span>Create</span>
                                </Link>
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 border border-gray-200 ml-1">
                                        <User className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 font-sans">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <span className="text-sm font-medium leading-none">{profile.display_name}</span>
                                            <span className="text-xs leading-none text-muted-foreground font-normal">{profile.role}</span>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link to="/my-events?tab=identity">My Identity</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/settings">Settings</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600">
                                        Sign out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <Button asChild size="sm" variant="default" className="rounded-full px-5">
                            <Link to="/signin">Sign In</Link>
                        </Button>
                    )}
                </div>
            </div>
        </nav>
    );
};
