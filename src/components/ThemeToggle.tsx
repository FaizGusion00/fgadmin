
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

export function ThemeToggle({ variant = "toggle" }: { variant?: "toggle" | "button" }) {
  const { theme, toggleTheme } = useTheme();

  if (variant === "button") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Toggle
      pressed={theme === "dark"}
      onPressedChange={() => toggleTheme()}
      aria-label="Toggle dark mode"
      title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      className="border-transparent hover:bg-transparent"
    >
      {theme === "dark" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle dark mode</span>
    </Toggle>
  );
}
