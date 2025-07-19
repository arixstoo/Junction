"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useTranslation, type Language } from "@/lib/i18n"
import { 
  Settings, 
  Bell, 
  Globe, 
  Shield, 
  Users, 
  Database,
  Save,
  RotateCcw,
  Monitor,
  Smartphone,
  Mail,
  MessageSquare,
  User,
  Phone,
  Building,
  MapPin
} from "lucide-react"

interface SettingsPageProps {
  language: Language
}

export function SettingsPage({ language }: SettingsPageProps) {
  const { t } = useTranslation(language)
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(true)
  const [whatsappNotifications, setWhatsappNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  
  // Alert Thresholds (realistic values for Algeria)
  const [tempThreshold, setTempThreshold] = useState("28")
  const [phThreshold, setPHThreshold] = useState("7.8")
  const [oxygenThreshold, setOxygenThreshold] = useState("6.5")
  const [turbidityThreshold, setTurbidityThreshold] = useState("15")
  
  // System Settings
  const [refreshInterval, setRefreshInterval] = useState("30")
  const [dataRetention, setDataRetention] = useState("180")
  const [timezone, setTimezone] = useState("Africa/Algiers")
  
  // User Preferences
  const [currentLanguage, setCurrentLanguage] = useState(language)
  const [theme, setTheme] = useState("light")
  const [defaultView, setDefaultView] = useState("dashboard")

  // Algerian User Profile Data (English transliteration)
  const [userProfile] = useState({
    fullName: "Makhlouf Kamel Benali",
    email: "makhlouf.kamel@ocea-dz.com",
    phone: "+213 550 123 456",
    jobTitle: "Aquaculture Farms Manager",
    company: "OCEA Algeria - Aquaculture Technology",
    location: "Algiers, Algeria",
    department: "Fish Production Management",
    employeeId: "EMP-2024-001",
    joinDate: "January 15, 2024"
  })

  // Farm Management Data (English transliteration)
  const [farmData] = useState({
    totalFarms: 4,
    activePonds: 24,
    totalProduction: "15,500 kg",
    monthlyTarget: "18,000 kg",
    regions: [
      { name: "Oran Fish Farm", manager: "Ahmed Ben Mohamed Tlemcani", ponds: 6 },
      { name: "Annaba Fish Farm", manager: "Fatima Zahra Boualam", ponds: 8 },
      { name: "Bejaia Fish Farm", manager: "Youssef Ben Abdullah Constantini", ponds: 5 },
      { name: "Skikda Fish Farm", manager: "Khadija Bint Hassan Wahrani", ponds: 5 }
    ]
  })

  const handleSaveSettings = () => {
    // Save settings logic would go here
    console.log("Saving settings...")
  }

  const handleResetToDefaults = () => {
    // Reset to default settings
    setEmailNotifications(true)
    setSmsNotifications(false)
    setWhatsappNotifications(true)
    setPushNotifications(true)
    setTempThreshold("25")
    setPHThreshold("7.5")
    setOxygenThreshold("5.0")
    setTurbidityThreshold("10")
    setRefreshInterval("30")
    setDataRetention("90")
    setTimezone("UTC")
    setTheme("light")
    setDefaultView("dashboard")
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("settingsManagement")}</h1>
          <p className="text-gray-600 mt-1">{t("configureSystemPreferences")}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetToDefaults}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {t("resetToDefaults")}
          </Button>
          <Button 
            size="sm" 
            onClick={handleSaveSettings}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            {t("saveChanges")}
          </Button>
        </div>
      </div>

      {/* User Profile Information - Algerian Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            User Profile Information
          </CardTitle>
          <CardDescription>
            Current user account details and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">{userProfile.fullName}</p>
                  <p className="text-sm text-gray-600">{userProfile.jobTitle}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Mail className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">{userProfile.email}</p>
                  <p className="text-sm text-gray-600">Official Email Address</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Phone className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">{userProfile.phone}</p>
                  <p className="text-sm text-gray-600">Work Phone</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <Building className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-gray-900">{userProfile.company}</p>
                  <p className="text-sm text-gray-600">{userProfile.department}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Shield className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Employee ID: {userProfile.employeeId}</p>
                  <p className="text-sm text-gray-600">Join Date: {userProfile.joinDate}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <MapPin className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">{userProfile.location}</p>
                  <p className="text-sm text-gray-600">Main Location</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Farm Management Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-green-600" />
            Farm Management Overview
          </CardTitle>
          <CardDescription>
            Overview of managed farms and active ponds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{farmData.totalFarms}</div>
              <div className="text-sm text-gray-600">Total Farms</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{farmData.activePonds}</div>
              <div className="text-sm text-gray-600">Active Ponds</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{farmData.totalProduction}</div>
              <div className="text-sm text-gray-600">Monthly Production</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{farmData.monthlyTarget}</div>
              <div className="text-sm text-gray-600">Monthly Target</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 mb-3">Managed Farms</h4>
            {farmData.regions.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{region.name}</p>
                  <p className="text-sm text-gray-600">Manager: {region.manager}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-blue-600">{region.ponds} Ponds</p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            {t("notificationSettings")}
          </CardTitle>
          <CardDescription>
            {t("configureNotifications")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <Label htmlFor="email-notifications" className="font-medium">
                    {t("emailNotifications")}
                  </Label>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-gray-600" />
                  <Label htmlFor="sms-notifications" className="font-medium">
                    {t("smsNotifications")}
                  </Label>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-gray-600" />
                  <Label htmlFor="whatsapp-notifications" className="font-medium">
                    {t("whatsappNotifications")}
                  </Label>
                </div>
                <Switch
                  id="whatsapp-notifications"
                  checked={whatsappNotifications}
                  onCheckedChange={setWhatsappNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Monitor className="h-4 w-4 text-gray-600" />
                  <Label htmlFor="push-notifications" className="font-medium">
                    {t("pushNotifications")}
                  </Label>
                </div>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            {t("alertThresholds")}
          </CardTitle>
          <CardDescription>
            {t("setAlertThresholds")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="temp-threshold">{t("temperatureThreshold")} (°C)</Label>
                <Input
                  id="temp-threshold"
                  type="number"
                  value={tempThreshold}
                  onChange={(e) => setTempThreshold(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="ph-threshold">{t("phThreshold")}</Label>
                <Input
                  id="ph-threshold"
                  type="number"
                  step="0.1"
                  value={phThreshold}
                  onChange={(e) => setPHThreshold(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="oxygen-threshold">{t("oxygenThreshold")} (mg/L)</Label>
                <Input
                  id="oxygen-threshold"
                  type="number"
                  step="0.1"
                  value={oxygenThreshold}
                  onChange={(e) => setOxygenThreshold(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="turbidity-threshold">{t("turbidityThreshold")} (NTU)</Label>
                <Input
                  id="turbidity-threshold"
                  type="number"
                  value={turbidityThreshold}
                  onChange={(e) => setTurbidityThreshold(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-green-600" />
            {t("systemSettings")}
          </CardTitle>
          <CardDescription>
            {t("configureSystemBehavior")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="refresh-interval">{t("dataRefreshInterval")} ({t("seconds")})</Label>
                <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 {t("seconds")}</SelectItem>
                    <SelectItem value="30">30 {t("seconds")}</SelectItem>
                    <SelectItem value="60">1 {t("minute")}</SelectItem>
                    <SelectItem value="300">5 {t("minutes")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="data-retention">{t("dataRetention")} ({t("days")})</Label>
                <Select value={dataRetention} onValueChange={setDataRetention}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 {t("days")}</SelectItem>
                    <SelectItem value="90">90 {t("days")}</SelectItem>
                    <SelectItem value="180">180 {t("days")}</SelectItem>
                    <SelectItem value="365">365 {t("days")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="timezone">{t("timezone")}</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            {t("userPreferences")}
          </CardTitle>
          <CardDescription>
            {t("personalizeExperience")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="language-select">{t("language")}</Label>
                <Select value={currentLanguage} onValueChange={(value: Language) => setCurrentLanguage(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="theme-select">{t("theme")}</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t("lightTheme")}</SelectItem>
                    <SelectItem value="dark">{t("darkTheme")}</SelectItem>
                    <SelectItem value="auto">{t("autoTheme")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="default-view">{t("defaultView")}</Label>
                <Select value={defaultView} onValueChange={setDefaultView}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashboard">{t("dashboard")}</SelectItem>
                    <SelectItem value="ponds">{t("pondsOverview")}</SelectItem>
                    <SelectItem value="analytics">{t("analytics")}</SelectItem>
                    <SelectItem value="alerts">{t("alerts")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
