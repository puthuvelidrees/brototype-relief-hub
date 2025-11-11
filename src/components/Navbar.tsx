import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut, Shield, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
              B
            </div>
            <span className="font-bold text-xl hidden sm:inline">Brototype Complaints</span>
          </Link>

          <div className="flex items-center gap-2">
            {user && (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/">
                    <User className="h-4 w-4 mr-2" />
                    Submit
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/my-complaints">My Complaints</Link>
                </Button>
                {isAdmin && (
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/admin">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Link>
                  </Button>
                )}
              </>
            )}

            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            {user && (
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}