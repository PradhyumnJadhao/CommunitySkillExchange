import type { BarterProposal } from "./proposals"
import { ProposalService } from "./proposals"
import { CreditService } from "./credits"
import { SkillService } from "./skills"

export interface Trade {
  id: string
  proposalId: string
  participants: {
    offerer: {
      id: string
      name: string
      avatar?: string
    }
    receiver: {
      id: string
      name: string
      avatar?: string
    }
  }
  tradeDetails: {
    offered: {
      type: "skill" | "credits"
      skillTitle?: string
      skillId?: string
      skillCategory?: string
      credits?: number
    }
    requested: {
      type: "skill" | "credits"
      skillTitle?: string
      skillId?: string
      skillCategory?: string
      credits?: number
    }
  }
  status: "active" | "completed" | "cancelled"
  progress: {
    stage: "planning" | "in-progress" | "review" | "completed"
    milestones: TradeMilestone[]
    skillsDelivered: {
      offererSkillDelivered: boolean
      receiverSkillDelivered: boolean
    }
  }
  meetingDetails?: {
    location?: string
    time?: Date
    notes?: string
  }
  skillExchangeDetails?: {
    sessionDuration?: number
    skillLevel?: "beginner" | "intermediate" | "advanced"
    materialsNeeded?: string[]
    prerequisites?: string[]
  }
  startedAt: Date
  completedAt?: Date
  rating?: {
    fromOfferer?: number
    fromReceiver?: number
  }
  feedback?: {
    fromOfferer?: string
    fromReceiver?: string
  }
}

export interface TradeMilestone {
  id: string
  title: string
  description: string
  isCompleted: boolean
  completedAt?: Date
  completedBy?: string
  skillRelated?: boolean
}

