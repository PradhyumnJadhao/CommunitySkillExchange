"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Conversation } from "@/lib/messages"
import type { User } from "@/lib/auth"
import { Clock } from "lucide-react"

interface ConversationListProps {
  conversations: Conversation[]
  currentUser: User
  selectedConversationId?: string
  onSelectConversation: (conversation: Conversation) => void
}

export function ConversationList({
  conversations,
  currentUser,
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const formatLastActivity = (timestamp: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 168) {
      // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return timestamp.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-muted-foreground">
            <p className="text-lg mb-2">No conversations yet</p>
            <p className="text-sm">Start trading skills to begin conversations with other members</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const otherParticipant = conversation.participants.find((p) => p.id !== currentUser.id)
        const isSelected = conversation.id === selectedConversationId

        return (
          <Card
            key={conversation.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              isSelected ? "ring-2 ring-primary bg-muted/30" : ""
            }`}
            onClick={() => onSelectConversation(conversation)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage src={otherParticipant?.avatar || "/placeholder.svg"} alt={otherParticipant?.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {otherParticipant?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("") || "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium truncate">{otherParticipant?.name}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs px-2 py-0">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatLastActivity(conversation.lastActivity)}</span>
                      </div>
                    </div>
                  </div>

                  {conversation.relatedSkillTitle && (
                    <Badge variant="outline" className="text-xs mb-2">
                      {conversation.relatedSkillTitle}
                    </Badge>
                  )}

                  {conversation.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage.senderId === currentUser.id ? "You: " : ""}
                      {conversation.lastMessage.content}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
