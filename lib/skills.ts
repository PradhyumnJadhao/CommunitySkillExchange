// Skill management system
export interface SkillOffer {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  userRating: number
  title: string
  description: string
  category: SkillCategory
  tags: string[]
  location?: string
  availability: string
  isActive: boolean
  createdAt: Date
  completedTrades: number
}

export interface SkillRequest {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  title: string
  description: string
  category: SkillCategory
  tags: string[]
  location?: string
  urgency: "low" | "medium" | "high"
  isActive: boolean
  createdAt: Date
}

export type SkillCategory =
  | "teaching"
  | "repairs"
  | "cooking"
  | "technology"
  | "arts-crafts"
  | "fitness"
  | "music"
  | "languages"
  | "gardening"
  | "other"

export const SKILL_CATEGORIES: { value: SkillCategory; label: string; icon: string }[] = [
  { value: "teaching", label: "Teaching & Tutoring", icon: "📚" },
  { value: "repairs", label: "Home & Repairs", icon: "🔧" },
  { value: "cooking", label: "Cooking & Baking", icon: "👨‍🍳" },
  { value: "technology", label: "Technology & IT", icon: "💻" },
  { value: "arts-crafts", label: "Arts & Crafts", icon: "🎨" },
  { value: "fitness", label: "Fitness & Sports", icon: "💪" },
  { value: "music", label: "Music & Performance", icon: "🎵" },
  { value: "languages", label: "Languages", icon: "🗣️" },
  { value: "gardening", label: "Gardening & Plants", icon: "🌱" },
  { value: "other", label: "Other Skills", icon: "✨" },
]

// Mock data for demo
const mockSkillOffers: SkillOffer[] = [
  {
    id: "1",
    userId: "1",
    userName: "Sarah Johnson",
    userAvatar: "/friendly-woman-smiling.png",
    userRating: 4.8,
    title: "Italian Cooking Classes",
    description: "Learn to make authentic Italian pasta, risotto, and traditional sauces. Perfect for beginners!",
    category: "cooking",
    tags: ["pasta", "italian", "beginner-friendly"],
    location: "Downtown",
    availability: "Weekends",
    isActive: true,
    createdAt: new Date("2024-01-20"),
    completedTrades: 8,
  },
  {
    id: "2",
    userId: "2",
    userName: "Mike Chen",
    userAvatar: "/friendly-man-tools.png",
    userRating: 4.9,
    title: "Basic Home Plumbing",
    description: "Fix leaky faucets, unclog drains, and basic pipe repairs. Bring your own tools!",
    category: "repairs",
    tags: ["plumbing", "home-repair", "hands-on"],
    location: "Midtown",
    availability: "Evenings & Weekends",
    isActive: true,
    createdAt: new Date("2024-01-18"),
    completedTrades: 12,
  },
  {
    id: "3",
    userId: "1",
    userName: "Sarah Johnson",
    userAvatar: "/friendly-woman-smiling.png",
    userRating: 4.8,
    title: "Beginner Guitar Lessons",
    description: "Learn basic chords, strumming patterns, and play your first songs. Guitar provided.",
    category: "music",
    tags: ["guitar", "beginner", "acoustic"],
    location: "Downtown",
    availability: "Flexible",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    completedTrades: 5,
  },
  {
    id: "4",
    userId: "2",
    userName: "Mike Chen",
    userAvatar: "/friendly-man-tools.png",
    title: "Computer Troubleshooting",
    description: "Help with slow computers, virus removal, software installation, and basic tech support.",
    category: "technology",
    tags: ["computer", "troubleshooting", "tech-support"],
    location: "Midtown",
    availability: "Weekdays after 6pm",
    isActive: true,
    createdAt: new Date("2024-01-22"),
    completedTrades: 15,
  },
]

