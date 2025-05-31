
import { useState } from "react";
import { Bell, Search, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Header = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const getUserDisplayName = () => {
    if (!user) return "User";
    
    const firstName = user.user_metadata?.first_name || user.user_metadata?.name;
    const lastName = user.user_metadata?.last_name;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (user.email) {
      return user.email.split('@')[0];
    }
    
    return "User";
  };

  const getUserInitials = () => {
    const displayName = getUserDisplayName();
    if (displayName && displayName !== "User") {
      const words = displayName.split(" ");
      if (words.length >= 2) {
        return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
      }
      return displayName.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getUserAvatar = () => {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  };
  
  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-6">
      {/* Left side - Search */}
      <div className="flex-1 max-w-md">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search anything..."
            className="w-full bg-muted/50 pl-9 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 h-10 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
      
      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle variant="button" />
        
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-muted/50">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-destructive animate-pulse"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 bg-background/95 backdrop-blur-sm border-border/50">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <p className="font-semibold">Notifications</p>
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                Mark all as read
              </Button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <div className="p-2 space-y-1">
                <div className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted/50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">New client added</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted/50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">System update completed</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-border/50">
              <Button variant="ghost" className="w-full rounded-t-none h-12 text-center text-primary font-medium hover:bg-primary/10">
                View all notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* User menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-xl hover:bg-muted/50">
                <Avatar className="h-8 w-8 border-2 border-border">
                  <AvatarImage src={getUserAvatar()} alt={getUserDisplayName()} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-sm border-border/50">
              <div className="flex items-center gap-3 p-3">
                <Avatar className="h-10 w-10 border-2 border-border">
                  <AvatarImage src={getUserAvatar()} alt={getUserDisplayName()} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="font-semibold text-sm">{getUserDisplayName()}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {user.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50"
                onClick={() => window.location.href = "/profile"}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50"
                onClick={() => window.location.href = "/settings"}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10" 
                onClick={logout}
              >
                <span className="mr-2">🚪</span>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};
