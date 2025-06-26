'use client'

import { useState, useEffect } from 'react'
import { MonitorSmartphone, LoaderCircle } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

export function MobileBlocker({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background p-4 text-center">
        <div className="flex flex-col items-center gap-4">
          <MonitorSmartphone className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Desktop View Recommended</h1>
          <p className="max-w-sm text-muted-foreground">
            For the best experience, please open this application on a desktop.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