const mockSkillRequests: SkillRequest[] = [
  {
    id: "1",
    userId: "1",
    userName: "Sarah Johnson",
    userAvatar: "/friendly-woman-smiling.png",
    title: "Photography Basics",
    description: "Looking to learn portrait photography and photo editing. Have a DSLR camera.",
    category: "arts-crafts",
    tags: ["photography", "portraits", "editing"],
    location: "Downtown",
    urgency: "medium",
    isActive: true,
    createdAt: new Date("2024-01-19"),
  },
  {
    id: "2",
    userId: "2",
    userName: "Mike Chen",
    userAvatar: "/friendly-man-tools.png",
    title: "Spanish Conversation Practice",
    description: "Intermediate Spanish speaker looking for conversation practice with native speaker.",
    category: "languages",
    tags: ["spanish", "conversation", "intermediate"],
    location: "Midtown",
    urgency: "low",
    isActive: true,
    createdAt: new Date("2024-01-21"),
  },
]

// Local storage keys
const SKILL_OFFERS_KEY = "skillio_skill_offers"
const SKILL_REQUESTS_KEY = "skillio_skill_requests"

export class SkillService {
  static getStoredOffers(): SkillOffer[] {
    if (typeof window === "undefined") return mockSkillOffers

    const stored = localStorage.getItem(SKILL_OFFERS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((offer: any) => ({
        ...offer,
        createdAt: new Date(offer.createdAt),
      }))
    }

    // Initialize with mock data
    this.setStoredOffers(mockSkillOffers)
    return mockSkillOffers
  }

