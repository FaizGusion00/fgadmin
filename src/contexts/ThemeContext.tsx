import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check local storage first
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    // If value in storage, use it
    if (savedTheme) return savedTheme;
    // Otherwise, check user preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  
  const { user } = useAuth();

  // Effect to apply theme
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);
  
  // Sync theme with Supabase when user is logged in
  useEffect(() => {
    if (!user) return;
    
    // First attempt to get user's settings
    const fetchUserTheme = async () => {
      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("theme")
          .eq("user_id", user.id)
          .single();
          
        if (error) throw error;
        
        if (data && data.theme) {
          setTheme(data.theme as Theme);
        }
      } catch (error) {
        console.error("Error fetching user theme:", error);
      }
    };
    
    fetchUserTheme();
  }, [user]);
  
  // Save theme preference to Supabase
  const saveThemePreference = async (newTheme: Theme) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("user_settings")
        .update({ theme: newTheme })
        .eq("user_id", user.id);
        
      if (error) throw error;
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };
  
  const setThemeWithSave = (newTheme: Theme) => {
    setTheme(newTheme);
    saveThemePreference(newTheme);
  };
  
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setThemeWithSave(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeWithSave, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
