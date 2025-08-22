"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditService, type CreditTransaction } from "@/lib/credits"
import { Coins, TrendingUp, TrendingDown, Gift, RefreshCw } from "lucide-react"

interface CreditBalanceProps {
  userId: string
  showTransactions?: boolean
}

export function CreditBalance({ userId, showTransactions = false }: CreditBalanceProps) {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCreditData()
  }, [userId])

  const loadCreditData = () => {
    setIsLoading(true)
    const currentBalance = CreditService.getCreditBalance(userId)
    setBalance(currentBalance)

    if (showTransactions) {
      const userTransactions = CreditService.getUserTransactions(userId)
      setTransactions(userTransactions.slice(0, 10)) // Show last 10 transactions
    }

    setIsLoading(false)
  }

  const getTransactionIcon = (transaction: CreditTransaction) => {
    if (transaction.type === "bonus") return <Gift className="h-4 w-4 text-green-500" />
    if (transaction.type === "refund") return <RefreshCw className="h-4 w-4 text-blue-500" />
    if (transaction.fromUserId === userId) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <TrendingUp className="h-4 w-4 text-green-500" />
  }

  const getTransactionAmount = (transaction: CreditTransaction) => {
    const isIncoming = transaction.toUserId === userId
    return isIncoming ? `+${transaction.amount}` : `-${transaction.amount}`
  }

  const getTransactionColor = (transaction: CreditTransaction) => {
    const isIncoming = transaction.toUserId === userId
    return isIncoming ? "text-green-600" : "text-red-600"
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Credit Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Credit Balance
          </CardTitle>
          <CardDescription>Use credits to trade when skills don't match directly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary mb-2">{balance} Credits</div>
          <p className="text-sm text-muted-foreground">
            {balance >= 5 ? "Great balance!" : balance >= 3 ? "Good to go!" : "Consider earning more credits"}
          </p>
        </CardContent>
      </Card>

      {showTransactions && transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <CardDescription>Your latest credit activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction)}
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.createdAt.toLocaleDateString()} at{" "}
                        {transaction.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getTransactionColor(transaction)}`}>
                      {getTransactionAmount(transaction)} credits
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.type.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            {transactions.length === 10 && (
              <Button variant="ghost" className="w-full mt-4" onClick={() => (window.location.href = "/credits")}>
                View All Transactions
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
