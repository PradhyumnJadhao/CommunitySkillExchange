"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SkillOfferCard } from "@/components/skill-card"
import { SkillService, type SkillOffer } from "@/lib/skills"
import type { User } from "@/lib/auth"
import { Sparkles, TrendingUp, MapPin, Clock } from "lucide-react"

interface SkillRecommendationsProps {
  currentUser: User
  onContactOffer: (offer: SkillOffer) => void
}

export function SkillRecommendations({ currentUser, onContactOffer }: SkillRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<SkillOffer[]>([])
  const [matchingSkills, setMatchingSkills] = useState<SkillOffer[]>([])
  const [nearbySkills, setNearbySkills] = useState<SkillOffer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRecommendations()
  }, [currentUser])

  const loadRecommendations = () => {
    setIsLoading(true)

    // Get personalized recommendations based on user's interests
    const personalizedRecs = SkillService.getSkillRecommendations(currentUser.id, currentUser.skillsWanted)
    setRecommendations(personalizedRecs.slice(0, 6))

    // Get skills matching what user wants to learn
    const matching = SkillService.findMatchingSkills(currentUser.skillsWanted)
    setMatchingSkills(matching.slice(0, 4))

    // Get nearby skills (same location)
    const allOffers = SkillService.getStoredOffers()
    const nearby = allOffers
      .filter((offer) => offer.isActive && offer.userId !== currentUser.id && offer.location === currentUser.location)
      .slice(0, 4)
    setNearbySkills(nearby)

    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              <span className="ml-2 text-muted-foreground">Finding perfect matches...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-serif font-semibold">Recommended for You</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Based on your interests and learning goals</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((offer) => (
              <SkillOfferCard key={offer.id} offer={offer} onContact={onContactOffer} />
            ))}
          </div>
        </section>
      )}

      {/* Skills You Want to Learn */}
      {matchingSkills.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-serif font-semibold">Skills You Want to Learn</h3>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {currentUser.skillsWanted.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchingSkills.map((offer) => (
              <SkillOfferCard key={offer.id} offer={offer} onContact={onContactOffer} />
            ))}
          </div>
        </section>
      )}

      {/* Nearby Skills */}
      {nearbySkills.length > 0 && currentUser.location && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-serif font-semibold">Skills Near You</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Available in {currentUser.location}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbySkills.map((offer) => (
              <SkillOfferCard key={offer.id} offer={offer} onContact={onContactOffer} />
            ))}
          </div>
        </section>
      )}

      {/* Quick Match Suggestions */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quick Match Suggestions
            </CardTitle>
            <CardDescription>Skills that complement what you already offer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentUser.skillsOffered.map((skill) => {
                const complementarySkills = getComplementarySkills(skill)
                return (
                  <div key={skill} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">You teach: {skill}</p>
                      <p className="text-sm text-muted-foreground">
                        Consider learning: {complementarySkills.join(", ")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Search for complementary skills
                        const matching = SkillService.findMatchingSkills(complementarySkills)
                        if (matching.length > 0) {
                          onContactOffer(matching[0])
                        }
                      }}
                    >
                      Find Match
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function getComplementarySkills(skill: string): string[] {
  const complementaryMap: Record<string, string[]> = {
    Cooking: ["Nutrition", "Food Photography", "Meal Planning"],
    Guitar: ["Music Theory", "Songwriting", "Audio Recording"],
    Programming: ["UI Design", "Project Management", "Technical Writing"],
    Photography: ["Photo Editing", "Marketing", "Social Media"],
    Gardening: ["Composting", "Landscaping", "Plant Biology"],
    Yoga: ["Meditation", "Nutrition", "Anatomy"],
    Writing: ["Editing", "Publishing", "Marketing"],
    Math: ["Statistics", "Computer Science", "Physics"],
    Language: ["Cultural Studies", "Translation", "Teaching"],
    Repair: ["Tool Maintenance", "Safety", "Project Planning"],
  }

  // Find complementary skills based on partial matches
  for (const [key, complements] of Object.entries(complementaryMap)) {
    if (skill.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(skill.toLowerCase())) {
      return complements
    }
  }

  return ["Communication", "Time Management", "Problem Solving"]
}
