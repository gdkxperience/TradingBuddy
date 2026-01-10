'use client'

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'login' | 'register'
}

export function AuthModal({ open, onOpenChange, defaultTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const validatePassword = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[a-z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++
    return strength
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setPasswordStrength(validatePassword(value))
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || null })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        setIsLoading(false)
        return
      }

      // Auto-login after registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Account created but login failed. Please try logging in.')
        setIsLoading(false)
        return
      }

      // Success - close modal and refresh
      onOpenChange(false)
      window.location.reload()
    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Invalid email or password')
        setIsLoading(false)
        return
      }

      // Success - close modal and refresh
      onOpenChange(false)
      window.location.reload()
    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200 dark:bg-gray-700'
    if (passwordStrength <= 2) return 'bg-red-500'
    if (passwordStrength === 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return ''
    if (passwordStrength <= 2) return 'Weak'
    if (passwordStrength === 3) return 'Medium'
    return 'Strong'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Trading Buddy</DialogTitle>
          <DialogDescription>
            {activeTab === 'login' 
              ? 'Sign in to access your trading data across devices'
              : 'Create an account to sync your data'}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => {
              setActiveTab('login')
              setError(null)
            }}
            className={cn(
              'flex-1 py-2 text-sm font-medium transition-colors',
              activeTab === 'login'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('register')
              setError(null)
            }}
            className={cn(
              'flex-1 py-2 text-sm font-medium transition-colors',
              activeTab === 'register'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-md text-sm text-red-800 dark:text-red-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Forms */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-name">Name (Optional)</Label>
              <Input
                id="register-name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <div className="relative">
                <Input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          'flex-1 rounded',
                          level <= passwordStrength
                            ? getPasswordStrengthColor()
                            : 'bg-gray-200 dark:bg-gray-700'
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getPasswordStrengthText()}
                  </p>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || passwordStrength < 3}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        )}

        <p className="text-xs text-center text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </DialogContent>
    </Dialog>
  )
}
