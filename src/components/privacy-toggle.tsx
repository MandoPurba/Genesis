'use client'

import { Eye, EyeOff } from 'lucide-react'
import { usePrivacy } from '@/contexts/privacy-context'
import { Button } from './ui/button'

export function PrivacyToggle() {
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy()

  return (
    <Button variant="ghost" size="icon" className="rounded-full" onClick={togglePrivacyMode}>
      {isPrivacyMode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      <span className="sr-only">Toggle Privacy Mode</span>
    </Button>
  )
}
