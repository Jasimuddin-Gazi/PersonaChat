
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Render children only after mount to avoid hydration issues
  if (!isMounted) {
    // Render nothing or a placeholder on the server and during initial client render
    return null
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
