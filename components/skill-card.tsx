"use client"

import type { SkillOffer, SkillRequest } from "@/lib/skills"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Star, Clock, AlertCircle } from "lucide-react"
import { SKILL_CATEGORIES } from "@/lib/skills"

interface SkillOfferCardProps {
  offer: SkillOffer
  onContact: (offer: SkillOffer) => void
}

interface SkillRequestCardProps {
  request: SkillRequest
  onContact: (request: SkillRequest) => void
}

export function SkillOfferCard({ offer, onContact }: SkillOfferCardProps) {
  const category = SKILL_CATEGORIES.find((cat) => cat.value === offer.category)

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={offer.userAvatar || "/placeholder.svg"} alt={offer.userName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {offer.userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-serif">{offer.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{offer.userName}</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{offer.userRating}</span>
                </div>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <span>{category?.icon}</span>
            <span>{category?.label}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{offer.description}</p>

        <div className="flex flex-wrap gap-2">
          {offer.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            {offer.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{offer.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{offer.availability}</span>
            </div>
          </div>
          <span>{offer.completedTrades} trades completed</span>
        </div>

        <Button onClick={() => onContact(offer)} className="w-full" size="sm">
          Propose Trade
        </Button>
      </CardContent>
    </Card>
  )
}

export function SkillRequestCard({ request, onContact }: SkillRequestCardProps) {
  const category = SKILL_CATEGORIES.find((cat) => cat.value === request.category)
  const urgencyColors = {
    low: "text-green-600",
    medium: "text-yellow-600",
    high: "text-red-600",
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-accent">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={request.userAvatar || "/placeholder.svg"} alt={request.userName} />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                {request.userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-serif">{request.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{request.userName}</span>
                <div className={`flex items-center gap-1 ${urgencyColors[request.urgency]}`}>
                  <AlertCircle className="h-3 w-3" />
                  <span className="capitalize">{request.urgency} priority</span>
                </div>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <span>{category?.icon}</span>
            <span>{category?.label}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{request.description}</p>

        <div className="flex flex-wrap gap-2">
          {request.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {request.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{request.location}</span>
            </div>
          )}
          <span>Posted {request.createdAt.toLocaleDateString()}</span>
        </div>

        <Button onClick={() => onContact(request)} variant="outline" className="w-full" size="sm">
          Propose Trade
        </Button>
      </CardContent>
    </Card>
  )
}
