"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Bell, Home, Settings, User, Waves, LogOut, Globe, Menu } from "lucide-react"
import { useTranslation, type Language } from "@/lib/i18n"
import { useAuth } from "@/hooks/use-auth"
import { useState, useEffect } from "react"
import { dataService } from "@/lib/mongodb"

interface NavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
  language: Language
  onLanguageChange: (language: Language) => void
  alertCount?: number
}

export function Navigation({ currentPage, onPageChange, language, onLanguageChange }: NavigationProps) {
  const { t } = useTranslation(language)
  const { logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [alertCount, setAlertCount] = useState(0)

  // SYNCHRONIZED ALERT COUNT
  useEffect(() => {
    const loadAlertCount = async () => {
      try {
        const activeAlerts = await dataService.getActiveAlerts()
        setAlertCount(activeAlerts.length)
        console.log(`🚨 Navigation: Loaded ${activeAlerts.length} active alerts`)
      } catch (error) {
        console.error("Error loading alert count:", error)
        setAlertCount(0)
      }
    }

    loadAlertCount()

    // Refresh alert count every 30 seconds
    const interval = setInterval(loadAlertCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const NavigationContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex h-16 items-center  gap-3 border-b px-4 lg:px-6">
        <img src="/logo.svg" alt="OCEA" className="h-32 w-40" />
      </div>

      <div className="px-4 lg:px-4 py-4 space-y-3">
        <Input placeholder={`${t("dashboard")}...`} className="bg-gray-50 border-gray-200 text-sm" />

        <Select value={language} onValueChange={(value: Language) => onLanguageChange(value)}>
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <nav className="flex-1 space-y-1 px-2 lg:px-2">
        <Button
          variant={currentPage === "dashboard" ? "default" : "ghost"}
          className={`w-full justify-start gap-3 text-sm ${
            currentPage === "dashboard"
              ? "bg-blue-600 hover:bg-blue-700"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
          onClick={() => {
            onPageChange("dashboard")
            setMobileOpen(false)
          }}
        >
          <Home className="h-4 w-4" />
          {t("dashboard")}
        </Button>
        <Button
          variant={currentPage === "ponds" ? "default" : "ghost"}
          className={`w-full justify-start gap-3 text-sm ${
            currentPage === "ponds"
              ? "bg-blue-600 hover:bg-blue-700"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
          onClick={() => {
            onPageChange("ponds")
            setMobileOpen(false)
          }}
        >
          <Waves className="h-4 w-4" />
          {t("pondsOverview")}
        </Button>
        <Button
          variant={currentPage === "alerts" ? "default" : "ghost"}
          className={`w-full justify-start gap-3 text-sm ${
            currentPage === "alerts"
              ? "bg-blue-600 hover:bg-blue-700"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
          onClick={() => {
            onPageChange("alerts")
            setMobileOpen(false)
          }}
        >
          <Bell className="h-4 w-4" />
          {t("alerts")}
          {alertCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
              {alertCount}
            </span>
          )}
        </Button>
        <Button
          variant={currentPage === "profile" ? "default" : "ghost"}
          className={`w-full justify-start gap-3 text-sm ${
            currentPage === "profile"
              ? "bg-blue-600 hover:bg-blue-700"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
          onClick={() => {
            onPageChange("profile")
            setMobileOpen(false)
          }}
        >
          <User className="h-4 w-4" />
          {t("profile")}
        </Button>
        <Button
          variant={currentPage === "settings" ? "default" : "ghost"}
          className={`w-full justify-start gap-3 text-sm ${
            currentPage === "settings"
              ? "bg-blue-600 hover:bg-blue-700"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
          onClick={() => {
            onPageChange("settings")
            setMobileOpen(false)
          }}
        >
          <Settings className="h-4 w-4" />
          {t("settings")}
        </Button>
      </nav>

      {/* FIXED LOGOUT BUTTON - Now properly positioned at bottom */}
      <div className="p-2 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-sm"
          onClick={() => {
            logout()
            setMobileOpen(false)
          }}
        >
          <LogOut className="h-4 w-4" />
          {t("logout")}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="OCEA" className="h-8 w-8" />
          </div>
          <div className="flex items-center gap-2">
            {alertCount > 0 && (
              <div className="relative">
                <Bell className="h-5 w-5 text-red-500" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                  {alertCount}
                </span>
              </div>
            )}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <NavigationContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Desktop Navigation - FIXED HEIGHT */}
      <aside className="hidden lg:flex lg:w-[280px] lg:flex-col border-r bg-white shadow-sm h-screen">
        <NavigationContent />
      </aside>
    </>
  )
}
