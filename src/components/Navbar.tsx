import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Moon, Sun, LogOut, Shield, User, Languages, Users, ChevronDown, FileText, Settings, TrendingUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import NotificationCenter from "@/components/NotificationCenter";

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
              B
            </div>
            <span className="font-bold text-xl hidden sm:inline">{t.appTitle}</span>
          </Link>

          <div className="flex items-center gap-2">
            {user && (
              <>
                {!isAdmin && (
                  <>
                    <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                      <Link to="/">
                        <User className="h-4 w-4 mr-2" />
                        {t.submit}
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                      <Link to="/my-complaints">{t.myComplaints}</Link>
                    </Button>
                  </>
                )}
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="default" size="sm" className="hidden sm:flex">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-popover z-50" align="end">
                      <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center cursor-pointer">
                          <FileText className="h-4 w-4 mr-2" />
                          View Complaints
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/users" className="flex items-center cursor-pointer">
                          <Users className="h-4 w-4 mr-2" />
                          Manage Users
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/analytics" className="flex items-center cursor-pointer">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Analytics
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin/settings" className="flex items-center cursor-pointer">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}

            {user && <NotificationCenter />}

            <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
              <SelectTrigger className="w-[100px] h-9">
                <Languages className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिन्दी</SelectItem>
                <SelectItem value="ml">മലയാളം</SelectItem>
                <SelectItem value="ta">தமிழ்</SelectItem>
              </SelectContent>
            </Select>

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