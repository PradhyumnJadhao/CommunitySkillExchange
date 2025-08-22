"use client"

import type { BarterProposal } from "@/lib/proposals"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, MessageSquare, ArrowRight, Coins, Clock } from "lucide-react"

interface ProposalCardProps {
  proposal: BarterProposal
  currentUserId: string
  onAccept?: (proposal: BarterProposal) => void
  onDecline?: (proposal: BarterProposal) => void
  onComplete?: (proposal: BarterProposal) => void
  onCancel?: (proposal: BarterProposal) => void
  onViewDetails?: (proposal: BarterProposal) => void
  onSendMessage?: (proposal: BarterProposal) => void
}

export function ProposalCard({
  proposal,
  currentUserId,
  onAccept,
  onDecline,
  onComplete,
  onCancel,
  onViewDetails,
  onSendMessage,
}: ProposalCardProps) {
  const isReceived = proposal.toUserId === currentUserId
  const otherUser = isReceived
    ? { name: proposal.fromUserName, avatar: proposal.fromUserAvatar }
    : { name: proposal.toUserName, avatar: proposal.toUserAvatar }

  const getStatusColor = (status: BarterProposal["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "declined":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderTradeDetails = () => {
    if (proposal.proposalType === "skill-for-skill") {
      return (
        <div className="flex items-center gap-3 text-sm">
          <div className="flex-1 text-center">
            <p className="font-medium">{proposal.offeredSkillTitle}</p>
            <p className="text-muted-foreground">Offered</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 text-center">
            <p className="font-medium">{proposal.requestedSkillTitle}</p>
            <p className="text-muted-foreground">Requested</p>
          </div>
        </div>
      )
    }

    if (proposal.proposalType === "credits-for-skill") {
      return (
        <div className="flex items-center gap-3 text-sm">
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-1">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-medium">{proposal.offeredCredits} Credits</span>
            </div>
            <p className="text-muted-foreground">Offered</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 text-center">
            <p className="font-medium">{proposal.requestedSkillTitle}</p>
            <p className="text-muted-foreground">Requested</p>
          </div>
        </div>
      )
    }

    if (proposal.proposalType === "skill-for-credits") {
      return (
        <div className="flex items-center gap-3 text-sm">
          <div className="flex-1 text-center">
            <p className="font-medium">{proposal.offeredSkillTitle}</p>
            <p className="text-muted-foreground">Offered</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-1">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-medium">{proposal.requestedCredits} Credits</span>
            </div>
            <p className="text-muted-foreground">Requested</p>
          </div>
        </div>
      )
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.avatar || "/placeholder.svg"} alt={otherUser.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {otherUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-serif">
                {isReceived ? "Proposal from" : "Proposal to"} {otherUser.name}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{proposal.createdAt.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(proposal.status)}>
            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Trade Details */}
        <div className="bg-muted/50 p-3 rounded-lg">{renderTradeDetails()}</div>

        {/* Message */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4" />
            Message
          </div>
          <p className="text-sm text-muted-foreground bg-background p-3 rounded border">{proposal.message}</p>
        </div>

        {/* Meeting Details (if accepted) */}
        {proposal.status === "accepted" && (proposal.meetingLocation || proposal.meetingTime) && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Meeting Details</h4>
              {proposal.meetingLocation && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{proposal.meetingLocation}</span>
                </div>
              )}
              {proposal.meetingTime && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{proposal.meetingTime.toLocaleString()}</span>
                </div>
              )}
              {proposal.meetingNotes && (
                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">{proposal.meetingNotes}</p>
              )}
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {proposal.status === "pending" && isReceived && (
            <>
              <Button onClick={() => onAccept?.(proposal)} size="sm" className="flex-1">
                Accept
              </Button>
              <Button onClick={() => onDecline?.(proposal)} variant="outline" size="sm" className="flex-1">
                Decline
              </Button>
            </>
          )}

          {proposal.status === "accepted" && (
            <Button onClick={() => onComplete?.(proposal)} size="sm" className="flex-1">
              Mark as Completed
            </Button>
          )}

          {proposal.status === "pending" && !isReceived && (
            <Button onClick={() => onCancel?.(proposal)} variant="outline" size="sm" className="flex-1">
              Cancel Proposal
            </Button>
          )}

          <Button onClick={() => onSendMessage?.(proposal)} variant="ghost" size="sm">
            <MessageSquare className="h-4 w-4 mr-1" />
            Message
          </Button>

          <Button onClick={() => onViewDetails?.(proposal)} variant="ghost" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