  static setStoredOffers(offers: SkillOffer[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(SKILL_OFFERS_KEY, JSON.stringify(offers))
  }

  static getStoredRequests(): SkillRequest[] {
    if (typeof window === "undefined") return mockSkillRequests

    const stored = localStorage.getItem(SKILL_REQUESTS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((request: any) => ({
        ...request,
        createdAt: new Date(request.createdAt),
      }))
    }

    // Initialize with mock data
    this.setStoredRequests(mockSkillRequests)
    return mockSkillRequests
  }

  static setStoredRequests(requests: SkillRequest[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(SKILL_REQUESTS_KEY, JSON.stringify(requests))
  }

  static searchOffers(query: string, category?: SkillCategory): SkillOffer[] {
    const offers = this.getStoredOffers()
    let filtered = offers.filter((offer) => offer.isActive)

    if (category && category !== "other") {
      filtered = filtered.filter((offer) => offer.category === category)
    }

    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      filtered = filtered.filter(
        (offer) =>
          offer.title.toLowerCase().includes(searchTerm) ||
          offer.description.toLowerCase().includes(searchTerm) ||
          offer.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
          offer.userName.toLowerCase().includes(searchTerm),
      )
    }

    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  static searchRequests(query: string, category?: SkillCategory): SkillRequest[] {
    const requests = this.getStoredRequests()
    let filtered = requests.filter((request) => request.isActive)

    if (category && category !== "other") {
      filtered = filtered.filter((request) => request.category === category)
    }

    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      filtered = filtered.filter(
        (request) =>
          request.title.toLowerCase().includes(searchTerm) ||
          request.description.toLowerCase().includes(searchTerm) ||
          request.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
          request.userName.toLowerCase().includes(searchTerm),
      )
    }

    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  static addOffer(offer: Omit<SkillOffer, "id" | "createdAt">): SkillOffer {
    const newOffer: SkillOffer = {
      ...offer,
      id: Date.now().toString(),
      createdAt: new Date(),
    }

    const offers = this.getStoredOffers()
    offers.push(newOffer)
    this.setStoredOffers(offers)

    return newOffer
  }

  static addRequest(request: Omit<SkillRequest, "id" | "createdAt">): SkillRequest {
    const newRequest: SkillRequest = {
      ...request,
      id: Date.now().toString(),
      createdAt: new Date(),
    }

    const requests = this.getStoredRequests()
    requests.push(newRequest)
    this.setStoredRequests(requests)

    return newRequest
  }

  static findMatchingSkills(userSkills: string[], targetCategory?: SkillCategory): SkillOffer[] {
    const offers = this.getStoredOffers()
    let matches: SkillOffer[] = []

    // First, find exact skill matches
    const exactMatches = offers.filter(
      (offer) =>
        offer.isActive &&
        userSkills.some(
          (skill) =>
            offer.title.toLowerCase().includes(skill.toLowerCase()) ||
            offer.tags.some((tag) => tag.toLowerCase().includes(skill.toLowerCase())),
        ),
    )

    // Then, find category matches
    const categoryMatches = targetCategory
      ? offers.filter((offer) => offer.isActive && offer.category === targetCategory)
      : []

    // Combine and deduplicate
    matches = [...exactMatches]
    categoryMatches.forEach((offer) => {
      if (!matches.find((m) => m.id === offer.id)) {
        matches.push(offer)
      }
    })

    // Sort by relevance (completed trades and rating)
    return matches.sort((a, b) => {
      const scoreA = a.completedTrades * 0.3 + a.userRating * 0.7
      const scoreB = b.completedTrades * 0.3 + b.userRating * 0.7
      return scoreB - scoreA
    })
  }

  static calculateSkillCompatibility(offer: SkillOffer, userSkills: string[]): number {
    let score = 0

    // Check title matches
    userSkills.forEach((skill) => {
      if (offer.title.toLowerCase().includes(skill.toLowerCase())) {
        score += 3
      }
    })

    // Check tag matches
    offer.tags.forEach((tag) => {
      userSkills.forEach((skill) => {
        if (tag.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(tag.toLowerCase())) {
          score += 2
        }
      })
    })

    // Bonus for high-rated users
    if (offer.userRating >= 4.5) score += 1

    // Bonus for experienced traders
    if (offer.completedTrades >= 10) score += 1

    return score
  }

  static getSkillRecommendations(userId: string, userSkillsWanted: string[]): SkillOffer[] {
    const offers = this.getStoredOffers()
    const userOffers = offers.filter((offer) => offer.userId === userId)
    const userCategories = [...new Set(userOffers.map((offer) => offer.category))]

    const recommendations: SkillOffer[] = []

    // Find skills in categories user is interested in
    userCategories.forEach((category) => {
      const categoryOffers = offers.filter(
        (offer) => offer.isActive && offer.category === category && offer.userId !== userId,
      )
      recommendations.push(...categoryOffers)
    })

    // Find skills matching what user wants to learn
    userSkillsWanted.forEach((wantedSkill) => {
      const matchingOffers = offers.filter(
        (offer) =>
          offer.isActive &&
          offer.userId !== userId &&
          (offer.title.toLowerCase().includes(wantedSkill.toLowerCase()) ||
            offer.tags.some((tag) => tag.toLowerCase().includes(wantedSkill.toLowerCase()))),
      )
      recommendations.push(...matchingOffers)
    })

    // Remove duplicates and sort by compatibility
    const uniqueRecommendations = recommendations.filter(
      (offer, index, self) => index === self.findIndex((o) => o.id === offer.id),
    )

    return uniqueRecommendations
      .map((offer) => ({
        ...offer,
        compatibilityScore: this.calculateSkillCompatibility(offer, userSkillsWanted),
      }))
      .sort((a, b) => (b as any).compatibilityScore - (a as any).compatibilityScore)
      .slice(0, 10) // Return top 10 recommendations
  }
}

export const skillCategories = SKILL_CATEGORIES.map((cat) => ({
  name: cat.label,
  value: cat.value,
  icon: cat.icon,
  skills: getSkillsForCategory(cat.value),
}))

function getSkillsForCategory(category: SkillCategory): string[] {
  const skillMap: Record<SkillCategory, string[]> = {
    teaching: ["Math Tutoring", "English Lessons", "Science Help", "Test Prep"],
    repairs: ["Plumbing", "Electrical Work", "Carpentry", "Appliance Repair"],
    cooking: ["Italian Cooking", "Baking", "Meal Planning", "Healthy Cooking"],
    technology: ["Computer Repair", "Web Development", "Tech Support", "Software Training"],
    "arts-crafts": ["Painting", "Photography", "Pottery", "Jewelry Making"],
    fitness: ["Personal Training", "Yoga", "Running Coach", "Nutrition Advice"],
    music: ["Guitar Lessons", "Piano Lessons", "Voice Training", "Music Theory"],
    languages: ["Spanish", "French", "English", "Conversation Practice"],
    gardening: ["Vegetable Gardening", "Plant Care", "Landscaping", "Composting"],
    other: ["Pet Care", "Childcare", "Organization", "Life Coaching"],
  }
  return skillMap[category] || []
}
