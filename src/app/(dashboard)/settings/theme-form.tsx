
"use client"

import { useTheme } from "next-themes"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function ThemeForm() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="space-y-4">
        <h3 className="text-lg font-medium">Appearance</h3>
        <div className="space-y-2">
            <Label>Theme</Label>
            <p className="text-sm text-muted-foreground">
              Select the color scheme for the application.
            </p>
        </div>
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
    </div>
  )
}
