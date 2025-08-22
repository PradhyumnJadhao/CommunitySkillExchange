"use client"

import { useState, useEffect } from "react"
import { AuthForm } from "@/components/auth-form"
import { UserProfile } from "@/components/user-profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthService, type User } from "@/lib/auth"
import { MessageService } from "@/lib/messages"
import { TradeService } from "@/lib/trades"
import { GraduationCap, Users, Handshake, MessageSquare, Activity, Coins, BookOpen, Target } from "lucide-react"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeTrades, setActiveTrades] = useState(0)
  const [skillStats, setSkillStats] = useState({ skillsLearned: 0, skillsTaught: 0 })

  useEffect(() => {
    // Check for existing authentication
    const auth = AuthService.getStoredAuth()
    setUser(auth.user)
    setIsAuthenticated(auth.isAuthenticated)

    if (auth.isAuthenticated && auth.user) {
      // Get unread message count
      const count = MessageService.getUnreadCount(auth.user.id)
      setUnreadCount(count)

      // Get active trades count
      const { active } = TradeService.getTradesForUser(auth.user.id)
      setActiveTrades(active.length)

      const tradeStats = TradeService.getTradeStats(auth.user.id)
      setSkillStats({
        skillsLearned: tradeStats.skillsLearned,
        skillsTaught: tradeStats.skillsTaught,
      })
    }

    setIsLoading(false)
  }, [])

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    AuthService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  const handleExploreSkills = () => {
    window.location.href = "/skills"
  }

  const handleViewMessages = () => {
    window.location.href = "/messages"
  }

  const handleViewProposals = () => {
    window.location.href = "/proposals"
  }

  const handleViewTrades = () => {
    window.location.href = "/trades"
  }

  const handleViewProfile = () => {
    window.location.href = "/profile"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-card to-background flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading Skillio...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-card to-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-serif font-bold text-primary">Skillio</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleExploreSkills}>
              <BookOpen className="h-4 w-4 mr-2" />
              Skills
            </Button>
            <Button variant="ghost" size="sm" onClick={handleViewTrades} className="relative">
              <Activity className="h-4 w-4 mr-2" />
              Trades
              {activeTrades > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeTrades}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleViewProposals}>
              <Target className="h-4 w-4 mr-2" />
              Proposals
            </Button>
            <Button variant="ghost" size="sm" onClick={handleViewMessages} className="relative">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/credits")}>
              <Coins className="h-4 w-4 mr-2" />
              Credits
            </Button>
            <Button variant="ghost" size="sm" onClick={handleViewProfile}>
              Profile
            </Button>
            <span className="text-sm text-muted-foreground">Welcome back, {user?.name}!</span>
            <Button variant="outline" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Master New Skills Together</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn from your neighbors, teach what you know, and build a thriving skill-sharing community.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">2,847</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Skill Trades</CardTitle>
              <Handshake className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">1,234</div>
              <p className="text-xs text-muted-foreground">+8% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Learned</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{skillStats.skillsLearned}</div>
              <p className="text-xs text-muted-foreground">Your learning journey</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Taught</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{skillStats.skillsTaught}</div>
              <p className="text-xs text-muted-foreground">Knowledge shared</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleExploreSkills}>
            <CardHeader>
              <CardTitle className="text-lg font-serif">Discover Skills</CardTitle>
              <CardDescription>Find experts in your community ready to teach</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Browse Skill Library</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleExploreSkills}>
            <CardHeader>
              <CardTitle className="text-lg font-serif">Share Your Expertise</CardTitle>
              <CardDescription>Teach others and earn credits for your knowledge</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                Create Skill Offer
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* User Profile Section */}
        <div className="flex justify-center">{user && <UserProfile user={user} isCurrentUser={true} />}</div>
      </main>
    </div>
  )
}
