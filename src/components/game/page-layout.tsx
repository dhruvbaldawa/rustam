// ABOUTME: Reusable page layout with gradient background
// ABOUTME: Provides consistent styling across all pages

import { cn } from "@/lib/utils"

interface PageLayoutProps {
    children: React.ReactNode
    className?: string
    variant?: "default" | "success" | "danger"
}

export function PageLayout({ children, className, variant = "default" }: PageLayoutProps) {
    const variantClasses = {
        default: "bg-gradient-game",
        success: "bg-[hsl(142_71%_45%)]",
        danger: "bg-[hsl(0_84%_60%)]",
    }

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center min-h-screen min-h-screen-dynamic p-4 safe-area-top safe-area-bottom",
                variantClasses[variant],
                className
            )}
        >
            {children}
        </div>
    )
}
