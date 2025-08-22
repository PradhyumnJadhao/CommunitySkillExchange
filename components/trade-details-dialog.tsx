"use client"

import type { Trade } from "@/lib/trades"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, ArrowRight, Coins, CheckCircle, Clock } from "lucide-react"

interface TradeDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trade: Trade | null
  currentUserId: string
}

export function TradeDetailsDialog({ open, onOpenChange, trade, currentUserId }: TradeDetailsDialogProps) {
  if (!trade) return null

  const isOfferer = trade.participants.offerer.id === currentUserId
  const otherParticipant = isOfferer ? trade.participants.receiver : trade.participants.offerer

  const completedMilestones = trade.progress.milestones.filter((m) => m.isCompleted).length
  const totalMilestones = trade.progress.milestones.length
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

  const getStatusColor = (status: Trade["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderTradeDetails = () => {
    return (
      <div className="flex items-center gap-3 text-sm">
        <div className="flex-1 text-center">
          {trade.tradeDetails.offered.type === "skill" ? (
            <p className="font-medium">{trade.tradeDetails.offered.skillTitle}</p>
          ) : (
            <div className="flex items-center justify-center gap-1">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-medium">{trade.tradeDetails.offered.credits} Credits</span>
            </div>
          )}
          <p className="text-muted-foreground">Offered by {trade.participants.offerer.name}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1 text-center">
          {trade.tradeDetails.requested.type === "skill" ? (
            <p className="font-medium">{trade.tradeDetails.requested.skillTitle}</p>
          ) : (
            <div className="flex items-center justify-center gap-1">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-medium">{trade.tradeDetails.requested.credits} Credits</span>
            </div>
          )}
          <p className="text-muted-foreground">Provided by {trade.participants.receiver.name}</p>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Trade Details</DialogTitle>
          <DialogDescription>Complete trade information and progress tracking</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={otherParticipant.avatar || "/placeholder.svg"} alt={otherParticipant.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {otherParticipant.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-serif font-medium">Trade with {otherParticipant.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Started {trade.startedAt.toLocaleDateString()}</span>
                  {trade.completedAt && (
                    <>
                      <span>•</span>
                      <span>Completed {trade.completedAt.toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Badge className={getStatusColor(trade.status)}>
              {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
            </Badge>
          </div>

          {/* Trade Details */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Trade Agreement</h4>
            {renderTradeDetails()}
          </div>

          {/* Progress Overview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Progress Overview</h4>
              <span className="text-sm text-muted-foreground">
                {completedMilestones}/{totalMilestones} completed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Current stage: <span className="font-medium capitalize">{trade.progress.stage.replace("-", " ")}</span>
            </p>
          </div>

          {/* Milestones */}
          <div className="space-y-3">
            <h4 className="font-medium">Milestones</h4>
            <div className="space-y-3">
              {trade.progress.milestones.map((milestone, index) => (
                <div key={milestone.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className={`h-5 w-5 ${milestone.isCompleted ? "text-green-600" : "text-gray-400"}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5
                        className={`font-medium ${milestone.isCompleted ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {milestone.title}
                      </h5>
                      {milestone.completedAt && (
                        <span className="text-xs text-muted-foreground">
                          {milestone.completedAt.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meeting Details */}
          {trade.meetingDetails && (trade.meetingDetails.location || trade.meetingDetails.time) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Meeting Details</h4>
                {trade.meetingDetails.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{trade.meetingDetails.location}</span>
                  </div>
                )}
                {trade.meetingDetails.time && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{trade.meetingDetails.time.toLocaleString()}</span>
                  </div>
                )}
                {trade.meetingDetails.notes && (
                  <div className="bg-muted/50 p-3 rounded text-sm">
                    <p className="font-medium mb-1">Notes:</p>
                    <p className="text-muted-foreground">{trade.meetingDetails.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