export class TradeService {
  static getTradesForUser(userId: string): {
    active: Trade[]
    completed: Trade[]
  } {
    const { sent, received } = ProposalService.getProposalsForUser(userId)
    const allProposals = [...sent, ...received]

    const activeTrades: Trade[] = []
    const completedTrades: Trade[] = []

    allProposals.forEach((proposal) => {
      if (proposal.status === "accepted" || proposal.status === "completed") {
        const trade = this.convertProposalToTrade(proposal)

        if (trade.status === "completed") {
          completedTrades.push(trade)
        } else {
          activeTrades.push(trade)
        }
      }
    })

    return {
      active: activeTrades.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime()),
      completed: completedTrades.sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0)),
    }
  }

  static convertProposalToTrade(proposal: BarterProposal): Trade {
    const isCompleted = proposal.status === "completed"
    const milestones = this.generateMilestones(proposal)

    const offeredSkill = proposal.offeredSkillId
      ? SkillService.getStoredOffers().find((s) => s.id === proposal.offeredSkillId)
      : null
    const requestedSkill = proposal.requestedSkillId
      ? SkillService.getStoredOffers().find((s) => s.id === proposal.requestedSkillId)
      : null

    return {
      id: `trade_${proposal.id}`,
      proposalId: proposal.id,
      participants: {
        offerer: {
          id: proposal.fromUserId,
          name: proposal.fromUserName,
          avatar: proposal.fromUserAvatar,
        },
        receiver: {
          id: proposal.toUserId,
          name: proposal.toUserName,
          avatar: proposal.toUserAvatar,
        },
      },
      tradeDetails: {
        offered: proposal.offeredSkillId
          ? {
              type: "skill",
              skillTitle: proposal.offeredSkillTitle,
              skillId: proposal.offeredSkillId,
              skillCategory: offeredSkill?.category,
            }
          : {
              type: "credits",
              credits: proposal.offeredCredits,
            },
        requested: proposal.requestedSkillId
          ? {
              type: "skill",
              skillTitle: proposal.requestedSkillTitle,
              skillId: proposal.requestedSkillId,
              skillCategory: requestedSkill?.category,
            }
          : {
              type: "credits",
              credits: proposal.requestedCredits,
            },
      },
      status: isCompleted ? "completed" : "active",
      progress: {
        stage: isCompleted ? "completed" : "planning",
        milestones: milestones,
        skillsDelivered: {
          offererSkillDelivered: isCompleted && proposal.proposalType !== "credits-for-skill",
          receiverSkillDelivered: isCompleted && proposal.proposalType !== "skill-for-credits",
        },
      },
      meetingDetails:
        proposal.meetingLocation || proposal.meetingTime
          ? {
              location: proposal.meetingLocation,
              time: proposal.meetingTime,
              notes: proposal.meetingNotes,
            }
          : undefined,
      skillExchangeDetails:
        proposal.proposalType === "skill-for-skill"
          ? {
              sessionDuration: 60, // Default 1 hour
              skillLevel: "beginner",
              materialsNeeded: [],
              prerequisites: [],
            }
          : undefined,
      startedAt: proposal.respondedAt || proposal.createdAt,
      completedAt: proposal.completedAt,
    }
  }

  static generateMilestones(proposal: BarterProposal): TradeMilestone[] {
    const baseMilestones: TradeMilestone[] = [
      {
        id: "agreement",
        title: "Agreement Reached",
        description: "Both parties have agreed to the trade terms",
        isCompleted: proposal.status === "accepted" || proposal.status === "completed",
        completedAt: proposal.respondedAt,
        skillRelated: false,
      },
      {
        id: "meeting_scheduled",
        title: "Meeting Scheduled",
        description: "Time and place for the skill exchange has been set",
        isCompleted: !!(proposal.meetingTime || proposal.meetingLocation),
        completedAt: proposal.respondedAt,
        skillRelated: true,
      },
    ]

    if (proposal.proposalType === "skill-for-skill") {
      baseMilestones.push(
        {
          id: "skill_1_delivered",
          title: `${proposal.offeredSkillTitle} Session Completed`,
          description: `${proposal.fromUserName} has taught their skill`,
          isCompleted: proposal.status === "completed",
          completedAt: proposal.completedAt,
          skillRelated: true,
        },
        {
          id: "skill_2_delivered",
          title: `${proposal.requestedSkillTitle} Session Completed`,
          description: `${proposal.toUserName} has taught their skill`,
          isCompleted: proposal.status === "completed",
          completedAt: proposal.completedAt,
          skillRelated: true,
        },
      )
    } else if (proposal.proposalType === "credits-for-skill") {
      baseMilestones.push(
        {
          id: "credits_transferred",
          title: "Credits Transferred",
          description: `${proposal.offeredCredits} credits transferred to ${proposal.toUserName}`,
          isCompleted: proposal.status === "accepted" || proposal.status === "completed",
          completedAt: proposal.respondedAt,
          skillRelated: false,
        },
        {
          id: "skill_delivered",
          title: `${proposal.requestedSkillTitle} Session Completed`,
          description: `${proposal.toUserName} has taught their skill`,
          isCompleted: proposal.status === "completed",
          completedAt: proposal.completedAt,
          skillRelated: true,
        },
      )
    } else if (proposal.proposalType === "skill-for-credits") {
      baseMilestones.push(
        {
          id: "skill_delivered",
          title: `${proposal.offeredSkillTitle} Session Completed`,
          description: `${proposal.fromUserName} has taught their skill`,
          isCompleted: proposal.status === "completed",
          completedAt: proposal.completedAt,
          skillRelated: true,
        },
        {
          id: "credits_transferred",
          title: "Credits Received",
          description: `${proposal.requestedCredits} credits transferred to ${proposal.fromUserName}`,
          isCompleted: proposal.status === "completed",
          completedAt: proposal.completedAt,
          skillRelated: false,
        },
      )
    }

    baseMilestones.push({
      id: "trade_completed",
      title: "Trade Completed & Rated",
      description: "Both parties have confirmed the successful skill exchange",
      isCompleted: proposal.status === "completed",
      completedAt: proposal.completedAt,
      skillRelated: true,
    })

    return baseMilestones
  }

  static getTradeStats(userId: string): {
    totalTrades: number
    activeTrades: number
    completedTrades: number
    successRate: number
    totalCreditsEarned: number
    totalCreditsSpent: number
    skillsLearned: number
    skillsTaught: number
    favoriteCategory?: string
  } {
    const { active, completed } = this.getTradesForUser(userId)
    const { sent, received } = ProposalService.getProposalsForUser(userId)

    let totalCreditsEarned = 0
    let totalCreditsSpent = 0
    let skillsLearned = 0
    let skillsTaught = 0
    const categoryCount: Record<string, number> = {}

    const allProposals = [...sent, ...received]
    allProposals.forEach((proposal) => {
      if (proposal.status === "completed") {
        if (proposal.proposalType === "skill-for-skill") {
          if (proposal.fromUserId === userId) {
            skillsTaught += 1
            skillsLearned += 1
          } else {
            skillsTaught += 1
            skillsLearned += 1
          }
        } else if (proposal.proposalType === "credits-for-skill") {
          if (proposal.fromUserId === userId) {
            skillsLearned += 1
            totalCreditsSpent += proposal.offeredCredits || 0
          } else {
            skillsTaught += 1
            totalCreditsEarned += proposal.offeredCredits || 0
          }
        } else if (proposal.proposalType === "skill-for-credits") {
          if (proposal.fromUserId === userId) {
            skillsTaught += 1
            totalCreditsEarned += proposal.requestedCredits || 0
          } else {
            skillsLearned += 1
            totalCreditsSpent += proposal.requestedCredits || 0
          }
        }

        const skillId = proposal.fromUserId === userId ? proposal.offeredSkillId : proposal.requestedSkillId
        if (skillId) {
          const skill = SkillService.getStoredOffers().find((s) => s.id === skillId)
          if (skill) {
            categoryCount[skill.category] = (categoryCount[skill.category] || 0) + 1
          }
        }
      }
    })

    const userTransactions = CreditService.getUserTransactions(userId)
    const bonusCredits = userTransactions
      .filter((t) => t.type === "bonus" && t.toUserId === userId)
      .reduce((sum, t) => sum + t.amount, 0)

    totalCreditsEarned += bonusCredits

    const totalTrades = active.length + completed.length
    const successRate = totalTrades > 0 ? (completed.length / totalTrades) * 100 : 0

    const favoriteCategory =
      Object.keys(categoryCount).length > 0
        ? Object.keys(categoryCount).reduce((a, b) => (categoryCount[a] > categoryCount[b] ? a : b))
        : undefined

    return {
      totalTrades,
      activeTrades: active.length,
      completedTrades: completed.length,
      successRate: Math.round(successRate),
      totalCreditsEarned,
      totalCreditsSpent,
      skillsLearned,
      skillsTaught,
      favoriteCategory,
    }
  }

  static completeTrade(proposalId: string, userId: string): { success: boolean; error?: string } {
    const proposal = ProposalService.getProposal(proposalId)

    if (!proposal) {
      return { success: false, error: "Proposal not found" }
    }

    if (proposal.status !== "accepted") {
      return { success: false, error: "Trade must be accepted before completion" }
    }

    if (proposal.fromUserId !== userId && proposal.toUserId !== userId) {
      return { success: false, error: "You are not a participant in this trade" }
    }

    const updatedProposal = ProposalService.updateProposalStatus(proposalId, "completed")

    if (!updatedProposal) {
      return { success: false, error: "Failed to complete trade" }
    }

    return { success: true }
  }
}
