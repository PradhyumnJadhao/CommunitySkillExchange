"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SkillBoard } from "@/components/skill-board"
import { CreateProposalDialog } from "@/components/create-proposal-dialog"
import { CreateSkillDialog } from "@/components/create-skill-dialog"
import { Button } from "@/components/ui/button"
import { AuthService, type User } from "@/lib/auth"
import { SkillService, type SkillOffer, type SkillRequest } from "@/lib/skills"
import { ProposalService } from "@/lib/proposals"
import { GraduationCap, ArrowLeft } from "lucide-react"

export default function SkillsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userSkills, setUserSkills] = useState<SkillOffer[]>([])
  const [selectedSkill, setSelectedSkill] = useState<SkillOffer | SkillRequest | null>(null)
  const [showProposalDialog, setShowProposalDialog] = useState(false)
  const [showCreateSkillDialog, setShowCreateSkillDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const auth = AuthService.getStoredAuth()
    setUser(auth.user)
    setIsAuthenticated(auth.isAuthenticated)

    if (!auth.isAuthenticated) {
      router.push("/")
      return
    }

    // Load user's skills
    const offers = SkillService.getStoredOffers()
    const mySkills = offers.filter((offer) => offer.userId === auth.user!.id)
    setUserSkills(mySkills)
  }, [router])

  const handleContactOffer = (offer: SkillOffer) => {
    if (offer.userId === user?.id) {
      // Can't propose to yourself
      return
    }
    setSelectedSkill(offer)
    setShowProposalDialog(true)
  }

  const handleContactRequest = (request: SkillRequest) => {
    if (request.userId === user?.id) {
      // Can't propose to yourself
      return
    }
    setSelectedSkill(request)
    setShowProposalDialog(true)
  }

  const handleCreateProposal = (proposalData: any) => {
    ProposalService.createProposal(proposalData)

    // Update user credits if offering credits
    if (proposalData.proposalType === "credits-for-skill" && user) {
      const updatedUser = { ...user, credits: user.credits - proposalData.offeredCredits }
      AuthService.updateUser(updatedUser)
      setUser(updatedUser)
    }

    // Show success message or redirect
    router.push("/proposals")
  }

  const handleCreateOffer = () => {
    setShowCreateSkillDialog(true)
  }

  const handleCreateSkill = (skillData: Omit<SkillOffer, "id" | "createdAt">) => {
    const newSkill = SkillService.addOffer(skillData)

    // Update user's skills list
    const updatedUserSkills = [...userSkills, newSkill]
    setUserSkills(updatedUserSkills)
  }

  const handleCreateRequest = () => {
    // TODO: Implement create request form
    console.log("Create request")
  }

  const handleLogout = () => {
    AuthService.logout()
    router.push("/")
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-card to-background flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
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
            <Button variant="ghost" size="sm" onClick={() => router.push("/proposals")}>
              View Proposals
            </Button>
            <span className="text-sm text-muted-foreground">Welcome, {user?.name}!</span>
            <Button variant="outline" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <SkillBoard
          onContactOffer={handleContactOffer}
          onContactRequest={handleContactRequest}
          onCreateOffer={handleCreateOffer}
          onCreateRequest={handleCreateRequest}
        />
      </main>

      {/* Create Skill Dialog */}
      <CreateSkillDialog
        open={showCreateSkillDialog}
        onOpenChange={setShowCreateSkillDialog}
        currentUser={user!}
        onCreateSkill={handleCreateSkill}
      />

      {/* Create Proposal Dialog */}
      <CreateProposalDialog
        open={showProposalDialog}
        onOpenChange={setShowProposalDialog}
        targetSkill={selectedSkill}
        currentUser={user!}
        userSkills={userSkills}
        onCreateProposal={handleCreateProposal}
      />
    </div>
  )
}
