"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ConversationList } from "@/components/conversation-list"
import { MessageThread } from "@/components/message-thread"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AuthService, type User } from "@/lib/auth"
import { MessageService, type Conversation } from "@/lib/messages"
import { Heart, ArrowLeft, MessageSquare } from "lucide-react"

export default function MessagesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const auth = AuthService.getStoredAuth()
    setUser(auth.user)
    setIsAuthenticated(auth.isAuthenticated)

    if (!auth.isAuthenticated) {
      router.push("/")
      return
    }

    loadConversations(auth.user!.id)
  }, [router])

  const loadConversations = (userId: string) => {
    setIsLoading(true)
    const userConversations = MessageService.getConversationsForUser(userId)
    setConversations(userConversations)

    // Auto-select first conversation if none selected
    if (!selectedConversation && userConversations.length > 0) {
      setSelectedConversation(userConversations[0])
    }

    setIsLoading(false)
  }

  const handleSendMessage = (content: string) => {
    if (!selectedConversation || !user) return

    const otherParticipant = selectedConversation.participants.find((p) => p.id !== user.id)
    if (!otherParticipant) return

    MessageService.sendMessage(
      user.id,
      user.name,
      user.avatar,
      otherParticipant.id,
      otherParticipant.name,
      otherParticipant.avatar,
      content,
      selectedConversation.relatedProposalId,
    )

    // Reload conversations to update last message and timestamps
    loadConversations(user.id)
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    // Mark messages as read when selecting conversation
    MessageService.markMessagesAsRead(conversation.id, user!.id)
    // Reload to update unread counts
    setTimeout(() => loadConversations(user!.id), 100)
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
            <Button variant="ghost" size="sm" onClick={() => router.push("/proposals")}>
              View Proposals
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/skills")}>
              Browse Skills
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
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Messages</h2>
          <p className="text-muted-foreground">Coordinate your skill trades and connect with the community</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <div className="mb-4">
                <h3 className="text-lg font-serif font-medium">Conversations</h3>
                <p className="text-sm text-muted-foreground">
                  {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="overflow-y-auto max-h-[500px]">
                <ConversationList
                  conversations={conversations}
                  currentUser={user}
                  selectedConversationId={selectedConversation?.id}
                  onSelectConversation={handleSelectConversation}
                />
              </div>
            </div>

            {/* Message Thread */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <MessageThread
                  conversation={selectedConversation}
                  currentUser={user}
                  onSendMessage={handleSendMessage}
                />
              ) : (
                <Card className="h-full">
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                      <p className="text-lg mb-2">Select a conversation</p>
                      <p className="text-sm">Choose a conversation from the list to start messaging</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
