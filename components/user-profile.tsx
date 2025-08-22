"use client"

import type { User } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreditBalance } from "@/components/credit-balance"
import { MapPin, Star, Calendar, Coins } from "lucide-react"

interface UserProfileProps {
  user: User
  isCurrentUser?: boolean
}

export function UserProfile({ user, isCurrentUser = false }: UserProfileProps) {
  const handleViewCredits = () => {
    window.location.href = "/credits"
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl font-serif">{user.name}</CardTitle>
              {user.bio && <p className="text-muted-foreground mt-1">{user.bio}</p>}
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {user.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {user.rating.toFixed(1)}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {user.joinedAt.toLocaleDateString()}
                </div>
                {isCurrentUser && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewCredits}
                    className="flex items-center gap-1 text-primary font-medium hover:bg-primary/10"
                  >
                    <Coins className="h-4 w-4" />
                    {user.credits} credits
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Skills Offered</h3>
            <div className="flex flex-wrap gap-2">
              {user.skillsOffered.map((skill) => (
                <Badge key={skill} variant="default">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Skills Wanted</h3>
            <div className="flex flex-wrap gap-2">
              {user.skillsWanted.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
            <span>{user.completedTrades} completed trades</span>
            <span>Member since {user.joinedAt.getFullYear()}</span>
          </div>
        </CardContent>
      </Card>

      {isCurrentUser && <CreditBalance userId={user.id} showTransactions={true} />}
    </div>
  )
}
