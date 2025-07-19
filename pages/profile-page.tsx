"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useTranslation, type Language } from "@/lib/i18n"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  Building,
  Shield,
  Activity,
  Users,
  AlertTriangle
} from "lucide-react"

interface ProfilePageProps {
  language: Language
}

export function ProfilePage({ language }: ProfilePageProps) {
  const { t } = useTranslation(language)
  
  // User Profile Data - Algerian Information (English transliteration)
  const [isEditing, setIsEditing] = useState(false)
  const [userInfo, setUserInfo] = useState({
    firstName: "Makhlouf",
    lastName: "Kamel Benali", 
    email: "makhlouf.kamel@ocea-dz.com",
    phone: "+213 550 123 456",
    jobTitle: "Aquaculture Farms Manager",
    company: "OCEA Algeria - Aquaculture Technology",
    address: "25 Independence Street, Algiers, Algeria 16000"
  })

  const handleSave = () => {
    setIsEditing(false)
    // Save logic would go here
    console.log("Saving profile changes...")
  }

  const profileStats = {
    pondsManaged: 24,
    daysActive: 156,
    alertsResolved: 89,
    uptime: "98.7%"
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("profileManagement")}</h1>
          <p className="text-gray-600 mt-1">{t("manageAccount")}</p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                {t("cancel")}
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                {t("saveChanges")}
              </Button>
            </>
          ) : (
            <Button 
              size="sm" 
              onClick={() => setIsEditing(true)}
              className="gap-2"
              variant="outline"
            >
              <Edit className="h-4 w-4" />
              {t("editProfile")}
            </Button>
          )}
        </div>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            {t("personalInformation")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback className="text-lg">MK</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <div className="font-medium text-lg">{userInfo.firstName} {userInfo.lastName}</div>
                <div className="text-sm text-gray-600">{userInfo.jobTitle}</div>
                <Badge variant="outline" className="mt-2">
                  <Shield className="h-3 w-3 mr-1" />
                  {t("farmManager")}
                </Badge>
              </div>
            </div>

            {/* Profile Details */}
            <div className="flex-1 grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName">{t("firstName")}</Label>
                  <Input
                    id="firstName"
                    value={userInfo.firstName}
                    onChange={(e) => setUserInfo({...userInfo, firstName: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName">{t("lastName")}</Label>
                  <Input
                    id="lastName"
                    value={userInfo.lastName}
                    onChange={(e) => setUserInfo({...userInfo, lastName: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">{t("phone")}</Label>
                  <Input
                    id="phone"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="jobTitle">{t("jobTitle")}</Label>
                  <Input
                    id="jobTitle"
                    value={userInfo.jobTitle}
                    onChange={(e) => setUserInfo({...userInfo, jobTitle: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="company">{t("company")}</Label>
                  <Input
                    id="company"
                    value={userInfo.company}
                    onChange={(e) => setUserInfo({...userInfo, company: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            {t("addressInformation")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">{t("address")}</Label>
              <Input
                id="address"
                value={userInfo.address}
                onChange={(e) => setUserInfo({...userInfo, address: e.target.value})}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            {t("accountStatistics")}
          </CardTitle>
          <CardDescription>
            {t("activityPerformanceMetrics")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{profileStats.pondsManaged}</div>
              <div className="text-sm text-gray-600">{t("pondsManaged")}</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{profileStats.daysActive}</div>
              <div className="text-sm text-gray-600">{t("daysActive")}</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{profileStats.alertsResolved}</div>
              <div className="text-sm text-gray-600">{t("alertsResolved")}</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{profileStats.uptime}</div>
              <div className="text-sm text-gray-600">{t("uptime")}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <span className="font-medium">{t("activeAccount")}</span>
            </div>
            <div className="text-sm text-gray-600">
              {t("joined")}: January 15, 2024
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
