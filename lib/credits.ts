import { AuthService } from "./auth"

export interface CreditTransaction {
  id: string
  fromUserId: string
  toUserId: string
  amount: number
  type: "transfer" | "trade_completion" | "bonus" | "refund"
  description: string
  relatedTradeId?: string
  relatedProposalId?: string
  createdAt: Date
}

// Local storage key
const TRANSACTIONS_STORAGE_KEY = "skillio_credit_transactions"

export class CreditService {
  static getStoredTransactions(): CreditTransaction[] {
    if (typeof window === "undefined") return []

    const stored = localStorage.getItem(TRANSACTIONS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((transaction: any) => ({
        ...transaction,
        createdAt: new Date(transaction.createdAt),
      }))
    }
    return []
  }

  static setStoredTransactions(transactions: CreditTransaction[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions))
  }

  static transferCredits(
    fromUserId: string,
    toUserId: string,
    amount: number,
    description: string,
    relatedTradeId?: string,
    relatedProposalId?: string,
  ): { success: boolean; error?: string } {
    const users = AuthService.getAllUsers()
    const fromUser = users.find((u) => u.id === fromUserId)
    const toUser = users.find((u) => u.id === toUserId)

    if (!fromUser || !toUser) {
      return { success: false, error: "User not found" }
    }

    if (fromUser.credits < amount) {
      return { success: false, error: "Insufficient credits" }
    }

    if (amount <= 0) {
      return { success: false, error: "Invalid amount" }
    }

    // Update user credits
    fromUser.credits -= amount
    toUser.credits += amount

    // Save updated users
    AuthService.updateUser(fromUser)
    AuthService.updateUser(toUser)

    // Record transaction
    const transaction: CreditTransaction = {
      id: Date.now().toString(),
      fromUserId,
      toUserId,
      amount,
      type: relatedTradeId ? "trade_completion" : "transfer",
      description,
      relatedTradeId,
      relatedProposalId,
      createdAt: new Date(),
    }

    const transactions = this.getStoredTransactions()
    transactions.push(transaction)
    this.setStoredTransactions(transactions)

    return { success: true }
  }

  static getUserTransactions(userId: string): CreditTransaction[] {
    const transactions = this.getStoredTransactions()
    return transactions
      .filter((t) => t.fromUserId === userId || t.toUserId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  static awardBonusCredits(userId: string, amount: number, description: string): { success: boolean; error?: string } {
    const users = AuthService.getAllUsers()
    const user = users.find((u) => u.id === userId)

    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Update user credits
    user.credits += amount
    AuthService.updateUser(user)

    // Record transaction (system award)
    const transaction: CreditTransaction = {
      id: Date.now().toString(),
      fromUserId: "system",
      toUserId: userId,
      amount,
      type: "bonus",
      description,
      createdAt: new Date(),
    }

    const transactions = this.getStoredTransactions()
    transactions.push(transaction)
    this.setStoredTransactions(transactions)

    return { success: true }
  }

  static refundCredits(
    toUserId: string,
    amount: number,
    description: string,
    relatedTradeId?: string,
    relatedProposalId?: string,
  ): { success: boolean; error?: string } {
    const users = AuthService.getAllUsers()
    const user = users.find((u) => u.id === toUserId)

    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Update user credits
    user.credits += amount
    AuthService.updateUser(user)

    // Record transaction (system refund)
    const transaction: CreditTransaction = {
      id: Date.now().toString(),
      fromUserId: "system",
      toUserId,
      amount,
      type: "refund",
      description,
      relatedTradeId,
      relatedProposalId,
      createdAt: new Date(),
    }

    const transactions = this.getStoredTransactions()
    transactions.push(transaction)
    this.setStoredTransactions(transactions)

    return { success: true }
  }

  static getCreditBalance(userId: string): number {
    const users = AuthService.getAllUsers()
    const user = users.find((u) => u.id === userId)
    return user?.credits || 0
  }

  static getAllTransactions(): CreditTransaction[] {
    return this.getStoredTransactions().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }
}
