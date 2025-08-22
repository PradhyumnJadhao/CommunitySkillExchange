export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  receiverId: string
  receiverName: string
  receiverAvatar?: string
  content: string
  timestamp: Date
  isRead: boolean
  relatedProposalId?: string
}

export interface Conversation {
  id: string
  participants: {
    id: string
    name: string
    avatar?: string
  }[]
  lastMessage?: Message
  lastActivity: Date
  unreadCount: number
  relatedProposalId?: string
  relatedSkillTitle?: string
}

// Mock data for demo
const mockMessages: Message[] = [
  {
    id: "1",
    conversationId: "conv_1_2",
    senderId: "2",
    senderName: "Mike Chen",
    senderAvatar: "/friendly-man-tools.png",
    receiverId: "1",
    receiverName: "Sarah Johnson",
    receiverAvatar: "/friendly-woman-smiling.png",
    content:
      "Hi Sarah! I saw your Italian cooking class offer. I can help with any plumbing issues you might have in exchange for learning to make authentic pasta. Let me know if you're interested!",
    timestamp: new Date("2024-01-23T10:30:00"),
    isRead: true,
    relatedProposalId: "1",
  },
  {
    id: "2",
    conversationId: "conv_1_2",
    senderId: "1",
    senderName: "Sarah Johnson",
    senderAvatar: "/friendly-woman-smiling.png",
    receiverId: "2",
    receiverName: "Mike Chen",
    receiverAvatar: "/friendly-man-tools.png",
    content:
      "Hi Mike! That sounds like a great trade. I actually do have a leaky faucet in my kitchen that's been bothering me. When would be a good time for you?",
    timestamp: new Date("2024-01-23T14:15:00"),
    isRead: true,
    relatedProposalId: "1",
  },
  {
    id: "3",
    conversationId: "conv_1_2",
    senderId: "2",
    senderName: "Mike Chen",
    senderAvatar: "/friendly-man-tools.png",
    receiverId: "1",
    receiverName: "Sarah Johnson",
    receiverAvatar: "/friendly-woman-smiling.png",
    content:
      "Perfect! I'm free this weekend. How about Saturday afternoon? I can bring my tools and fix the faucet, then maybe you can show me how to make some pasta?",
    timestamp: new Date("2024-01-23T16:45:00"),
    isRead: false,
  },
  {
    id: "4",
    conversationId: "conv_2_1",
    senderId: "1",
    senderName: "Sarah Johnson",
    senderAvatar: "/friendly-woman-smiling.png",
    receiverId: "2",
    receiverName: "Mike Chen",
    receiverAvatar: "/friendly-man-tools.png",
    content:
      "Hey Mike! My laptop has been running really slow lately. I can offer 2 credits for some tech support help. Would that work for you?",
    timestamp: new Date("2024-01-22T09:20:00"),
    isRead: true,
    relatedProposalId: "2",
  },
  {
    id: "5",
    conversationId: "conv_2_1",
    senderId: "2",
    senderName: "Mike Chen",
    senderAvatar: "/friendly-man-tools.png",
    receiverId: "1",
    receiverName: "Sarah Johnson",
    receiverAvatar: "/friendly-woman-smiling.png",
    content:
      "2 credits sounds fair. I can take a look at it this week. Would Thursday evening work for you? We could meet at the coffee shop on Main St.",
    timestamp: new Date("2024-01-22T11:30:00"),
    isRead: true,
    relatedProposalId: "2",
  },
]

const MESSAGES_STORAGE_KEY = "skillio_messages"

export class MessageService {
  static getStoredMessages(): Message[] {
    if (typeof window === "undefined") return mockMessages

    const stored = localStorage.getItem(MESSAGES_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((message: any) => ({
        ...message,
        timestamp: new Date(message.timestamp),
      }))
    }

    // Initialize with mock data
    this.setStoredMessages(mockMessages)
    return mockMessages
  }

  static setStoredMessages(messages: Message[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages))
  }

  static getConversationsForUser(userId: string): Conversation[] {
    const messages = this.getStoredMessages()
    const conversationMap = new Map<string, Conversation>()

    // Group messages by conversation
    messages.forEach((message) => {
      const isParticipant = message.senderId === userId || message.receiverId === userId
      if (!isParticipant) return

      const conversationId = message.conversationId
      const otherParticipant =
        message.senderId === userId
          ? { id: message.receiverId, name: message.receiverName, avatar: message.receiverAvatar }
          : { id: message.senderId, name: message.senderName, avatar: message.senderAvatar }

      if (!conversationMap.has(conversationId)) {
        conversationMap.set(conversationId, {
          id: conversationId,
          participants: [
            { id: userId, name: "", avatar: "" }, // Will be filled with current user data
            otherParticipant,
          ],
          lastActivity: message.timestamp,
          unreadCount: 0,
          relatedProposalId: message.relatedProposalId,
        })
      }

      const conversation = conversationMap.get(conversationId)!

      // Update last message and activity
      if (!conversation.lastMessage || message.timestamp > conversation.lastMessage.timestamp) {
        conversation.lastMessage = message
        conversation.lastActivity = message.timestamp
      }

      // Count unread messages
      if (message.receiverId === userId && !message.isRead) {
        conversation.unreadCount++
      }
    })

    return Array.from(conversationMap.values()).sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
  }

  static getMessagesForConversation(conversationId: string): Message[] {
    const messages = this.getStoredMessages()
    return messages
      .filter((message) => message.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  static sendMessage(
    senderId: string,
    senderName: string,
    senderAvatar: string | undefined,
    receiverId: string,
    receiverName: string,
    receiverAvatar: string | undefined,
    content: string,
    relatedProposalId?: string,
  ): Message {
    // Generate conversation ID (consistent for same pair of users)
    const conversationId = [senderId, receiverId].sort().join("_")
    const fullConversationId = `conv_${conversationId}`

    const newMessage: Message = {
      id: Date.now().toString(),
      conversationId: fullConversationId,
      senderId,
      senderName,
      senderAvatar,
      receiverId,
      receiverName,
      receiverAvatar,
      content: content.trim(),
      timestamp: new Date(),
      isRead: false,
      relatedProposalId,
    }

    const messages = this.getStoredMessages()
    messages.push(newMessage)
    this.setStoredMessages(messages)

    return newMessage
  }

  static markMessagesAsRead(conversationId: string, userId: string): void {
    const messages = this.getStoredMessages()
    let hasChanges = false

    messages.forEach((message) => {
      if (message.conversationId === conversationId && message.receiverId === userId && !message.isRead) {
        message.isRead = true
        hasChanges = true
      }
    })

    if (hasChanges) {
      this.setStoredMessages(messages)
    }
  }

  static getUnreadCount(userId: string): number {
    const messages = this.getStoredMessages()
    return messages.filter((message) => message.receiverId === userId && !message.isRead).length
  }
}
