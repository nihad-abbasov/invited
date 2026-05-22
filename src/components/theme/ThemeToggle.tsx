"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { Segmented } from "@/components/ui/Segmented";
import { useTheme, type ThemeChoice } from "./ThemeProvider";

interface Props {
  className?: string;
}

export function ThemeToggle({ className }: Props) {
  const { choice, setChoice } = useTheme();
  return (
    <Segmented<ThemeChoice>
      value={choice}
      onChange={setChoice}
      className={className}
      options={[
        { value: "light", label: "Light", icon: <Sun className="h-3.5 w-3.5" /> },
        { value: "system", label: "Auto", icon: <Monitor className="h-3.5 w-3.5" /> },
        { value: "dark", label: "Dark", icon: <Moon className="h-3.5 w-3.5" /> },
      ]}
    />
  );
}
