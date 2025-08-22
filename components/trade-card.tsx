"use client"

import type { Trade } from "@/lib/trades"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, ArrowRight, Coins, CheckCircle, Clock, MessageSquare } from "lucide-react"

interface TradeCardProps {
  trade: Trade
  currentUserId: string
  onViewDetails?: (trade: Trade) => void
  onSendMessage?: (trade: Trade) => void
  onMarkCompleted?: (trade: Trade) => void
}

export function TradeCard({ trade, currentUserId, onViewDetails, onSendMessage, onMarkCompleted }: TradeCardProps) {
  const isOfferer = trade.participants.offerer.id === currentUserId
  const otherParticipant = isOfferer ? trade.participants.receiver : trade.participants.offerer

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

  const getStageColor = (stage: Trade["progress"]["stage"]) => {
    switch (stage) {
      case "planning":
        return "text-yellow-600"
      case "in-progress":
        return "text-blue-600"
      case "review":
        return "text-purple-600"
      case "completed":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const completedMilestones = trade.progress.milestones.filter((m) => m.isCompleted).length
  const totalMilestones = trade.progress.milestones.length
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherParticipant.avatar || "/placeholder.svg"} alt={otherParticipant.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {otherParticipant.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-serif">Trade with {otherParticipant.name}</CardTitle>
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
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(trade.status)}>
              {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
            </Badge>
            <div className={`text-xs font-medium ${getStageColor(trade.progress.stage)}`}>
              {trade.progress.stage.charAt(0).toUpperCase() + trade.progress.stage.slice(1).replace("-", " ")}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Trade Details */}
        <div className="bg-muted/50 p-3 rounded-lg">{renderTradeDetails()}</div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">
              {completedMilestones}/{totalMilestones} milestones
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Recent Milestones */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Milestones</h4>
          <div className="space-y-1">
            {trade.progress.milestones.slice(-2).map((milestone) => (
              <div key={milestone.id} className="flex items-center gap-2 text-xs">
                <CheckCircle className={`h-3 w-3 ${milestone.isCompleted ? "text-green-600" : "text-gray-400"}`} />
                <span className={milestone.isCompleted ? "text-foreground" : "text-muted-foreground"}>
                  {milestone.title}
                </span>
                {milestone.completedAt && (
                  <span className="text-muted-foreground ml-auto">{milestone.completedAt.toLocaleDateString()}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Meeting Details */}
        {trade.meetingDetails && (trade.meetingDetails.location || trade.meetingDetails.time) && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Meeting Details</h4>
              {trade.meetingDetails.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{trade.meetingDetails.location}</span>
                </div>
              )}
              {trade.meetingDetails.time && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{trade.meetingDetails.time.toLocaleString()}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {trade.status === "active" && (
            <Button onClick={() => onMarkCompleted?.(trade)} size="sm" className="flex-1">
              Mark as Completed
            </Button>
          )}

          <Button onClick={() => onSendMessage?.(trade)} variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-1" />
            Message
          </Button>

          <Button onClick={() => onViewDetails?.(trade)} variant="ghost" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
