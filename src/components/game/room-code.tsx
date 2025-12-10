// ABOUTME: Dramatic room code display component
// ABOUTME: Features monospace font, large text, and glow effects

import { cn } from "@/lib/utils"

interface RoomCodeProps {
    code: string
    className?: string
    size?: "default" | "lg" | "xl"
}

export function RoomCode({ code, className, size = "default" }: RoomCodeProps) {
    const sizeClasses = {
        default: "text-4xl md:text-5xl",
        lg: "text-5xl md:text-6xl",
        xl: "text-6xl md:text-7xl",
    }

    return (
        <div className={cn("text-center", className)}>
            <div
                className={cn(
                    "room-code font-bold text-white tracking-[0.3em]",
                    sizeClasses[size],
                    "animate-float"
                )}
            >
                {code}
            </div>
            <p className="text-muted-foreground mt-2 text-sm">Room Code</p>
        </div>
    )
}
