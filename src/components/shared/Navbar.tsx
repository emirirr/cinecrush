import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Film, MessageCircle, Search, User } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/discover", label: "Discover", icon: Search },
    { path: "/swipe", label: "Swipe", icon: Heart },
    { path: "/matches", label: "Matches", icon: MessageCircle },
    { path: "/profile", label: "Profile", icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;
  const { toast } = useToast();

  return (
    <>
      {/* Desktop Top Navbar */}
      <nav className="hidden md:block bg-card/50 backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Film className="h-8 w-8 text-neon-purple group-hover:text-neon-pink transition-colors" />
                <Heart className="h-4 w-4 text-neon-red absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="text-xl font-bold text-neon bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Cinecrush
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                      isActive(item.path)
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Auth Buttons - Desktop */}
            <div className="flex items-center space-x-4">
              <Link to="/auth/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button className="btn-neon" size="sm">
                  Join Now
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await signOut(auth);
                    toast({ title: "Signed out" });
                  } catch (err: any) {
                    toast({ title: "Sign out failed", description: err?.message || "Please try again.", variant: "destructive" });
                  }
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for bottom nav height on mobile */}
      <div className="h-16 md:hidden" />

      {/* Mobile Bottom Navbar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/80 backdrop-blur-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-4 gap-2 h-16">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center rounded-md transition-colors ${
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "" : "opacity-80"}`} />
                  <span className="text-[11px] mt-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;