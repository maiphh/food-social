"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="h-9 w-9">
                <Sun className="h-4 w-4" />
            </Button>
        )
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="h-9 w-9 transition-transform hover:scale-110 active:scale-95"
        >
            {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4 transition-transform rotate-0 hover:rotate-12" />
            ) : (
                <Moon className="h-4 w-4 transition-transform rotate-0 hover:-rotate-12" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
