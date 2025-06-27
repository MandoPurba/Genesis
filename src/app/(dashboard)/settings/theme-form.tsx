
"use client"

import { useTheme } from "next-themes"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function ThemeForm() {
  const { setTheme, theme } = useTheme()

  return (
    <RadioGroup
      name="theme"
      value={theme}
      onValueChange={setTheme}
      className="flex space-x-4 pt-2"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="light" id="light-theme" />
        <Label htmlFor="light-theme">Light</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="dark" id="dark-theme" />
        <Label htmlFor="dark-theme">Dark</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="system" id="system-theme" />
        <Label htmlFor="system-theme">System</Label>
      </div>
    </RadioGroup>
  )
}
