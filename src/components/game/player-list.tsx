// ABOUTME: Animated player list component
// ABOUTME: Shows players with avatars and join animations

import { cn } from "@/lib/utils"
import { User } from "lucide-react"

interface Player {
    uid: string
    name: string
}

interface PlayerListProps {
    players: Player[]
    highlightUid?: string
    className?: string
}

export function PlayerList({ players, highlightUid, className }: PlayerListProps) {
    if (players.length === 0) {
        return (
            <div className={cn("text-center py-8", className)}>
                <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                        <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                </div>
                <p className="text-muted-foreground text-sm">Waiting for players to join...</p>
            </div>
        )
    }

    return (
        <div className={cn("space-y-2", className)}>
            {players.map((player, index) => (
                <div
                    key={player.uid}
                    className={cn(
                        "flex items-center gap-3 p-3 rounded-lg transition-all slide-in-right",
                        highlightUid === player.uid
                            ? "bg-accent/20 border border-accent/30"
                            : "bg-muted/30"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <div
                        className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold",
                            highlightUid === player.uid
                                ? "bg-accent text-accent-foreground"
                                : "bg-primary/20 text-primary"
                        )}
                    >
                        {player.name.charAt(0).toUpperCase()}
                    </div>
                    <span
                        className={cn(
                            "font-medium",
                            highlightUid === player.uid ? "text-accent" : "text-foreground"
                        )}
                    >
                        {player.name}
                        {highlightUid === player.uid && (
                            <span className="text-xs text-muted-foreground ml-2">(You)</span>
                        )}
                    </span>
                </div>
            ))}
        </div>
    )
}
