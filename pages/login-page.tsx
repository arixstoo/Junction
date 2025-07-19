"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation, type Language } from "@/lib/i18n"
import { useAuth } from "@/hooks/use-auth"
import { Waves, Globe, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LoginPageProps {
  onLogin: () => void
  language: Language
  onLanguageChange: (language: Language) => void
}

export function LoginPage({ onLogin, language, onLanguageChange }: LoginPageProps) {
  const { t } = useTranslation(language)
  const { login, loading, error } = useAuth()
  const [username, setUsername] = useState("admin") // Default test credentials
  const [password, setPassword] = useState("secret") // Default test credentials
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await login(username, password)
      onLogin()
    } catch (err) {
      // Error is handled by the useAuth hook
      console.error('Login failed:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Language Selector */}
        <div className="flex justify-center">
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-32">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-full">
                <Waves className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-xl font-semibold">{t("welcomeBack")}</CardTitle>
            <CardDescription className="text-gray-600">
              {t("signInDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username (default: admin)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password (default: secret)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    {t("rememberMe")}
                  </Label>
                </div>
                <Button variant="link" className="text-sm text-blue-600 hover:text-blue-800 p-0">
                  {t("forgotPassword")}
                </Button>
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? t("signingIn") : t("signIn")}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">
                {t("dontHaveAccount")}{" "}
                <Button variant="link" className="text-blue-600 hover:text-blue-800 p-0">
                  Sign Up
                </Button>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-4">
            <p className="text-xs text-gray-600 text-center">
              {t("demoCredentials")}:<br />
              Email: demo@ocea.com | Password: demo123
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
