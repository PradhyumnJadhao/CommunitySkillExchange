"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { SkillOffer, SkillRequest } from "@/lib/skills"
import type { User } from "@/lib/auth"
import type { BarterProposal } from "@/lib/proposals"
import { ArrowRight, Coins } from "lucide-react"

interface CreateProposalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetSkill: SkillOffer | SkillRequest | null
  currentUser: User
  userSkills: SkillOffer[]
  onCreateProposal: (proposal: Omit<BarterProposal, "id" | "createdAt" | "status">) => void
}

export function CreateProposalDialog({
  open,
  onOpenChange,
  targetSkill,
  currentUser,
  userSkills,
  onCreateProposal,
}: CreateProposalDialogProps) {
  const [proposalType, setProposalType] = useState<"skill-for-skill" | "credits-for-skill" | "skill-for-credits">(
    "skill-for-skill",
  )
  const [selectedSkillId, setSelectedSkillId] = useState<string>("")
  const [creditAmount, setCreditAmount] = useState<number>(1)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isTargetOffer = targetSkill && "userRating" in targetSkill
  const targetUser = targetSkill
    ? {
        id: targetSkill.userId,
        name: targetSkill.userName,
        avatar: targetSkill.userAvatar,
      }
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetSkill || !targetUser) return

    setIsSubmitting(true)

    const baseProposal = {
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserAvatar: currentUser.avatar,
      toUserId: targetUser.id,
      toUserName: targetUser.name,
      toUserAvatar: targetUser.avatar,
      message: message.trim(),
      proposalType,
    }

    let proposal: Omit<BarterProposal, "id" | "createdAt" | "status">

    if (proposalType === "skill-for-skill") {
      const selectedSkill = userSkills.find((s) => s.id === selectedSkillId)
      if (!selectedSkill) return

      proposal = {
        ...baseProposal,
        offeredSkillId: selectedSkill.id,
        offeredSkillTitle: selectedSkill.title,
        requestedSkillId: targetSkill.id,
        requestedSkillTitle: targetSkill.title,
      }
    } else if (proposalType === "credits-for-skill") {
      proposal = {
        ...baseProposal,
        offeredCredits: creditAmount,
        requestedSkillId: targetSkill.id,
        requestedSkillTitle: targetSkill.title,
      }
    } else {
      // skill-for-credits
      const selectedSkill = userSkills.find((s) => s.id === selectedSkillId)
      if (!selectedSkill) return

      proposal = {
        ...baseProposal,
        offeredSkillId: selectedSkill.id,
        offeredSkillTitle: selectedSkill.title,
        requestedCredits: creditAmount,
      }
    }

    onCreateProposal(proposal)

    // Reset form
    setSelectedSkillId("")
    setCreditAmount(1)
    setMessage("")
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const canSubmit =
    message.trim() &&
    ((proposalType === "skill-for-skill" && selectedSkillId) ||
      (proposalType === "credits-for-skill" && creditAmount > 0 && creditAmount <= currentUser.credits) ||
      (proposalType === "skill-for-credits" && selectedSkillId && creditAmount > 0))

  if (!targetSkill || !targetUser) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Create Barter Proposal</DialogTitle>
          <DialogDescription>
            Propose a trade with {targetUser.name} for their {isTargetOffer ? "skill offer" : "skill request"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Skill Display */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={targetUser.avatar || "/placeholder.svg"} alt={targetUser.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {targetUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{targetSkill.title}</CardTitle>
                  <CardDescription>{targetUser.name}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{targetSkill.description}</p>
            </CardContent>
          </Card>

          {/* Proposal Type Selection */}
          <div className="space-y-3">
            <Label>What would you like to offer?</Label>
            <Select value={proposalType} onValueChange={(value: any) => setProposalType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skill-for-skill">One of my skills</SelectItem>
                <SelectItem value="credits-for-skill">Credits ({currentUser.credits} available)</SelectItem>
                {!isTargetOffer && <SelectItem value="skill-for-credits">My skill for credits</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          {/* Skill Selection */}
          {(proposalType === "skill-for-skill" || proposalType === "skill-for-credits") && (
            <div className="space-y-3">
              <Label>Select your skill to offer</Label>
              <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={userSkills.length > 0 ? "Choose from your skills" : "No skills available"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {userSkills.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      <div className="flex flex-col">
                        <span>{skill.title}</span>
                        <span className="text-xs text-muted-foreground">{skill.category}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {userSkills.length === 0 && (
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>You don't have any skills posted yet.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onOpenChange(false)
                      window.location.href = "/skills"
                    }}
                  >
                    Create Your First Skill Offer
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Credit Amount */}
          {(proposalType === "credits-for-skill" || proposalType === "skill-for-credits") && (
            <div className="space-y-3">
              <Label>{proposalType === "credits-for-skill" ? "Credits to offer" : "Credits to request"}</Label>
              <Input
                type="number"
                min="1"
                max={proposalType === "credits-for-skill" ? currentUser.credits : undefined}
                value={creditAmount}
                onChange={(e) => setCreditAmount(Number.parseInt(e.target.value) || 1)}
              />
              {proposalType === "credits-for-skill" && (
                <p className="text-sm text-muted-foreground">You have {currentUser.credits} credits available</p>
              )}
            </div>
          )}

          {/* Trade Preview */}
          {canSubmit && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm">Trade Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-1 text-center">
                    {proposalType === "credits-for-skill" ? (
                      <div className="flex items-center justify-center gap-1">
                        <Coins className="h-4 w-4 text-primary" />
                        <span className="font-medium">{creditAmount} Credits</span>
                      </div>
                    ) : (
                      <span className="font-medium">{userSkills.find((s) => s.id === selectedSkillId)?.title}</span>
                    )}
                    <p className="text-muted-foreground">You offer</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 text-center">
                    {proposalType === "skill-for-credits" ? (
                      <div className="flex items-center justify-center gap-1">
                        <Coins className="h-4 w-4 text-primary" />
                        <span className="font-medium">{creditAmount} Credits</span>
                      </div>
                    ) : (
                      <span className="font-medium">{targetSkill.title}</span>
                    )}
                    <p className="text-muted-foreground">You receive</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message */}
          <div className="space-y-3">
            <Label htmlFor="message">Message to {targetUser.name}</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and explain why you'd like to make this trade..."
              rows={4}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting} className="flex-1">
              {isSubmitting ? "Sending..." : "Send Proposal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
