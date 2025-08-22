"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SkillOfferCard, SkillRequestCard } from "@/components/skill-card"
import { SkillRecommendations } from "@/components/skill-recommendations"
import { SkillService, type SkillOffer, type SkillRequest, type SkillCategory, SKILL_CATEGORIES } from "@/lib/skills"
import { AuthService } from "@/lib/auth"
import { Search, Filter, Plus, Sparkles } from "lucide-react"

interface SkillBoardProps {
  onContactOffer: (offer: SkillOffer) => void
  onContactRequest: (request: SkillRequest) => void
  onCreateOffer: () => void
  onCreateRequest: () => void
}

export function SkillBoard({ onContactOffer, onContactRequest, onCreateOffer, onCreateRequest }: SkillBoardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | "all">("all")
  const [offers, setOffers] = useState<SkillOffer[]>([])
  const [requests, setRequests] = useState<SkillRequest[]>([])
  const [activeTab, setActiveTab] = useState("recommendations")
  const [currentUser, setCurrentUser] = useState(AuthService.getStoredAuth().user)

  useEffect(() => {
    loadSkills()
  }, [searchQuery, selectedCategory])

  const loadSkills = () => {
    const categoryFilter = selectedCategory === "all" ? undefined : selectedCategory
    const filteredOffers = SkillService.searchOffers(searchQuery, categoryFilter)
    const filteredRequests = SkillService.searchRequests(searchQuery, categoryFilter)

    setOffers(filteredOffers)
    setRequests(filteredRequests)
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category as SkillCategory | "all")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Community Skill Exchange</h2>
        <p className="text-muted-foreground">Discover perfect skill matches and grow together</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search skills, people, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={handleCategorySelect}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {SKILL_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <span className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Category Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategory === "all" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => handleCategorySelect("all")}
        >
          All Skills
        </Badge>
        {SKILL_CATEGORIES.slice(0, 6).map((category) => (
          <Badge
            key={category.value}
            variant={selectedCategory === category.value ? "default" : "outline"}
            className="cursor-pointer flex items-center gap-1"
            onClick={() => handleCategorySelect(category.value)}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </Badge>
        ))}
      </div>

      {/* Enhanced Tabs with Recommendations */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              For You
            </TabsTrigger>
            <TabsTrigger value="offers">Available ({offers.length})</TabsTrigger>
            <TabsTrigger value="requests">Wanted ({requests.length})</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button onClick={onCreateOffer} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Offer Skill
            </Button>
            <Button
              onClick={onCreateRequest}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
            >
              <Plus className="h-4 w-4" />
              Request Skill
            </Button>
          </div>
        </div>

        <TabsContent value="recommendations" className="space-y-6">
          {currentUser ? (
            <SkillRecommendations currentUser={currentUser} onContactOffer={onContactOffer} />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground">
                  <p className="text-lg mb-2">Sign in to see personalized recommendations</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          {offers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground">
                  <p className="text-lg mb-2">No skill offers found</p>
                  <p className="text-sm">Try adjusting your search or browse different categories</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <SkillOfferCard key={offer.id} offer={offer} onContact={onContactOffer} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground">
                  <p className="text-lg mb-2">No skill requests found</p>
                  <p className="text-sm">Try adjusting your search or browse different categories</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => (
                <SkillRequestCard key={request.id} request={request} onContact={onContactRequest} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
