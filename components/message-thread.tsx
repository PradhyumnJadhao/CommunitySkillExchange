"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Message, Conversation } from "@/lib/messages"
import type { User } from "@/lib/auth"
import { MessageService } from "@/lib/messages"
import { Send, Clock } from "lucide-react"

interface MessageThreadProps {
  conversation: Conversation
  currentUser: User
  onSendMessage: (content: string) => void
}

export function MessageThread({ conversation, currentUser, onSendMessage }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const otherParticipant = conversation.participants.find((p) => p.id !== currentUser.id)

  useEffect(() => {
    loadMessages()
    // Mark messages as read
    MessageService.markMessagesAsRead(conversation.id, currentUser.id)
  }, [conversation.id, currentUser.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = () => {
    setIsLoading(true)
    const conversationMessages = MessageService.getMessagesForConversation(conversation.id)
    setMessages(conversationMessages)
    setIsLoading(false)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !otherParticipant) return

    onSendMessage(newMessage.trim())
    setNewMessage("")

    // Reload messages to show the new one
    setTimeout(loadMessages, 100)
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 168) {
      // 7 days
      return timestamp.toLocaleDateString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })
    } else {
      return timestamp.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    }
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center text-muted-foreground">
            <div className="animate-pulse">Loading messages...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherParticipant?.avatar || "/placeholder.svg"} alt={otherParticipant?.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {otherParticipant?.name
                .split(" ")
                .map((n) => n[0])
                .join("") || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg font-serif">{otherParticipant?.name}</CardTitle>
            {conversation.relatedSkillTitle && (
              <Badge variant="secondary" className="text-xs mt-1">
                Related to: {conversation.relatedSkillTitle}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <Separator />

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isFromCurrentUser = message.senderId === currentUser.id
            return (
              <div key={message.id} className={`flex gap-3 ${isFromCurrentUser ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage
                    src={isFromCurrentUser ? currentUser.avatar : message.senderAvatar || "/placeholder.svg"}
                    alt={message.senderName}
                  />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    {message.senderName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex-1 max-w-xs ${isFromCurrentUser ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block p-3 rounded-lg text-sm ${
                      isFromCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(message.timestamp)}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <Separator />

      {/* Message Input */}
      <div className="p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${otherParticipant?.name}...`}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
}
