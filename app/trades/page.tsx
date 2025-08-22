"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TradeCard } from "@/components/trade-card"
import { TradeDetailsDialog } from "@/components/trade-details-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthService, type User } from "@/lib/auth"
import { TradeService, type Trade } from "@/lib/trades"
import { ProposalService } from "@/lib/proposals"
import { MessageService } from "@/lib/messages"
import { Heart, ArrowLeft, Activity, CheckCircle, TrendingUp, Coins, GraduationCap } from "lucide-react"

export default function TradesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTrades, setActiveTrades] = useState<Trade[]>([])
  const [completedTrades, setCompletedTrades] = useState<Trade[]>([])
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [tradeStats, setTradeStats] = useState({
    totalTrades: 0,
    activeTrades: 0,
    completedTrades: 0,
    successRate: 0,
    totalCreditsEarned: 0,
    totalCreditsSpent: 0,
  })
  const router = useRouter()

  useEffect(() => {
    const auth = AuthService.getStoredAuth()
    setUser(auth.user)
    setIsAuthenticated(auth.isAuthenticated)

    if (!auth.isAuthenticated) {
      router.push("/")
      return
    }

    loadTrades(auth.user!.id)
  }, [router])

  const loadTrades = (userId: string) => {
    const { active, completed } = TradeService.getTradesForUser(userId)
    const stats = TradeService.getTradeStats(userId)

    setActiveTrades(active)
    setCompletedTrades(completed)
    setTradeStats(stats)
  }

  const handleViewDetails = (trade: Trade) => {
    setSelectedTrade(trade)
    setShowDetailsDialog(true)
  }

  const handleSendMessage = (trade: Trade) => {
    const otherParticipant =
      trade.participants.offerer.id === user!.id ? trade.participants.receiver : trade.participants.offerer

    // Send a message to continue conversation about the trade
    MessageService.sendMessage(
      user!.id,
      user!.name,
      user!.avatar,
      otherParticipant.id,
      otherParticipant.name,
      otherParticipant.avatar,
      `Hi! I wanted to discuss our ongoing trade about ${trade.tradeDetails.offered.skillTitle || "the exchange"}.`,
      trade.proposalId,
    )

    // Redirect to messages page
    router.push("/messages")
  }

  const handleMarkCompleted = (trade: Trade) => {
    // Update the proposal status to completed
    ProposalService.updateProposalStatus(trade.proposalId, "completed")

    // Update user's completed trades count
    if (user) {
      const updatedUser = { ...user, completedTrades: user.completedTrades + 1 }
      AuthService.updateUser(updatedUser)
      setUser(updatedUser)
    }

    // Reload trades
    loadTrades(user!.id)
  }

  const handleLogout = () => {
    AuthService.logout()
    router.push("/")
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-card to-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-card to-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-primary" />
                  <h1 className="text-2xl font-serif font-bold text-primary">Skillio</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/messages")}>
              Messages
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/proposals")}>
              Proposals
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/skills")}>
              Browse Skills
            </Button>
            <span className="text-sm text-muted-foreground">Welcome, {user.name}!</span>
            <Button variant="outline" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Trade Tracker</h2>
          <p className="text-muted-foreground">Monitor your ongoing and completed skill exchanges</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Trades</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{tradeStats.activeTrades}</div>
              <p className="text-xs text-muted-foreground">Currently in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Trades</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{tradeStats.completedTrades}</div>
              <p className="text-xs text-muted-foreground">Successfully finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{tradeStats.successRate}%</div>
              <p className="text-xs text-muted-foreground">Completion rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Balance</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                +{tradeStats.totalCreditsEarned - tradeStats.totalCreditsSpent}
              </div>
              <p className="text-xs text-muted-foreground">
                Earned {tradeStats.totalCreditsEarned}, spent {tradeStats.totalCreditsSpent}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trades Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
            <TabsTrigger value="active">Active ({activeTrades.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTrades.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeTrades.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <div className="text-muted-foreground">
                    <p className="text-lg mb-2">No active trades</p>
                    <p className="text-sm">Accept proposals to start new trades</p>
                  </div>
                  <Button onClick={() => router.push("/proposals")} className="mt-4">
                    View Proposals
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeTrades.map((trade) => (
                  <TradeCard
                    key={trade.id}
                    trade={trade}
                    currentUserId={user.id}
                    onViewDetails={handleViewDetails}
                    onSendMessage={handleSendMessage}
                    onMarkCompleted={handleMarkCompleted}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedTrades.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <div className="text-muted-foreground">
                    <p className="text-lg mb-2">No completed trades yet</p>
                    <p className="text-sm">Complete your first trade to see it here</p>
                  </div>
                  <Button onClick={() => router.push("/skills")} className="mt-4">
                    Browse Skills
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {completedTrades.map((trade) => (
                  <TradeCard
                    key={trade.id}
                    trade={trade}
                    currentUserId={user.id}
                    onViewDetails={handleViewDetails}
                    onSendMessage={handleSendMessage}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Trade Details Dialog */}
        <TradeDetailsDialog
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          trade={selectedTrade}
          currentUserId={user.id}
        />
      </main>
    </div>
  )
}
