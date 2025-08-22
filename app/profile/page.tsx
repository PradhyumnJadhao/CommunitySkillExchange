"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Save, User, Star, MapPin, Mail, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { skillCategories } from "@/lib/skills"

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    skillsOffered: user?.skillsOffered || [],
    skillsWanted: user?.skillsWanted || [],
  })
  const [newSkillOffered, setNewSkillOffered] = useState("")
  const [newSkillWanted, setNewSkillWanted] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  const handleSave = () => {
    if (user) {
      updateUser({
        ...user,
        ...formData,
      })
      setIsEditing(false)
    }
  }

  const addSkillOffered = () => {
    if (newSkillOffered.trim()) {
      setFormData((prev) => ({
        ...prev,
        skillsOffered: [...prev.skillsOffered, newSkillOffered.trim()],
      }))
      setNewSkillOffered("")
    }
  }

  const addSkillWanted = () => {
    if (newSkillWanted.trim()) {
      setFormData((prev) => ({
        ...prev,
        skillsWanted: [...prev.skillsWanted, newSkillWanted.trim()],
      }))
      setNewSkillWanted("")
    }
  }

  const removeSkillOffered = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skillsOffered: prev.skillsOffered.filter((_, i) => i !== index),
    }))
  }

  const removeSkillWanted = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skillsWanted: prev.skillsWanted.filter((_, i) => i !== index),
    }))
  }

  const addCategorySkills = (category: string) => {
    const categoryData = skillCategories.find((cat) => cat.name === category)
    if (categoryData) {
      const commonSkills = categoryData.skills.slice(0, 3) // Add first 3 skills from category
      setFormData((prev) => ({
        ...prev,
        skillsOffered: [...new Set([...prev.skillsOffered, ...commonSkills])],
      }))
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p>Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="bg-orange-500 hover:bg-orange-600">
            Edit Profile
          </Button>
        ) : (
          <div className="space-x-2">
            <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false)
                setFormData({
                  name: user.name,
                  bio: user.bio || "",
                  location: user.location || "",
                  skillsOffered: user.skillsOffered || [],
                  skillsWanted: user.skillsWanted || [],
                })
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-2xl bg-orange-100 text-orange-600">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              {isEditing ? (
                <div className="w-full space-y-3">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="Your location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell others about yourself..."
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  {user.location && (
                    <p className="text-gray-600 flex items-center justify-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {user.location}
                    </p>
                  )}
                  <p className="text-gray-600 flex items-center justify-center gap-1">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{user.rating}</span>
                    <span className="text-gray-500">({user.completedTrades} trades)</span>
                  </div>
                  {user.bio && <p className="text-gray-700 text-sm mt-3">{user.bio}</p>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills Management */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills I Offer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Skills I Offer</CardTitle>
              <CardDescription>Skills and services you can provide to others</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing && (
                <div className="space-y-4 mb-4">
                  <div className="flex gap-2">
                    <Input
                      value={newSkillOffered}
                      onChange={(e) => setNewSkillOffered(e.target.value)}
                      placeholder="Add a skill you offer..."
                      onKeyPress={(e) => e.key === "Enter" && addSkillOffered()}
                    />
                    <Button onClick={addSkillOffered} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div>
                    <Label>Quick Add from Categories</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category to add common skills" />
                      </SelectTrigger>
                      <SelectContent>
                        {skillCategories.map((category) => (
                          <SelectItem key={category.name} value={category.name}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedCategory && (
                      <Button onClick={() => addCategorySkills(selectedCategory)} size="sm" className="mt-2">
                        Add {selectedCategory} Skills
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {formData.skillsOffered.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-700">
                    {skill}
                    {isEditing && (
                      <button onClick={() => removeSkillOffered(index)} className="ml-2 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
                {formData.skillsOffered.length === 0 && <p className="text-gray-500 italic">No skills offered yet</p>}
              </div>
            </CardContent>
          </Card>

          {/* Skills I Want */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Skills I Want</CardTitle>
              <CardDescription>Skills and services you're looking to learn or receive</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing && (
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newSkillWanted}
                    onChange={(e) => setNewSkillWanted(e.target.value)}
                    placeholder="Add a skill you want..."
                    onKeyPress={(e) => e.key === "Enter" && addSkillWanted()}
                  />
                  <Button onClick={addSkillWanted} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {formData.skillsWanted.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                    {skill}
                    {isEditing && (
                      <button onClick={() => removeSkillWanted(index)} className="ml-2 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
                {formData.skillsWanted.length === 0 && <p className="text-gray-500 italic">No skills requested yet</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
