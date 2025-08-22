"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProposalCard } from "@/components/proposal-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AuthService, type User } from "@/lib/auth"
import { ProposalService, type BarterProposal } from "@/lib/proposals"
import { MessageService } from "@/lib/messages"
import { Heart, ArrowLeft, Inbox, Send, CheckCircle } from "lucide-react"

export default function ProposalsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sentProposals, setSentProposals] = useState<BarterProposal[]>([])
  const [receivedProposals, setReceivedProposals] = useState<BarterProposal[]>([])
  const [selectedProposal, setSelectedProposal] = useState<BarterProposal | null>(null)
  const [showMeetingDialog, setShowMeetingDialog] = useState(false)
  const [meetingLocation, setMeetingLocation] = useState("")
  const [meetingTime, setMeetingTime] = useState("")
  const [meetingNotes, setMeetingNotes] = useState("")
  const router = useRouter()

  useEffect(() => {
    const auth = AuthService.getStoredAuth()
    setUser(auth.user)
    setIsAuthenticated(auth.isAuthenticated)

    if (!auth.isAuthenticated) {
      router.push("/")
      return
    }

    loadProposals(auth.user!.id)
  }, [router])

  const loadProposals = (userId: string) => {
    const { sent, received } = ProposalService.getProposalsForUser(userId)
    setSentProposals(sent)
    setReceivedProposals(received)
  }

  const handleAccept = (proposal: BarterProposal) => {
    setSelectedProposal(proposal)
    setShowMeetingDialog(true)
  }

  const handleDecline = (proposal: BarterProposal) => {
    ProposalService.updateProposalStatus(proposal.id, "declined")
    loadProposals(user!.id)
  }

  const handleComplete = (proposal: BarterProposal) => {
    ProposalService.updateProposalStatus(proposal.id, "completed")

    // Update user credits if applicable
    if (proposal.proposalType === "credits-for-skill" && proposal.toUserId === user!.id) {
      const updatedUser = { ...user!, credits: user!.credits + (proposal.offeredCredits || 0) }
      AuthService.updateUser(updatedUser)
      setUser(updatedUser)
    } else if (proposal.proposalType === "skill-for-credits" && proposal.fromUserId === user!.id) {
      const updatedUser = { ...user!, credits: user!.credits + (proposal.requestedCredits || 0) }
      AuthService.updateUser(updatedUser)
      setUser(updatedUser)
    }

    loadProposals(user!.id)
  }

  const handleCancel = (proposal: BarterProposal) => {
    ProposalService.updateProposalStatus(proposal.id, "cancelled")
    loadProposals(user!.id)
  }

  const handleSendMessage = (proposal: BarterProposal) => {
    const otherUserId = proposal.fromUserId === user!.id ? proposal.toUserId : proposal.fromUserId
    const otherUserName = proposal.fromUserId === user!.id ? proposal.toUserName : proposal.fromUserName
    const otherUserAvatar = proposal.fromUserId === user!.id ? proposal.toUserAvatar : proposal.fromUserAvatar

    // Send a message to start/continue conversation
    MessageService.sendMessage(
      user!.id,
      user!.name,
      user!.avatar,
      otherUserId,
      otherUserName,
      otherUserAvatar,
      `Hi! I wanted to discuss our proposal about ${proposal.offeredSkillTitle || "the trade"}.`,
      proposal.id,
    )

    // Redirect to messages page
    router.push("/messages")
  }

  const handleConfirmAccept = () => {
    if (!selectedProposal) return

    const meetingDetails = {
      location: meetingLocation.trim() || undefined,
      time: meetingTime ? new Date(meetingTime) : undefined,
      notes: meetingNotes.trim() || undefined,
    }

    ProposalService.updateProposalStatus(selectedProposal.id, "accepted", meetingDetails)

    // Update user credits if applicable
    if (selectedProposal.proposalType === "credits-for-skill" && selectedProposal.fromUserId === user!.id) {
      const updatedUser = { ...user!, credits: user!.credits - (selectedProposal.offeredCredits || 0) }
      AuthService.updateUser(updatedUser)
      setUser(updatedUser)
    }

    loadProposals(user!.id)
    setShowMeetingDialog(false)
    setSelectedProposal(null)
    setMeetingLocation("")
    setMeetingTime("")
    setMeetingNotes("")
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

  const pendingReceived = receivedProposals.filter((p) => p.status === "pending").length
  const activeProposals = [...sentProposals, ...receivedProposals].filter(
    (p) => p.status === "accepted" || p.status === "pending",
  ).length

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
              <Heart className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-serif font-bold text-primary">Lovable</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/messages")}>
              Messages
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
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Your Barter Proposals</h2>
          <p className="text-muted-foreground">Manage your skill trading proposals and agreements</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Inbox className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{pendingReceived}</div>
              <p className="text-xs text-muted-foreground">Awaiting your response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{activeProposals}</div>
              <p className="text-xs text-muted-foreground">In progress or pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Trades</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{user.completedTrades}</div>
              <p className="text-xs text-muted-foreground">Successful exchanges</p>
            </CardContent>
          </Card>
        </div>

        {/* Proposals Tabs */}
        <Tabs defaultValue="received" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
            <TabsTrigger value="received">Received ({receivedProposals.length})</TabsTrigger>
            <TabsTrigger value="sent">Sent ({sentProposals.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {receivedProposals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <div className="text-muted-foreground">
                    <p className="text-lg mb-2">No proposals received yet</p>
                    <p className="text-sm">When others want to trade with you, their proposals will appear here</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {receivedProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    currentUserId={user.id}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onComplete={handleComplete}
                    onSendMessage={handleSendMessage}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sentProposals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <div className="text-muted-foreground">
                    <p className="text-lg mb-2">No proposals sent yet</p>
                    <p className="text-sm">Browse the skill board to find skills you'd like to trade for</p>
                  </div>
                  <Button onClick={() => router.push("/skills")} className="mt-4">
                    Browse Skills
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sentProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    currentUserId={user.id}
                    onCancel={handleCancel}
                    onComplete={handleComplete}
                    onSendMessage={handleSendMessage}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Meeting Details Dialog */}
        <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accept Proposal</DialogTitle>
              <DialogDescription>Set up meeting details for your skill trade (optional)</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Meeting Location</Label>
                <Input
                  id="location"
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                  placeholder="e.g., Coffee shop on Main St, My workshop, Online"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Preferred Time</Label>
                <Input
                  id="time"
                  type="datetime-local"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  placeholder="Any special instructions or requirements..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowMeetingDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleConfirmAccept} className="flex-1">
                Accept Proposal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
