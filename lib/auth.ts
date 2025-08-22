"use client"

// Simple authentication and user management system
import { useState, useEffect } from "react"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  skillsOffered: string[]
  skillsWanted: string[]
  credits: number
  joinedAt: Date
  location?: string
  rating: number
  completedTrades: number
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Mock user data for demo
const mockUsers: User[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatar: "/friendly-woman-smiling.png",
    bio: "Love teaching cooking and learning new skills!",
    skillsOffered: ["Cooking", "Baking", "Meal Planning"],
    skillsWanted: ["Guitar Lessons", "Home Repair", "Gardening"],
    credits: 5,
    joinedAt: new Date("2024-01-15"),
    location: "Downtown",
    rating: 4.8,
    completedTrades: 12,
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike@example.com",
    avatar: "/friendly-man-tools.png",
    bio: "Handyman who loves fixing things and teaching others!",
    skillsOffered: ["Home Repair", "Plumbing", "Electrical Work"],
    skillsWanted: ["Cooking Classes", "Language Tutoring", "Photography"],
    credits: 8,
    joinedAt: new Date("2024-02-01"),
    location: "Midtown",
    rating: 4.9,
    completedTrades: 18,
  },
]

// Local storage keys
const AUTH_STORAGE_KEY = "skillio_auth"
const USERS_STORAGE_KEY = "skillio_users"

export class AuthService {
  static getStoredAuth(): AuthState {
    if (typeof window === "undefined") return { user: null, isAuthenticated: false }

    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        user: parsed.user ? { ...parsed.user, joinedAt: new Date(parsed.user.joinedAt) } : null,
        isAuthenticated: parsed.isAuthenticated,
      }
    }
    return { user: null, isAuthenticated: false }
  }

  static setStoredAuth(authState: AuthState): void {
    if (typeof window === "undefined") return
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState))
  }

  static getStoredUsers(): User[] {
    if (typeof window === "undefined") return mockUsers

    const stored = localStorage.getItem(USERS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((user: any) => ({
        ...user,
        joinedAt: new Date(user.joinedAt),
      }))
    }

    // Initialize with mock data
    this.setStoredUsers(mockUsers)
    return mockUsers
  }

  static setStoredUsers(users: User[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  }

  static async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const users = this.getStoredUsers()
    const user = users.find((u) => u.email === email)

    if (user) {
      // Give 3 free credits on login if they have less than 3
      if (user.credits < 3) {
        user.credits = 3
        this.updateUser(user)
      }

      const authState = { user, isAuthenticated: true }
      this.setStoredAuth(authState)
      return { success: true, user }
    }

    return { success: false, error: "Invalid credentials" }
  }

  static async register(
    userData: Omit<User, "id" | "credits" | "joinedAt" | "rating" | "completedTrades">,
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const users = this.getStoredUsers()
    const existingUser = users.find((u) => u.email === userData.email)

    if (existingUser) {
      return { success: false, error: "Email already exists" }
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      credits: 3, // Start with 3 free credits
      joinedAt: new Date(),
      rating: 5.0,
      completedTrades: 0,
    }

    users.push(newUser)
    this.setStoredUsers(users)

    const authState = { user: newUser, isAuthenticated: true }
    this.setStoredAuth(authState)

    return { success: true, user: newUser }
  }

  static logout(): void {
    this.setStoredAuth({ user: null, isAuthenticated: false })
  }

  static updateUser(updatedUser: User): void {
    const users = this.getStoredUsers()
    const index = users.findIndex((u) => u.id === updatedUser.id)
    if (index !== -1) {
      users[index] = updatedUser
      this.setStoredUsers(users)

      // Update auth state if this is the current user
      const auth = this.getStoredAuth()
      if (auth.user?.id === updatedUser.id) {
        this.setStoredAuth({ user: updatedUser, isAuthenticated: true })
      }
    }
  }

  static getAllUsers(): User[] {
    return this.getStoredUsers()
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const auth = AuthService.getStoredAuth()
    setUser(auth.user)
    setIsAuthenticated(auth.isAuthenticated)
    setIsLoading(false)
  }, [])

  const updateUser = (updatedUser: User) => {
    AuthService.updateUser(updatedUser)
    setUser(updatedUser)
  }

  const login = async (email: string, password: string) => {
    const result = await AuthService.login(email, password)
    if (result.success && result.user) {
      setUser(result.user)
      setIsAuthenticated(true)
    }
    return result
  }

  const register = async (userData: Omit<User, "id" | "credits" | "joinedAt" | "rating" | "completedTrades">) => {
    const result = await AuthService.register(userData)
    if (result.success && result.user) {
      setUser(result.user)
      setIsAuthenticated(true)
    }
    return result
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    updateUser,
    login,
    register,
    logout,
  }
}
