import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Phone, ShieldCheck, ArrowRight, RefreshCw, Sprout } from 'lucide-react'
import {
  LayoutShell,
  SectionTitle,
  Card,
  Input,
  Button,
  Badge,
} from '@/components/ui'
import { useAuth } from '@/context/AuthContext'

export const LoginPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { sendOtp, verifyOtp } = useAuth()

  // Form states
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [isLoading, setIsLoading] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [otpError, setOtpError] = useState('')

  // Where to send user after login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  // Phone Validation
  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length !== 10) {
      return t('auth.phoneError')
    }
    return ''
  }

  // Handle Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setPhoneError('')

    const err = validatePhone(phoneNumber)
    if (err) {
      setPhoneError(err)
      return
    }

    setIsLoading(true)
    try {
      const res = await sendOtp(phoneNumber)
      if (res.success) {
        setStep('otp')
      } else {
        setPhoneError(res.error || 'Failed to send OTP')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setOtpError('')

    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError(t('auth.otpError'))
      return
    }

    setIsLoading(true)
    try {
      const res = await verifyOtp(phoneNumber, otpCode.trim())
      if (res.success) {
        // Auth state listener handles redirect to /onboarding if needed
        navigate(from, { replace: true })
      } else {
        setOtpError(res.error || 'Invalid OTP code')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LayoutShell showFooter={false}>
      <main className="max-w-xl mx-auto px-4 sm:px-8 py-12 sm:py-20 flex flex-col gap-8">
        {/* Brand Icon & Welcome Title */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-pill bg-surface border border-line flex items-center justify-center text-forest shadow-sm">
            <Sprout className="w-7 h-7" />
          </div>

          <SectionTitle
            size="lg"
            title={t('auth.loginTitle')}
            subtitle={t('auth.loginSubtitle')}
            contrast="light"
            align="center"
          />

          <Card variant="ink" className="w-full flex flex-col gap-6 border-forest/60 shadow-2xl mt-2">
            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
                <div className="flex items-center gap-2">
                  <Badge variant="lime" dot pulsing>
                    OTP Auth
                  </Badge>
                  <span className="text-xs text-muted font-mono">
                    SMS PROTOCOL
                  </span>
                </div>

                <Input
                  label={t('auth.phoneLabel')}
                  placeholder={t('auth.phonePlaceholder')}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  error={phoneError}
                  icon={<Phone className="w-4 h-4" />}
                  maxLength={10}
                  type="tel"
                  autoFocus
                />

                <Button
                  type="submit"
                  variant="accent"
                  size="md"
                  loading={isLoading}
                  className="w-full"
                >
                  {t('auth.sendOtp')}
                </Button>

                {/* Dev Hint Box */}
                <div className="p-3.5 rounded-input bg-forest/30 border border-forest/60 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-white">
                      {t('auth.devHint')}
                    </span>
                    <span className="text-xs text-muted">
                      Enter any 10-digit number. Test code is 123456.
                    </span>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone')
                      setOtpCode('')
                      setOtpError('')
                    }}
                    className="text-xs text-muted hover:text-white transition-colors focus:outline-none"
                  >
                    ← {t('auth.changePhone')}
                  </button>
                  <span className="text-xs font-mono text-muted">
                    +91 {phoneNumber}
                  </span>
                </div>

                <Input
                  label={t('auth.otpLabel')}
                  placeholder={t('auth.otpPlaceholder')}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  error={otpError}
                  maxLength={6}
                  autoFocus
                  className="text-center font-mono tracking-widest text-lg"
                />

                <Button
                  type="submit"
                  variant="accent"
                  size="md"
                  loading={isLoading}
                  className="w-full"
                >
                  <span>{t('auth.verifyBtn')}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-forest/40">
                  <span>{t('auth.otpSent')}</span>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="text-white hover:underline font-mono inline-flex items-center gap-1 focus:outline-none"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend OTP</span>
                  </button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </main>
    </LayoutShell>
  )
}
