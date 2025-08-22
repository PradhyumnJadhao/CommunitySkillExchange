"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditBalance } from "@/components/credit-balance"
import { CreditService, type CreditTransaction } from "@/lib/credits"
import { AuthService, type User } from "@/lib/auth"
import { ArrowLeft, Coins, Gift, RefreshCw, TrendingUp, TrendingDown, Users } from "lucide-react"

export default function CreditsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [allTransactions, setAllTransactions] = useState<CreditTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const auth = AuthService.getStoredAuth()
    if (!auth.isAuthenticated || !auth.user) {
      window.location.href = "/"
      return
    }

    setUser(auth.user)
    loadTransactions()
  }, [])

  const loadTransactions = () => {
    setIsLoading(true)
    const transactions = CreditService.getAllTransactions()
    setAllTransactions(transactions)
    setIsLoading(false)
  }

  const handleBack = () => {
    window.location.href = "/"
  }

  const getTransactionIcon = (transaction: CreditTransaction) => {
    if (transaction.type === "bonus") return <Gift className="h-4 w-4 text-green-500" />
    if (transaction.type === "refund") return <RefreshCw className="h-4 w-4 text-blue-500" />
    if (transaction.fromUserId === user?.id) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <TrendingUp className="h-4 w-4 text-green-500" />
  }

  const getTransactionAmount = (transaction: CreditTransaction) => {
    if (!user) return `${transaction.amount}`
    const isIncoming = transaction.toUserId === user.id
    return isIncoming ? `+${transaction.amount}` : `-${transaction.amount}`
  }

  const getTransactionColor = (transaction: CreditTransaction) => {
    if (!user) return "text-foreground"
    const isIncoming = transaction.toUserId === user.id
    return isIncoming ? "text-green-600" : "text-red-600"
  }

  const getUserName = (userId: string) => {
    if (userId === "system") return "System"
    const users = AuthService.getAllUsers()
    const foundUser = users.find((u) => u.id === userId)
    return foundUser?.name || "Unknown User"
  }

  const userTransactions = allTransactions.filter((t) => user && (t.fromUserId === user.id || t.toUserId === user.id))

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-card to-background flex items-center justify-center">
        <div className="text-center">
          <Coins className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading credits...</p>
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
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-serif font-bold">Credit Management</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {user.credits} Credits
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Credit Balance */}
          <div className="lg:col-span-1">
            <CreditBalance userId={user.id} showTransactions={false} />

            {/* Credit Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">How Credits Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Gift className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Earn Credits</p>
                    <p className="text-xs text-muted-foreground">Complete trades, help others, get bonuses</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Use Credits</p>
                    <p className="text-xs text-muted-foreground">Trade when skills don't match directly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RefreshCw className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Transfer Credits</p>
                    <p className="text-xs text-muted-foreground">Send credits to other community members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="my-transactions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="my-transactions">My Transactions</TabsTrigger>
                <TabsTrigger value="all-transactions">Community Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="my-transactions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Credit History</CardTitle>
                    <CardDescription>All your credit transactions and transfers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userTransactions.length === 0 ? (
                      <div className="text-center py-8">
                        <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No transactions yet</p>
                        <p className="text-sm text-muted-foreground">Start trading to see your credit history!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userTransactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {getTransactionIcon(transaction)}
                              <div>
                                <p className="font-medium">{transaction.description}</p>
                                <p className="text-sm text-muted-foreground">
                                  {transaction.fromUserId === user.id
                                    ? `To: ${getUserName(transaction.toUserId)}`
                                    : `From: ${getUserName(transaction.fromUserId)}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {transaction.createdAt.toLocaleDateString()} at{" "}
                                  {transaction.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold text-lg ${getTransactionColor(transaction)}`}>
                                {getTransactionAmount(transaction)} credits
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {transaction.type.replace("_", " ")}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="all-transactions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Community Credit Activity</CardTitle>
                    <CardDescription>Recent credit transactions across the community</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {allTransactions.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No community activity yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {allTransactions.slice(0, 20).map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {getTransactionIcon(transaction)}
                              <div>
                                <p className="font-medium">{transaction.description}</p>
                                <p className="text-sm text-muted-foreground">
                                  {getUserName(transaction.fromUserId)} → {getUserName(transaction.toUserId)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {transaction.createdAt.toLocaleDateString()} at{" "}
                                  {transaction.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-primary">{transaction.amount} credits</p>
                              <Badge variant="outline" className="text-xs">
                                {transaction.type.replace("_", " ")}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
