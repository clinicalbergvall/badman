import { useEffect, useRef, useState } from 'react'
import { Button, Input, Card, Badge } from '@/components/ui'
import CleanerLayout from '@/components/CleanerLayout'

import toast from 'react-hot-toast'
import type { CleanerProfile, ServiceCategory } from '@/lib/types'
import { addPendingCleaner, loadCleanerProfile, saveCleanerProfile } from '@/lib/storage'
import { authAPI, api } from '@/lib/api'

const createEmptyProfile = (): Partial<CleanerProfile> => ({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  bio: '',

  services: [],
  rating: 0,
  totalJobs: 0,
  verified: false,
  approvalStatus: 'pending',
  verification: {
    idVerified: false,
    idNumber: '',
    idDocumentFront: '',
    idDocumentBack: '',
    policeCheck: false,
    references: [],
    insuranceCoverage: false,
  },
  mpesaPhoneNumber: ''
})

export default function CleanerProfile() {
  const [profile, setProfile] = useState<Partial<CleanerProfile>>(() => createEmptyProfile())
  const previousApprovalStatus = useRef<CleanerProfile['approvalStatus']>()
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCleaner, setIsCleaner] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const [loginPhone, setLoginPhone] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [signupName, setSignupName] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const fetchProfile = async () => {
      try {
        
        const res = await api.get('/cleaners/profile')
        if (res.ok) {
          const data = await res.json()
          if (data.profile) {
            setProfile(data.profile)
            previousApprovalStatus.current = data.profile.approvalStatus
            
            saveCleanerProfile(data.profile)
            return
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile from server:', error)
      }

      
      const saved = loadCleanerProfile()
      if (saved) {
        setProfile(saved)
        previousApprovalStatus.current = saved.approvalStatus
      }
    }

    fetchProfile()
  }, [])

  const normalizePhone = (p: string): string => {
    const phone = (p || '').replace(/\s+/g, '')
    const m = phone.match(/^\+?254([17]\d{8})$/)
    if (m) return `0${m[1]}`
    return phone
  }

  useEffect(() => {
    authAPI.getProfile()
      .then((data) => {
        const success = Boolean(data?.success)
        const role = data?.user?.role
        setIsAuthenticated(success)
        setIsCleaner(role === 'cleaner')
        setAuthChecked(true)
      })
      .catch(() => {
        setAuthChecked(true)
        setIsAuthenticated(false)
        setIsCleaner(false)
      })
  }, [])

  useEffect(() => {
    if (profile.approvalStatus === 'approved' && previousApprovalStatus.current !== 'approved') {
      toast.success('You are approved! Job Hub unlocked 🎉')
    }
    previousApprovalStatus.current = profile.approvalStatus
  }, [profile.approvalStatus])

  // const _readFileAsDataUrl = (file: File | null | undefined, field: keyof BeforeAfterForm) => {
  //   if (!file) return
  //   const reader = new FileReader()
  //   reader.onloadend = () => {
  //     setBeforeAfterForm((prev: any) => ({
  //       ...prev,
  //       [field]: reader.result as string
  //     }))
  //   }
  //   reader.readAsDataURL(file)
  // }

  // const _handleRemoveCompletedJob = (jobId: string) => {
  //   setProfile((prev: any) => ({
  //     ...prev,
  //     beforeAfterPhotos: (prev.beforeAfterPhotos || []).filter((photo: any) => photo.id !== jobId)
  //   }))
  //   toast.success('Removed job from gallery')
  // }


  const handleCancel = () => {
    const saved = loadCleanerProfile()
    if (saved) {
      setProfile(saved)
      toast.success('Reverted to last saved profile')
    } else {
      setProfile(createEmptyProfile())
      toast('Cleared form', { icon: '🧼' })
    }

  }

  const handleAuthLogin = async () => {
    if (!loginPhone || !loginPassword) {
      toast.error('Enter phone and password')
      return
    }
    try {
      setIsSubmitting(true)
      const resp = await authAPI.login(normalizePhone(loginPhone), loginPassword)
      if (resp?.success && resp?.user?.role === 'cleaner') {
        toast.success('Signed in as cleaner')
        setIsAuthenticated(true)
        setIsCleaner(true)
      } else {
        toast.error('Sign in as a cleaner')
      }
    } catch (e: any) {
      toast.error(e?.message || 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAuthSignup = async () => {
    if (!signupName || signupName.trim().length < 2) {
      toast.error('Enter your full name')
      return
    }
    if (!loginPhone || !loginPassword) {
      toast.error('Enter phone and password')
      return
    }
    try {
      setIsSubmitting(true)
      const resp = await authAPI.register({
        name: signupName,
        phone: normalizePhone(loginPhone),
        password: loginPassword,
        role: 'cleaner',
      })
      if (resp?.success && resp?.user?.role === 'cleaner') {
        toast.success('Account created. Signed in as cleaner')
        setIsAuthenticated(true)
        setIsCleaner(true)
      } else {
        toast.error(resp?.message || 'Registration failed')
      }
    } catch (e: any) {
      toast.error(e?.message || 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  
  const toggleService = (service: ServiceCategory) => {
    const services = profile.services || []
    if (services.includes(service)) {
      setProfile({ ...profile, services: services.filter((s: any) => s !== service) })
    } else {
      setProfile({ ...profile, services: [...services, service] })
    }
  }

  const handleSaveProfile = async () => {
    
    if (!profile.firstName || !profile.lastName || !profile.phone || !profile.address || !profile.city) {
      toast.error('Please fill in all required fields')
      return
    }

    if ((profile.services || []).length === 0) {
      toast.error('Please select at least one service')
      return
    }

    
    if (!profile.mpesaPhoneNumber) {
      toast.error('Add your M-Pesa phone number to receive payouts')
      return
    }

    // Profile submission requires admin verification

    const profileId = profile.id || Date.now().toString()

    const savedProfile: CleanerProfile = {
      id: profileId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      email: profile.email || '',
      address: profile.address,
      city: profile.city,
      bio: profile.bio,

      services: profile.services || [],
      rating: 0,
      totalJobs: 0,
      verified: false,
      approvalStatus: 'pending',
      portfolioImages: [],

      verification: undefined,
      mpesaPhoneNumber: profile.mpesaPhoneNumber || '',
      createdAt: new Date().toISOString(),
    }

    
    try {
      const response = await api.post('/cleaners/profile', {
        firstName: savedProfile.firstName,
        lastName: savedProfile.lastName,
        phone: savedProfile.phone,
        email: savedProfile.email,
        address: savedProfile.address,
        city: savedProfile.city,
        bio: savedProfile.bio,
        services: savedProfile.services,
        mpesaPhoneNumber: savedProfile.mpesaPhoneNumber
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        const msg = (err && (err.message || err.error)) || 'Failed to submit profile'
        throw new Error(msg)
      }
      const data = await response.json()
      if (data?.success) {
        toast.success('Profile submitted! Awaiting admin verification (24-48 hours) ⏳')
        
        // Update user session to reflect that profile exists
        const session = JSON.parse(localStorage.getItem('cleancloak-user-session') || '{}');
        session.hasProfile = true;
        localStorage.setItem('cleancloak-user-session', JSON.stringify(session));

        saveCleanerProfile(savedProfile)
        addPendingCleaner(savedProfile)
        setProfile(savedProfile)
        
        // Redirect to pending page
        setTimeout(() => {
          window.location.href = '/pending-verification';
        }, 2000);
      } else {
        throw new Error(data?.message || 'Submission failed')
      }
    } catch (error) {
      const { getUserFriendlyError } = await import('@/lib/errorHandler');
      toast.error(`${getUserFriendlyError(error)}. Please sign in as a cleaner and try again.`)
      
    }
  }

  // Require authentication as cleaner to access profile page
  if (!authChecked || !isAuthenticated || !isCleaner) {
    return (
      <CleanerLayout currentPage="profile">
        <div className="max-w-md mx-auto space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Sign in as Cleaner</h2>
            {isSignup && (
              <Input
                label="Full Name"
                value={signupName}
                onChange={(e: any) => setSignupName(e.target.value)}
                placeholder="Your full name"
              />
            )}
            <Input
              label="Phone Number"
              type="tel"
              value={loginPhone}
              onChange={(e: any) => setLoginPhone(e.target.value)}
              placeholder="0712345678"
              helperText="Use 07XXXXXXXX or 01XXXXXXXX"
            />
            <Input
              label="Password"
              type="password"
              value={loginPassword}
              onChange={(e: any) => setLoginPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <div className="flex gap-3">
              {isSignup ? (
                <Button fullWidth onClick={handleAuthSignup} loading={isSubmitting}>
                  Sign up as Cleaner
                </Button>
              ) : (
                <Button fullWidth onClick={handleAuthLogin} loading={isSubmitting}>
                  Sign in as Cleaner
                </Button>
              )}
            </div>
            <p className="text-center text-sm text-gray-600">
              {isSignup ? (
                <>
                  Already have an account?{' '}
                  <span
                    className="text-yellow-600 font-semibold cursor-pointer hover:text-yellow-700"
                    onClick={() => setIsSignup(false)}
                  >
                    Sign in instead
                  </span>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{' '}
                  <span
                    className="text-yellow-600 font-semibold cursor-pointer hover:text-yellow-700"
                    onClick={() => setIsSignup(true)}
                  >
                    Sign up instead
                  </span>
                </>
              )}
            </p>
          </Card>
        </div>
      </CleanerLayout>
    )
  }

  // Main profile form

  return (
    <CleanerLayout currentPage="profile">
      <div className="max-w-4xl mx-auto space-y-6">
        {}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Tell us about yourself and showcase your work</p>
        </div>

        {/* Verification status shown after submission */}

        {}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              value={profile.firstName}
              onChange={(e: any) => setProfile({ ...profile, firstName: e.target.value })}
              placeholder="Enter your first name"
            />
            <Input
              label="Last Name"
              required
              value={profile.lastName}
              onChange={(e: any) => setProfile({ ...profile, lastName: e.target.value })}
              placeholder="Enter your last name"
            />
            <Input
              label="Phone Number"
              type="tel"
              required
              value={profile.phone}
              onChange={(e: any) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+2547XXXXXXXX"
            />
            <Input
              label="Email (Optional)"
              type="email"
              value={profile.email}
              onChange={(e: any) => setProfile({ ...profile, email: e.target.value })}
              placeholder="your.email@example.com"
            />
            <Input
              label="Address"
              required
              value={profile.address}
              onChange={(e: any) => setProfile({ ...profile, address: e.target.value })}
              placeholder="Street Address"
            />
            <Input
              label="City"
              required
              value={profile.city}
              onChange={(e: any) => setProfile({ ...profile, city: e.target.value })}
              placeholder="Enter your city"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio (Optional)
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell clients about your experience and expertise..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>
        </Card>

        {}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="warning">Important</Badge>
            <h2 className="text-xl font-semibold text-gray-900">Payout Settings</h2>
          </div>
          <p className="text-sm text-gray-600">Configure your M-Pesa number to receive your earnings.</p>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">M-Pesa Phone Number</label>
            <input
              type="tel"
              value={profile.mpesaPhoneNumber || ''}
              onChange={(e) => setProfile({ ...profile, mpesaPhoneNumber: e.target.value })}
              placeholder="254712345678"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Format: 2547XXXXXXXX (Kenya M-Pesa number)</p>
          </div>
        </Card>


        {}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Services You Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => toggleService('car-detailing')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${(profile.services || []).includes('car-detailing')
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">🚗</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Car Detailing</h3>
                  <p className="text-sm text-gray-600">Professional car wash & detailing</p>
                </div>
                {(profile.services || []).includes('car-detailing') && (
                  <svg className="w-6 h-6 text-yellow-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </Card>





        {}
        <div className="flex gap-4">
          <Button variant="outline" fullWidth onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            fullWidth
            onClick={handleSaveProfile}
          >
            Save Profile
          </Button>
        </div>
      </div>
    </CleanerLayout>
  )
}
