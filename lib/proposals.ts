export interface BarterProposal {
  id: string
  fromUserId: string
  fromUserName: string
  fromUserAvatar?: string
  toUserId: string
  toUserName: string
  toUserAvatar?: string

  // What the proposer is offering
  offeredSkillId?: string
  offeredSkillTitle?: string
  offeredCredits?: number

  // What they want in return
  requestedSkillId?: string
  requestedSkillTitle?: string
  requestedCredits?: number

  // Proposal details
  message: string
  proposalType: "skill-for-skill" | "skill-for-credits" | "credits-for-skill"
  status: "pending" | "accepted" | "declined" | "completed" | "cancelled"
  createdAt: Date
  respondedAt?: Date
  completedAt?: Date

  // Meeting details (filled when accepted)
  meetingLocation?: string
  meetingTime?: Date
  meetingNotes?: string
}

// Mock data for demo
const mockProposals: BarterProposal[] = [
  {
    id: "1",
    fromUserId: "2",
    fromUserName: "Mike Chen",
    fromUserAvatar: "/friendly-man-tools.png",
    toUserId: "1",
    toUserName: "Sarah Johnson",
    toUserAvatar: "/friendly-woman-smiling.png",
    offeredSkillId: "2",
    offeredSkillTitle: "Basic Home Plumbing",
    requestedSkillId: "1",
    requestedSkillTitle: "Italian Cooking Classes",
    message:
      "Hi Sarah! I saw your Italian cooking class offer. I can help with any plumbing issues you might have in exchange for learning to make authentic pasta. Let me know if you're interested!",
    proposalType: "skill-for-skill",
    status: "pending",
    createdAt: new Date("2024-01-23"),
  },
  {
    id: "2",
    fromUserId: "1",
    fromUserName: "Sarah Johnson",
    fromUserAvatar: "/friendly-woman-smiling.png",
    toUserId: "2",
    toUserName: "Mike Chen",
    toUserAvatar: "/friendly-man-tools.png",
    offeredCredits: 2,
    requestedSkillId: "4",
    requestedSkillTitle: "Computer Troubleshooting",
    message:
      "Hey Mike! My laptop has been running really slow lately. I can offer 2 credits for some tech support help. Would that work for you?",
    proposalType: "credits-for-skill",
    status: "accepted",
    createdAt: new Date("2024-01-22"),
    respondedAt: new Date("2024-01-22"),
    meetingLocation: "Coffee shop on Main St",
    meetingTime: new Date("2024-01-25T14:00:00"),
  },
]

const PROPOSALS_STORAGE_KEY = "skillio_proposals"

import { CreditService } from "./credits"
import { AuthService } from "./auth"

export class ProposalService {
  static getStoredProposals(): BarterProposal[] {
    if (typeof window === "undefined") return mockProposals

    const stored = localStorage.getItem(PROPOSALS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((proposal: any) => ({
        ...proposal,
        createdAt: new Date(proposal.createdAt),
        respondedAt: proposal.respondedAt ? new Date(proposal.respondedAt) : undefined,
        completedAt: proposal.completedAt ? new Date(proposal.completedAt) : undefined,
        meetingTime: proposal.meetingTime ? new Date(proposal.meetingTime) : undefined,
      }))
    }

    // Initialize with mock data
    this.setStoredProposals(mockProposals)
    return mockProposals
  }

  static setStoredProposals(proposals: BarterProposal[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(proposals))
  }

  static createProposal(proposal: Omit<BarterProposal, "id" | "createdAt" | "status">): BarterProposal {
    const newProposal: BarterProposal = {
      ...proposal,
      id: Date.now().toString(),
      status: "pending",
      createdAt: new Date(),
    }

    const proposals = this.getStoredProposals()
    proposals.push(newProposal)
    this.setStoredProposals(proposals)

    return newProposal
  }

  static getProposalsForUser(userId: string): {
    sent: BarterProposal[]
    received: BarterProposal[]
  } {
    const proposals = this.getStoredProposals()

    return {
      sent: proposals.filter((p) => p.fromUserId === userId),
      received: proposals.filter((p) => p.toUserId === userId),
    }
  }

  static updateProposalStatus(
    proposalId: string,
    status: BarterProposal["status"],
    meetingDetails?: {
      location?: string
      time?: Date
      notes?: string
    },
  ): BarterProposal | null {
    const proposals = this.getStoredProposals()
    const index = proposals.findIndex((p) => p.id === proposalId)

    if (index === -1) return null

    const proposal = proposals[index]

    if (status === "accepted" && proposal.status === "pending") {
      // Handle credit transfers based on proposal type
      if (proposal.proposalType === "credits-for-skill" && proposal.offeredCredits) {
        // Transfer credits from proposer to skill provider
        const result = CreditService.transferCredits(
          proposal.fromUserId,
          proposal.toUserId,
          proposal.offeredCredits,
          `Payment for ${proposal.requestedSkillTitle}`,
          undefined,
          proposalId,
        )

        if (!result.success) {
          console.error("Credit transfer failed:", result.error)
          return null
        }
      } else if (proposal.proposalType === "skill-for-credits" && proposal.requestedCredits) {
        // Transfer credits from skill requester to skill provider
        const result = CreditService.transferCredits(
          proposal.toUserId,
          proposal.fromUserId,
          proposal.requestedCredits,
          `Payment for ${proposal.offeredSkillTitle}`,
          undefined,
          proposalId,
        )

        if (!result.success) {
          console.error("Credit transfer failed:", result.error)
          return null
        }
      }
    }

    if (status === "completed" && proposal.status === "accepted") {
      // Award 1 bonus credit to both parties for completing a trade
      CreditService.awardBonusCredits(
        proposal.fromUserId,
        1,
        `Trade completion bonus for ${proposal.offeredSkillTitle || "credit trade"}`,
      )

      CreditService.awardBonusCredits(
        proposal.toUserId,
        1,
        `Trade completion bonus for ${proposal.requestedSkillTitle || "credit trade"}`,
      )

      // Update user completed trades count
      const users = AuthService.getAllUsers()
      const fromUser = users.find((u) => u.id === proposal.fromUserId)
      const toUser = users.find((u) => u.id === proposal.toUserId)

      if (fromUser) {
        fromUser.completedTrades += 1
        AuthService.updateUser(fromUser)
      }

      if (toUser) {
        toUser.completedTrades += 1
        AuthService.updateUser(toUser)
      }
    }

    proposals[index] = {
      ...proposals[index],
      status,
      respondedAt: status === "accepted" || status === "declined" ? new Date() : proposals[index].respondedAt,
      completedAt: status === "completed" ? new Date() : proposals[index].completedAt,
      meetingLocation: meetingDetails?.location || proposals[index].meetingLocation,
      meetingTime: meetingDetails?.time || proposals[index].meetingTime,
      meetingNotes: meetingDetails?.notes || proposals[index].meetingNotes,
    }

    this.setStoredProposals(proposals)
    return proposals[index]
  }

  static getProposal(proposalId: string): BarterProposal | null {
    const proposals = this.getStoredProposals()
    return proposals.find((p) => p.id === proposalId) || null
  }
}
