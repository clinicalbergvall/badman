import { useState, useEffect, useMemo, useRef } from "react";
import {
  Button,
  Input,
  Card,
  ProgressBar,
  ChatComponent,
  ImageCarousel,
} from "@/components/ui";
import CleanerProfile from "./CleanerProfile";
import { PaymentModal } from "@/components/PaymentModal";
import {
  VEHICLE_CATEGORIES,
  CAR_SERVICE_PACKAGES,
  PAINT_CORRECTION_STAGES,
  CAR_DETAILING_EXTRAS,
  INTERIOR_SERVICES,
  EXTERIOR_SERVICES,
  CLEANING_CATEGORIES,
  ROOM_SIZES,
  BATHROOM_PRICING,
  WINDOW_PRICING,
  ROOM_PRICING,
  FUMIGATION_PRICING,
  MOVE_IN_OUT_PRICING,
  POST_CONSTRUCTION_PRICING,
  getCarDetailingPrice,
  getHomeCleaningPrice,
  loginSchema,
} from "@/lib/validation";
import type {
  VehicleType,
  CarServicePackage,
  PaintCorrectionStage,
  CarDetailingExtra,
  MidSUVPricingTier,
  ServiceCategory,
  BookingType,
  PaymentMethod,
  CleaningCategory,
  HouseCleaningType,
  FumigationType,
  RoomSize,
} from "@/lib/types";
import { formatCurrency, formatPhoneNumber } from "@/lib/utils";
import {
  saveUserSession,
  loadUserSession,
} from "@/lib/storage";
import { getCurrentLocation, getLocationPermissionStatus } from "@/lib/location";
import { authAPI, api } from "@/lib/api";
import toast from "react-hot-toast";
import { logger } from "@/lib/logger";

// Carousel images for booking sections
const carDetailingCarouselImages = [
  {
    id: 1,
    title: "Professional Car Polishing",
    description: "Expert detailing with premium equipment",
    image: "/assets/images/car-polish-new.png",
  },
  {
    id: 2,
    title: "Pressure Washing Service",
    description: "Deep cleaning with high-pressure equipment",
    image: "/assets/images/pressure-wash-new.png",
  },
  {
    id: 5,
    title: "Interior Steam Cleaning",
    description: "Deep sanitation and stain removal",
    image: "/assets/images/interior-steam-cleaning.jpg",
  },
  {
    id: 6,
    title: "Premium Foam Wash",
    description: "Gentle and effective exterior cleaning",
    image: "/assets/images/premium-foam-wash.jpg",
  },
  {
    id: 7,
    title: "Detailed Interior Care",
    description: "Thorough cleaning for every corner",
    image: "/assets/images/interior-detailing.jpg",
  },
];

const homeCleaningCarouselImages = [
  {
    id: 101,
    title: "Fumigation Service",
    description: "Professional fumigation and sanitation",
    image: "/assets/images/fumigation-service.jpg",
  },
  {
    id: 102,
    title: "Move‑In/Move‑Out",
    description: "Thorough prep and deep tidy before or after moving",
    image: "/assets/cleaning/pexels-matilda-wormwood-4098579.jpg",
  },
  {
    id: 103,
    title: "Sofa Set Deep Cleaning",
    description: "Upholstery vacuuming, shampoo, and stain removal",
    image: "/assets/images/jasban-sofa-set-cleaning-services-3.jpeg",
  },
  {
    id: 104,
    title: "Edge & Detail Clean",
    description: "Precision cleaning of trims and corners",
    image: "/assets/cleaning/pexels-tima-miroshnichenko-6196688.jpg",
  },
  {
    id: 105,
    title: "After Build Shine",
    description: "Final touch for spotless interiors",
    image: "/assets/cleaning/ashwini-chaudhary-monty-Iu6parQAO-U-unsplash.jpg",
  },
];

type UserType = "client" | "cleaner" | "admin" | null;

type StageId =
  | "account"
  | "category"
  | "details"
  | "extras"
  | "schedule"
  | "review";

interface StageDefinition {
  id: StageId;
  label: string;
  optional?: boolean;
}

export default function BookingEnhanced() {
  const carVideoRef = useRef<HTMLVideoElement | null>(null)
  const homeVideoRef = useRef<HTMLVideoElement | null>(null)
  const [canAutoplay, setCanAutoplay] = useState(true)
  const useMobileSrc = useMemo(() => {
    if (!canAutoplay) return true
    if (typeof window === 'undefined') return false
    return window.innerWidth <= 768
  }, [canAutoplay])
  const getVideoSrc = (src: string) => {
    if (!src || !src.endsWith('.mp4')) return src
    // If already a mobile-optimized source, return as-is
    if (/-mobile-720p\.mp4$/.test(src)) return src
    if (!useMobileSrc) return src
    const base = src.slice(0, -4)
    return `${base}-mobile-720p.mp4`
  }
  const [userType, setUserType] = useState<UserType>(null);
  const [step, setStep] = useState(1);
  const [serviceCategory, setServiceCategory] =
    useState<ServiceCategory>("car-detailing");

  // Form data
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  // Car Detailing State
  const [vehicleType, setVehicleType] = useState<VehicleType | "">("");
  const [carServicePackage, setCarServicePackage] = useState<
    CarServicePackage | ""
  >("");
  const [paintStage, setPaintStage] = useState<PaintCorrectionStage | "">("");
  const [midSUVTier, setMidSUVTier] = useState<MidSUVPricingTier>("STANDARD");
  const [fleetCarCount, setFleetCarCount] = useState<number>(5);
  const [selectedCarExtras, setSelectedCarExtras] = useState<
    CarDetailingExtra[]
  >([]);
  const [selectedCarServices, setSelectedCarServices] = useState<string[]>([]);

  // Home Cleaning State
  const [cleaningCategory, setCleaningCategory] = useState<
    CleaningCategory | ""
  >("");
  const [houseCleaningType, setHouseCleaningType] = useState<
    HouseCleaningType | ""
  >("");
  const [fumigationType, setFumigationType] = useState<FumigationType | "">("");
  const [roomSize, setRoomSize] = useState<RoomSize | "">("");

  // Specifics
  const [bathroomItems, setBathroomItems] = useState({
    general: false,
    sink: false,
    toilet: false,
  });
  const [windowCount, setWindowCount] = useState({
    small: 0,
    large: 0,
    wholeHouse: false,
  });

  const [bookingType, setBookingType] = useState<BookingType>("immediate");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");
  const [location, setLocation] = useState<{
    address?: string;
    manualAddress?: string;
  }>({});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState<string>("unknown");

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState("");
  const [currentBookingAmount, setCurrentBookingAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const session = loadUserSession();
    if (session) {
      setUserType(session.userType);
      setName(session.name || "");
      setPhone(session.phone || "");
      if (session.userType === "client") {
        setStep(2);
        setIsSignup(false);
      }
    }
    getLocationPermissionStatus().then(setLocationPermission).catch(() => setLocationPermission("unknown"));
  }, []);

  useEffect(() => {
    setCanAutoplay(true)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLVideoElement
        if (!el) return
        if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
          el.muted = true
          el.play().catch(() => {})
        } else {
          el.pause()
        }
      })
    }, { threshold: [0.2, 0.5, 0.8] })
    if (carVideoRef.current) observer.observe(carVideoRef.current)
    if (homeVideoRef.current) observer.observe(homeVideoRef.current)
    return () => observer.disconnect()
  }, [])

  const rememberSession = (payload: {
    userType: "client" | "cleaner";
    name?: string;
    phone?: string;
  }) => {
    saveUserSession({
      userType: payload.userType,
      name: payload.name || "",
      phone: payload.phone || "",
      lastSignedIn: new Date().toISOString(),
    });
  };

  const roleFromUserType = (u: UserType): "client" | "cleaner" => {
    return u === "cleaner" ? "cleaner" : "client"
  }

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    if (type === "cleaner") {
      rememberSession({ userType: "cleaner" });
    }
  };

  const extrasEnabled = serviceCategory === "car-detailing";

  const stageDefinitions = useMemo<StageDefinition[]>(
    () => [
      { id: "account", label: "Account" },
      { id: "category", label: "Service Type" },
      {
        id: "details",
        label:
          serviceCategory === "car-detailing"
            ? "Vehicle & Package"
            : "Cleaning Details",
      },
      { id: "extras", label: "Add-ons", optional: true },
      { id: "schedule", label: "Schedule & Location" },
      { id: "review", label: "Review" },
    ],
    [serviceCategory],
  );

  const activeStages = useMemo(
    () =>
      stageDefinitions.filter(
        (stage) => extrasEnabled || stage.id !== "extras",
      ),
    [stageDefinitions, extrasEnabled],
  );

  const currentStageId = useMemo<StageId>(() => {
    if (step <= 1) return "account";
    if (step === 2) return "category";
    if (step === 3) return "details";
    if (step === 3.5 && extrasEnabled) return "extras";
    if (step === 4) return "schedule";
    return "review";
  }, [step, extrasEnabled]);

  const currentStageIndex = activeStages.findIndex(
    (stage) => stage.id === currentStageId,
  );
  const normalizedStageIndex = currentStageIndex === -1 ? 0 : currentStageIndex;

  const progress =
    activeStages.length > 1
      ? Math.min(
          100,
          Math.max(0, (normalizedStageIndex / (activeStages.length - 1)) * 100),
        )
      : 0;

  // Calculate price
  const price =
    serviceCategory === "car-detailing" && vehicleType && carServicePackage
      ? getCarDetailingPrice(
          vehicleType,
          carServicePackage,
          paintStage || undefined,
          midSUVTier,
          fleetCarCount,
        )
      : serviceCategory === "home-cleaning" && cleaningCategory
        ? getHomeCleaningPrice(cleaningCategory, {
            houseCleaningType: houseCleaningType || undefined,
            bathroomItems,
            windowCount,
            fumigationType: fumigationType || undefined,
            roomSize: roomSize || undefined,
          })
        : 0;

  // Calculate addons total from selected extras
  const carAddonsTotal =
    serviceCategory === "car-detailing"
      ? selectedCarExtras.reduce((total, extraId) => {
          const extra = CAR_DETAILING_EXTRAS.find((e) => e.id === extraId);
          return total + (extra?.price ?? 0);
        }, 0)
      : 0;

  const addonsTotal = carAddonsTotal;
  const totalPrice = price + addonsTotal;

  const PACKAGE_VIDEOS: Record<CarServicePackage, string> = {
    "NORMAL-DETAIL": "/assets/detailing/6873163-mobile-720p.mp4",
    "INTERIOR-STEAMING": "/assets/detailing/6873149-mobile-720p.mp4",
    "PAINT-CORRECTION": "/assets/detailing/6872065-mobile-720p.mp4",
    "FULL-DETAIL": "/assets/detailing/6872474-mobile-720p.mp4",
    "FLEET-PACKAGE": "",
  } as const
  const PACKAGE_FALLBACK_IMAGES: Record<CarServicePackage, string> = {
    "NORMAL-DETAIL": "/assets/images/premium-foam-wash.jpg",
    "INTERIOR-STEAMING": "/assets/images/premium-foam-wash.jpg",
    "PAINT-CORRECTION": "/assets/images/premium-foam-wash.jpg",
    "FULL-DETAIL": "/assets/images/premium-foam-wash.jpg",
    "FLEET-PACKAGE": "/assets/images/premium-foam-wash.jpg",
  } as const

  const CLEANING_MEDIA: Record<CleaningCategory, { type: 'video' | 'image'; src: string }> = {
    HOUSE_CLEANING: { type: 'video', src: '/assets/cleaning/6196272-mobile-720p.mp4' },
    MOVE_IN_OUT: { type: 'video', src: '/assets/cleaning/6197568-mobile-720p.mp4' },
    POST_CONSTRUCTION: { type: 'video', src: '/assets/cleaning/uhd_25fps-mobile-720p.mp4' },
    FUMIGATION: { type: 'image', src: '/assets/images/professional-fumigation.jpg' },
  }
  const CLEANING_FALLBACK_IMAGES: Record<CleaningCategory, string> = {
    HOUSE_CLEANING: "/assets/cleaning/fumigation-service.jpg",
    MOVE_IN_OUT: "/assets/cleaning/fumigation-service.jpg",
    POST_CONSTRUCTION: "/assets/cleaning/fumigation-service.jpg",
    FUMIGATION: "/assets/cleaning/fumigation-service.jpg",
  }

  const [failedPackage, setFailedPackage] = useState<Record<CarServicePackage, boolean>>({
    "NORMAL-DETAIL": false,
    "INTERIOR-STEAMING": false,
    "PAINT-CORRECTION": false,
    "FULL-DETAIL": false,
    "FLEET-PACKAGE": false,
  })
  const [failedCleaning, setFailedCleaning] = useState<Record<CleaningCategory, boolean>>({
    HOUSE_CLEANING: false,
    MOVE_IN_OUT: false,
    POST_CONSTRUCTION: false,
    FUMIGATION: false,
  })

  // User type selection screen
  if (!userType) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl"></span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">Tell us about yourself to get started</p>
        </div>

        <div className="space-y-4">
          <p className="font-semibold text-gray-900 mb-3">I want to:</p>

          <Card
            variant="outlined"
            hoverable
            className="p-6 cursor-pointer transition-all hover:border-gray-400"
            onClick={() => handleUserTypeSelect("client")}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">🏠</div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-1">
                  Book Cleaning Services
                </h3>
                <p className="text-sm text-gray-600">
                  Find car detailers and professional cleaners for your home or
                  office
                </p>
              </div>
            </div>
          </Card>

          <Card
            variant="outlined"
            hoverable
            className="p-6 cursor-pointer transition-all border-2 border-yellow-400 bg-yellow-50 hover:border-yellow-500"
            onClick={() => handleUserTypeSelect("cleaner")}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">💼</div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-1">
                  Setup Personal Business
                </h3>
                <p className="text-sm text-gray-600">
                  Offer cleaning services and grow your business
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Cleaner registration flow
  if (userType === "cleaner") {
    return (
      <div>
        <button
          onClick={() => setUserType(null)}
          className="text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
        <CleanerProfile />
      </div>
    );
  }

  // Client booking flow
  const handleGetLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const loc = await getCurrentLocation();
      if (loc) {
        setLocation({ address: loc.address });
        toast.success("Location detected!");
      } else {
        toast.error("Could not get location. Please enter manually.");
      }
    } catch (error) {
      toast.error("Could not get location. Please enter manually.");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const bookingPayload = {
        contact: {
          name: name.trim() || "Clean Cloak Client",
          phone,
        },
        serviceCategory,
        // Car Detailing
        vehicleType:
          serviceCategory === "car-detailing" ? vehicleType : undefined,
        carServicePackage:
          serviceCategory === "car-detailing" ? carServicePackage : undefined,
        paintCorrectionStage:
          carServicePackage === "PAINT-CORRECTION" ? paintStage : undefined,
        midSUVPricingTier: vehicleType === "MID-SUV" ? midSUVTier : undefined,
        fleetCarCount:
          carServicePackage === "FLEET-PACKAGE" ? fleetCarCount : undefined,
        selectedCarExtras:
          selectedCarExtras.length > 0 ? selectedCarExtras : undefined,

        // Home Cleaning
        cleaningCategory:
          serviceCategory === "home-cleaning" ? cleaningCategory : undefined,
        roomSize: serviceCategory === "home-cleaning" ? roomSize : undefined,
        houseCleaningType:
          cleaningCategory === "HOUSE_CLEANING" ? houseCleaningType : undefined,
        fumigationType:
          cleaningCategory === "FUMIGATION" ? fumigationType : undefined,
        bathroomItems:
          cleaningCategory === "HOUSE_CLEANING" &&
          houseCleaningType === "BATHROOM"
            ? bathroomItems
            : undefined,
        windowCount:
          cleaningCategory === "HOUSE_CLEANING" &&
          houseCleaningType === "WINDOW"
            ? windowCount
            : undefined,

        location,
        bookingType,
        scheduledDate: bookingType === "scheduled" ? scheduledDate : undefined,
        scheduledTime: bookingType === "scheduled" ? scheduledTime : undefined,
        paymentMethod,
        price: totalPrice,
        paymentStatus: "pending",
      };

      const response = await api.post("/bookings/public", bookingPayload);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "Failed to submit booking");
      }

      const data = await response.json();
      const bookingRecord = data.booking || bookingPayload;

      // Remember session
      rememberSession({
        userType: "client",
        name: name.trim() || bookingRecord.contact?.name,
        phone,
      });

      // Show success message - NO payment yet (pay after work completion)
      toast.success(
        "🎉 Booking created! A cleaner will accept your request soon.",
      );

      // Reset form but keep user in the booking flow (avoid sign-in screen)
      setTimeout(() => {
        setStep(2);
        setName("");
        setPhone("");
        // Reset Car
        setVehicleType("");
        setCarServicePackage("");
        setPaintStage("");
        setMidSUVTier("STANDARD");
        setFleetCarCount(5);
        setSelectedCarExtras([]);
        // Reset Home
        setCleaningCategory("");
        setHouseCleaningType("");
        setFumigationType("");
        setRoomSize("");
        setBathroomItems({
          general: false,
          sink: false,
          toilet: false,
        });
        setWindowCount({ small: 0, large: 0, wholeHouse: false });
      }, 1000);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Booking failed. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Back button */}
      {step === 1 && (
        <button
          onClick={() => setUserType(null)}
          className="text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl"></span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Clean Cloak</h1>
        <p className="text-gray-600">
          {step === 1 &&
            (isSignup
              ? "Create your account"
              : "Sign in to book cleaning services")}
          {step === 2 && "Choose your service type"}
          {step === 3 && "Select service details"}
          {step === 4 && "Location & scheduling"}
          {step === 5 && "Review your booking"}
        </p>
      </div>

      {/* Step Indicators */}
      <div className="space-y-3">
        <ProgressBar value={progress} className="mb-1" />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {activeStages.map((stage, index) => {
            const status =
              index < normalizedStageIndex
                ? "complete"
                : index === normalizedStageIndex
                  ? "current"
                  : "upcoming";
            const statusClasses =
              status === "complete"
                ? "bg-black text-white border-black shadow-sm"
                : status === "current"
                  ? "bg-yellow-100 text-yellow-900 border-yellow-300"
                  : "bg-gray-100 text-gray-400 border-gray-200";

            return (
              <div
                key={stage.id}
                className={`min-w-[120px] text-center px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold ${statusClasses}`}
              >
                <span>{stage.label}</span>
                {stage.optional && (
                  <span className="block text-[10px] uppercase tracking-wide opacity-80">
                    Optional
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Login */}
      {step === 1 && (
        <div className="space-y-4">
          {isSignup && (
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Adrian Wasiali"
              helperText="Enter your full name"
            />
          )}
          <Input
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0712345678"
            helperText="Use your Safaricom number registered for M‑Pesa (07XXXXXXXX or 01XXXXXXXX)"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            helperText={
              isSignup ? "Minimum 6 characters" : "Enter your password"
            }
          />
          <Button
            fullWidth
            disabled={isSubmitting}
            onClick={async () => {
              // Validate password length client-side first
              if (!password || password.length < 6) {
                toast.error("Password must be at least 6 characters");
                return;
              }

              // No validation needed for login - backend will handle it

              try {
                setIsSubmitting(true);

                let response;
                if (isSignup) {
                  const normalizedPhone = (() => {
                    const p = (phone || '').replace(/\s+/g, '')
                    const m = p.match(/^\+?254([17]\d{8})$/)
                    if (m) return `0${m[1]}`
                    return p
                  })()
                  response = await authAPI.register({
                    name,
                    phone: normalizedPhone,
                    password,
                    role: roleFromUserType(userType),
                  });
                } else {
                  // For login, we use phone as identifier
                  const p = (phone || '').replace(/\s+/g, '')
                  const m = p.match(/^\+?254([17]\d{8})$/)
                  const normalized = m ? `0${m[1]}` : p
                  response = await authAPI.login(normalized, password);
                }

                if (response.success && response.user) {
                  // Token is in httpOnly cookie now

                  toast.success(
                    isSignup
                      ? "Account created successfully! 🎉"
                      : "Signed in successfully!",
                  );
                  setStep(2);

                  // Update local session state
                  rememberSession({
                    userType: "client",
                    name: response.user?.name || name.trim() || "Valued Client",
                    phone: response.user?.phone || phone,
                  });
                } else {
                  toast.error(
                    response.message || "Invalid phone number or password",
                  );
                }
              } catch (error: any) {
                logger.error("Auth error:", error);
                toast.error(
                  error.message ||
                    "Authentication failed. Please check your credentials.",
                );
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="mt-6"
          >
            {isSignup ? "Sign up" : "Sign in"}
          </Button>
          <p className="text-center text-sm text-gray-600 mt-4">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <span
                  className="text-yellow-600 font-semibold cursor-pointer hover:text-yellow-700"
                  onClick={() => setIsSignup(false)}
                >
                  Sign in instead
                </span>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <span
                  className="text-yellow-600 font-semibold cursor-pointer hover:text-yellow-700"
                  onClick={() => setIsSignup(true)}
                >
                  Sign up instead
                </span>
              </>
            )}
          </p>
        </div>
      )}

      {/* Step 2: Service Category */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <p className="font-semibold text-gray-900 mb-3">
              Select Service Type:
            </p>

            <div className="space-y-4">
              <Card
                variant={
                  serviceCategory === "car-detailing" ? "default" : "outlined"
                }
                hoverable
                selected={serviceCategory === "car-detailing"}
                className="p-6 cursor-pointer"
                onClick={() => setServiceCategory("car-detailing")}
              >
                <div className="-mt-2 -mx-2 mb-4">
                  <video
                    className="w-full h-36 object-cover rounded-xl"
                    src={"/assets/detailing/6873165-mobile-720p.mp4"}
                    ref={carVideoRef}
                    muted
                    loop
                    playsInline
                    preload="none"
                    autoPlay
                    controls={false}
                    poster="/assets/images/premium-foam-wash.jpg"
                  />
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🚗</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Car Detailing
                    </h3>
                    <p className="text-sm text-gray-600">
                      Professional car wash and detailing services
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                variant={
                  serviceCategory === "home-cleaning" ? "default" : "outlined"
                }
                hoverable
                selected={serviceCategory === "home-cleaning"}
                className="p-6 cursor-pointer"
                onClick={() => setServiceCategory("home-cleaning")}
              >
                <div className="-mt-2 -mx-2 mb-4">
                  <video
                    className="w-full h-36 object-cover rounded-xl"
                    ref={homeVideoRef}
                    muted
                    loop
                    playsInline
                    preload="none"
                    autoPlay
                    controls={false}
                    poster="/assets/cleaning/fumigation-service.jpg"
                  >
                    <source src={"/assets/cleaning/6195933-mobile-720p.mp4"} type="video/mp4" />
                  </video>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🏠</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Home Cleaning
                    </h3>
                    <p className="text-sm text-gray-600">
                      House cleaning, fumigation, and moving services
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Visual previews embedded in selection cards */}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} fullWidth>
              Back
            </Button>
            <Button onClick={() => setStep(3)} fullWidth>
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Service Selection */}
      {step === 3 && (
        <div className="space-y-4">
          {serviceCategory === "car-detailing" ? (
            <>
              {/* Car Detailing Image Carousel */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Our Car Detailing Services
                </h3>
                <ImageCarousel
                  images={carDetailingCarouselImages}
                  interval={3500}
                />
              </div>

              <p className="font-semibold text-gray-900 mb-3">
                Select Vehicle Type:
              </p>
              <div className="grid gap-3">
                {VEHICLE_CATEGORIES.map((cat) => (
                  <Card
                    key={cat.id}
                    variant={vehicleType === cat.id ? "default" : "outlined"}
                    hoverable
                    selected={vehicleType === cat.id}
                    className="p-4 cursor-pointer"
                    onClick={() => setVehicleType(cat.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {cat.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {cat.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {vehicleType && (
                <>
                  <p className="font-semibold text-gray-900 mb-3 mt-6">
                    Select Service Package:
                  </p>
                  <div className="grid gap-3">
                    {CAR_SERVICE_PACKAGES.map((pkg) => {
                      // Calculate price for display
                      let displayPrice = 0;
                      if (pkg.id === "PAINT-CORRECTION") {
                        // Show Stage 1 price as base
                        displayPrice = getCarDetailingPrice(
                          vehicleType,
                          pkg.id,
                          "STAGE-1",
                          midSUVTier,
                        );
                      } else if (pkg.id === "FLEET-PACKAGE") {
                        // Show per-car price
                        displayPrice = getCarDetailingPrice(
                          vehicleType,
                          pkg.id,
                          undefined,
                          midSUVTier,
                          1,
                        );
                      } else {
                        displayPrice = getCarDetailingPrice(
                          vehicleType,
                          pkg.id,
                          undefined,
                          midSUVTier,
                        );
                      }

                      return (
                        <Card
                          key={pkg.id}
                          variant={
                            carServicePackage === pkg.id
                              ? "default"
                              : "outlined"
                          }
                          hoverable
                          selected={carServicePackage === pkg.id}
                          className="p-4 cursor-pointer"
                          onClick={() => {
                            setCarServicePackage(pkg.id);
                            // Reset dependent fields
                            if (pkg.id !== "PAINT-CORRECTION")
                              setPaintStage("");
                            if (pkg.id !== "FLEET-PACKAGE") setFleetCarCount(5);
                          }}
                        >
                          <div className="-mt-2 -mx-2 mb-4">
                            {PACKAGE_VIDEOS[pkg.id] && !failedPackage[pkg.id] ? (
                              <video
                                className="w-full h-32 sm:h-40 object-cover rounded-xl"
                                src={getVideoSrc(PACKAGE_VIDEOS[pkg.id])}
                                muted
                                loop
                                playsInline
                                preload="none"
                                autoPlay
                                controls={false}
                                poster={PACKAGE_FALLBACK_IMAGES[pkg.id]}
                                onError={() => setFailedPackage((p) => ({ ...p, [pkg.id]: true }))}
                              />
                            ) : PACKAGE_FALLBACK_IMAGES[pkg.id] ? (
                              <img
                                src={PACKAGE_FALLBACK_IMAGES[pkg.id]}
                                alt={pkg.name}
                                className="w-full h-32 sm:h-40 object-cover rounded-xl"
                                loading="lazy"
                              />
                            ) : null}
                          </div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {pkg.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {pkg.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                ⏱️ {pkg.duration}
                              </p>
                            </div>
                            <span className="font-bold text-yellow-600 min-w-[140px] text-left whitespace-nowrap">
                              {pkg.id === "FLEET-PACKAGE"
                                ? `${formatCurrency(displayPrice)}/car`
                                : pkg.id === "PAINT-CORRECTION"
                                  ? formatCurrency(displayPrice)
                                  : formatCurrency(displayPrice)}
                            </span>
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Paint Correction Stage Selection */}
                  {carServicePackage === "PAINT-CORRECTION" && (
                    <div className="mt-6">
                      <p className="font-semibold text-gray-900 mb-3">
                        Select Paint Correction Stage:
                      </p>
                      <div className="grid gap-3">
                        {PAINT_CORRECTION_STAGES.map((stage) => {
                          const stagePrice = getCarDetailingPrice(
                            vehicleType,
                            "PAINT-CORRECTION",
                            stage.id,
                            midSUVTier,
                          );
                          return (
                            <Card
                              key={stage.id}
                              variant={
                                paintStage === stage.id ? "default" : "outlined"
                              }
                              hoverable
                              selected={paintStage === stage.id}
                              className="p-4 cursor-pointer"
                              onClick={() => setPaintStage(stage.id)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-semibold text-gray-900">
                                    {stage.name}
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    {stage.description}
                                  </p>
                                </div>
                                <span className="font-bold text-yellow-600">
                                  {formatCurrency(stagePrice)}
                                </span>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Fleet Package Car Count */}
                  {carServicePackage === "FLEET-PACKAGE" && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-3">
                        Number of Cars (Minimum 5):
                      </p>
                      <Input
                        type="number"
                        min={1}
                        value={fleetCarCount}
                        onChange={(e) =>
                          setFleetCarCount(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        helperText={`Total: ${formatCurrency(getCarDetailingPrice(vehicleType, "FLEET-PACKAGE", undefined, midSUVTier, fleetCarCount))}`}
                      />
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {/* Home Cleaning Image Carousel */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Our Home Cleaning Services
                </h3>
                {/* Removed home cleaning roulette */}
              </div>

              <p className="font-semibold text-gray-900 mb-3">
                Select Cleaning Category:
              </p>
              <div className="grid gap-3">
                {CLEANING_CATEGORIES.map((cat) => {
                  const media = CLEANING_MEDIA[cat.id as CleaningCategory]
                  return (
                    <Card
                      key={cat.id}
                      variant={
                        cleaningCategory === cat.id ? "default" : "outlined"
                      }
                      hoverable
                      selected={cleaningCategory === cat.id}
                      className="p-4 cursor-pointer"
                      onClick={() => {
                        setCleaningCategory(cat.id);
                        setHouseCleaningType("");
                        setFumigationType("");
                        setRoomSize("");
                        setBathroomItems({
                          general: false,
                          sink: false,
                          toilet: false,
                        });
                        setWindowCount({ small: 0, large: 0, wholeHouse: false });
                      }}
                    >
                      {media?.type === 'video' ? (
                        <div className="-mt-2 -mx-2 mb-4">
                          {!failedCleaning[cat.id as CleaningCategory] ? (
                            <video
                              className="w-full h-32 sm:h-40 object-cover rounded-xl"
                              src={getVideoSrc(media.src)}
                              muted
                              loop
                              playsInline
                              preload="none"
                              autoPlay
                              controls={false}
                              poster={CLEANING_FALLBACK_IMAGES[cat.id as CleaningCategory]}
                              onError={() =>
                                setFailedCleaning((p) => ({
                                  ...p,
                                  [cat.id as CleaningCategory]: true,
                                }))
                              }
                            />
                          ) : (
                            <img
                              src={CLEANING_FALLBACK_IMAGES[cat.id as CleaningCategory]}
                              alt={cat.name}
                              className="w-full h-32 sm:h-40 object-cover rounded-xl"
                              loading="lazy"
                            />
                          )}
                        </div>
                      ) : media?.type === 'image' ? (
                        <div className="-mt-2 -mx-2 mb-4">
                          <img
                            src={media.src}
                            alt={cat.name}
                            className="w-full h-32 sm:h-40 object-cover rounded-xl"
                            loading="lazy"
                          />
                        </div>
                      ) : null}
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {cat.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {cat.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>

              {/* HOUSE CLEANING OPTIONS */}
              {cleaningCategory === "HOUSE_CLEANING" && (
                <div className="mt-6">
                  <p className="font-semibold text-gray-900 mb-3">
                    Select Service:
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <Card
                      variant={
                        houseCleaningType === "BATHROOM"
                          ? "default"
                          : "outlined"
                      }
                      hoverable
                      selected={houseCleaningType === "BATHROOM"}
                      className="p-4 cursor-pointer text-center"
                      onClick={() => setHouseCleaningType("BATHROOM")}
                    >
                      <div className="text-2xl mb-2">🚿</div>
                      <h4 className="font-semibold">Bathroom</h4>
                    </Card>
                    <Card
                      variant={
                        houseCleaningType === "WINDOW" ? "default" : "outlined"
                      }
                      hoverable
                      selected={houseCleaningType === "WINDOW"}
                      className="p-4 cursor-pointer text-center"
                      onClick={() => setHouseCleaningType("WINDOW")}
                    >
                      <div className="text-2xl mb-2">🪟</div>
                      <h4 className="font-semibold">Window</h4>
                    </Card>
                    <Card
                      variant={
                        houseCleaningType === "ROOM" ? "default" : "outlined"
                      }
                      hoverable
                      selected={houseCleaningType === "ROOM"}
                      className="p-4 cursor-pointer text-center"
                      onClick={() => setHouseCleaningType("ROOM")}
                    >
                      <div className="text-2xl mb-2">🛏️</div>
                      <h4 className="font-semibold">Rooms</h4>
                    </Card>
                  </div>

                  {/* Bathroom Specifics */}
                  {houseCleaningType === "BATHROOM" && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                      <p className="font-semibold text-gray-900 mb-3">
                        Select Items to Clean:
                      </p>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 bg-white rounded border cursor-pointer hover:border-yellow-400">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={bathroomItems.general}
                              onChange={(e) =>
                                setBathroomItems({
                                  ...bathroomItems,
                                  general: e.target.checked,
                                })
                              }
                              className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                            />
                            <span>General Cleaning</span>
                          </div>
                          <span className="font-semibold text-yellow-600 w-28 text-left whitespace-nowrap">
                            {formatCurrency(BATHROOM_PRICING.GENERAL)}
                          </span>
                        </label>
                        <label className="flex items-center justify-between p-3 bg-white rounded border cursor-pointer hover:border-yellow-400">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={bathroomItems.sink}
                              onChange={(e) =>
                                setBathroomItems({
                                  ...bathroomItems,
                                  sink: e.target.checked,
                                })
                              }
                              className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                            />
                            <span>Sink</span>
                          </div>
                          <span className="font-semibold text-yellow-600 w-28 text-left whitespace-nowrap">
                            {formatCurrency(BATHROOM_PRICING.SINK)}
                          </span>
                        </label>
                        <label className="flex items-center justify-between p-3 bg-white rounded border cursor-pointer hover:border-yellow-400">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={bathroomItems.toilet}
                              onChange={(e) =>
                                setBathroomItems({
                                  ...bathroomItems,
                                  toilet: e.target.checked,
                                })
                              }
                              className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                            />
                            <span>Toilet Bowl</span>
                          </div>
                          <span className="font-semibold text-yellow-600 w-28 text-left whitespace-nowrap">
                            {formatCurrency(BATHROOM_PRICING.TOILET)}
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Window Specifics */}
                  {houseCleaningType === "WINDOW" && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                      <p className="font-semibold text-gray-900 mb-3">
                        Window Details:
                      </p>

                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-3 bg-white rounded border cursor-pointer hover:border-yellow-400">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={windowCount.wholeHouse}
                              onChange={(e) =>
                                setWindowCount({
                                  ...windowCount,
                                  wholeHouse: e.target.checked,
                                })
                              }
                              className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                            />
                            <span>Whole House Package</span>
                          </div>
                          <span className="font-semibold text-yellow-600 w-28 text-left whitespace-nowrap">
                            {formatCurrency(WINDOW_PRICING.WHOLE_HOUSE)}
                          </span>
                        </label>

                        {!windowCount.wholeHouse && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Small Windows
                              </label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min={0}
                                  value={windowCount.small}
                                  onChange={(e) =>
                                    setWindowCount({
                                      ...windowCount,
                                      small: parseInt(e.target.value) || 0,
                                    })
                                  }
                                />
                                <span className="text-xs text-gray-500">
                                  x {formatCurrency(WINDOW_PRICING.SMALL)}
                                </span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Large Windows
                              </label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min={0}
                                  value={windowCount.large}
                                  onChange={(e) =>
                                    setWindowCount({
                                      ...windowCount,
                                      large: parseInt(e.target.value) || 0,
                                    })
                                  }
                                />
                                <span className="text-xs text-gray-500">
                                  x {formatCurrency(WINDOW_PRICING.LARGE)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Room Specifics */}
                  {houseCleaningType === "ROOM" && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                      <p className="font-semibold text-gray-900 mb-3">
                        Select Room Size:
                      </p>
                      <div className="grid gap-3">
                        {ROOM_SIZES.map((size) => (
                          <Card
                            key={size.id}
                            variant={
                              roomSize === size.id ? "default" : "outlined"
                            }
                            hoverable
                            selected={roomSize === size.id}
                            className="p-3 cursor-pointer"
                            onClick={() => setRoomSize(size.id)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900">
                                {size.name}
                              </span>
                              <span className="font-semibold text-yellow-600 w-28 text-left whitespace-nowrap">
                                {formatCurrency(ROOM_PRICING[size.id])}
                              </span>
                            </div>
                          </Card>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        Additional rooms:{" "}
                        {formatCurrency(ROOM_PRICING.ADDITIONAL)} per room
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* FUMIGATION OPTIONS */}
              {cleaningCategory === "FUMIGATION" && (
                <div className="mt-6">
                  <p className="font-semibold text-gray-900 mb-3">
                    Select Fumigation Type:
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <Card
                      variant={
                        fumigationType === "GENERAL" ? "default" : "outlined"
                      }
                      hoverable
                      selected={fumigationType === "GENERAL"}
                      className="p-4 cursor-pointer text-center"
                      onClick={() => setFumigationType("GENERAL")}
                    >
                      <div className="text-2xl mb-2">🌫️</div>
                      <h4 className="font-semibold">General Fumigation</h4>
                    </Card>
                    <Card
                      variant={
                        fumigationType === "BED_BUG" ? "default" : "outlined"
                      }
                      hoverable
                      selected={fumigationType === "BED_BUG"}
                      className="p-4 cursor-pointer text-center"
                      onClick={() => setFumigationType("BED_BUG")}
                    >
                      <div className="text-2xl mb-2">🪲</div>
                      <h4 className="font-semibold">Bed Bug Removal</h4>
                    </Card>
                  </div>

                  {fumigationType && (
                    <>
                      <p className="font-semibold text-gray-900 mb-3">
                        Select Property Size:
                      </p>
                      <div className="grid gap-2">
                        {ROOM_SIZES.map((size) => {
                          const price =
                            FUMIGATION_PRICING[fumigationType][size.id];
                          return (
                            <Card
                              key={size.id}
                              variant={
                                roomSize === size.id ? "default" : "outlined"
                              }
                              hoverable
                              selected={roomSize === size.id}
                              className="p-3 cursor-pointer flex justify-between items-center"
                              onClick={() => setRoomSize(size.id)}
                            >
                              <span>{size.name}</span>
                              <span className="font-semibold text-yellow-600">
                                {formatCurrency(price)}
                              </span>
                            </Card>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Additional rooms: +
                        {formatCurrency(
                          FUMIGATION_PRICING[fumigationType].ADDITIONAL,
                        )}
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* MOVE IN/OUT & POST CONSTRUCTION */}
              {(cleaningCategory === "MOVE_IN_OUT" ||
                cleaningCategory === "POST_CONSTRUCTION") && (
                <div className="mt-6">
                  <p className="font-semibold text-gray-900 mb-3">
                    Select Property Size:
                  </p>
                  <div className="grid gap-2">
                    {ROOM_SIZES.map((size) => {
                      const pricing =
                        cleaningCategory === "MOVE_IN_OUT"
                          ? MOVE_IN_OUT_PRICING
                          : POST_CONSTRUCTION_PRICING;
                      const price = pricing[size.id];
                      return (
                        <Card
                          key={size.id}
                          variant={
                            roomSize === size.id ? "default" : "outlined"
                          }
                          hoverable
                          selected={roomSize === size.id}
                          className="p-3 cursor-pointer flex justify-between items-center"
                          onClick={() => setRoomSize(size.id)}
                        >
                          <span>{size.name}</span>
                          <span className="font-semibold text-yellow-600">
                            {formatCurrency(price)}
                          </span>
                        </Card>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Additional rooms: +
                    {formatCurrency(
                      cleaningCategory === "MOVE_IN_OUT"
                        ? MOVE_IN_OUT_PRICING.ADDITIONAL
                        : POST_CONSTRUCTION_PRICING.ADDITIONAL,
                    )}
                  </p>
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep(2)} fullWidth>
              Back
            </Button>
            <Button
              onClick={() => {
                if (serviceCategory === "car-detailing") {
                  setStep(3.5);
                } else {
                  setStep(4);
                }
              }}
              fullWidth
              disabled={!price}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3.5: Detailed Car Services (Car Detailing Only) */}
      {step === 3.5 && serviceCategory === "car-detailing" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Select Additional Services
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose specific detailing services you need
            </p>
          </div>

          {/* Additional Services (Extras) */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Optional Extras
            </h4>
            <div className="space-y-3">
              {CAR_DETAILING_EXTRAS.map((extra) => {
                const isSelected = selectedCarExtras.includes(extra.id);
                return (
                  <label
                    key={extra.id}
                    className="flex items-center justify-between p-3 bg-white rounded border cursor-pointer hover:border-yellow-400"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCarExtras([
                              ...selectedCarExtras,
                              extra.id,
                            ]);
                          } else {
                            setSelectedCarExtras(
                              selectedCarExtras.filter((id) => id !== extra.id),
                            );
                          }
                        }}
                        className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                      />
                      <span>{extra.name}</span>
                    </div>
                    <span className="font-semibold text-yellow-600 w-28 text-left whitespace-nowrap">
                      {formatCurrency(extra.price)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {selectedCarExtras.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Selected Extras ({selectedCarExtras.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedCarExtras.map((extraId) => {
                  const extra = CAR_DETAILING_EXTRAS.find(
                    (e) => e.id === extraId,
                  );
                  return extra ? (
                    <span
                      key={extraId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-yellow-300 rounded text-xs"
                    >
                      {extra.icon} {extra.name}
                    </span>
                  ) : null;
                })}
              </div>
              <p className="mt-3 text-sm text-gray-700">
                Extras total:{" "}
                <span className="font-semibold text-yellow-700">
                  {formatCurrency(addonsTotal)}
                </span>
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep(3)} fullWidth>
              Back
            </Button>
            <Button onClick={() => setStep(4)} fullWidth>
              Continue{" "}
              {selectedCarExtras.length > 0 &&
                `(${selectedCarExtras.length} extras)`}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Location & Scheduling */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-gray-900 mb-3">Location:</p>
            <Button
              variant="outline"
              fullWidth
              onClick={handleGetLocation}
              loading={isLoadingLocation}
              className="mb-3"
            >
              📍 Use Current Location
            </Button>
            <p className="text-xs text-gray-600 mb-2">
              Permission: {locationPermission}
            </p>
            <Input
              placeholder="Or enter address manually"
              value={location.manualAddress || ""}
              onChange={(e) =>
                setLocation({ ...location, manualAddress: e.target.value })
              }
            />
            {location.address && (
              <p className="text-sm text-gray-600 mt-2">
                📍 {location.address}
              </p>
            )}
          </div>

          <div>
            <p className="font-semibold text-gray-900 mb-3">
              When do you need this service?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Card
                variant={bookingType === "immediate" ? "default" : "outlined"}
                hoverable
                selected={bookingType === "immediate"}
                className="p-4 cursor-pointer text-center"
                onClick={() => setBookingType("immediate")}
              >
                <div className="text-2xl mb-2">⚡</div>
                <p className="font-semibold text-sm">Now</p>
              </Card>
              <Card
                variant={bookingType === "scheduled" ? "default" : "outlined"}
                hoverable
                selected={bookingType === "scheduled"}
                className="p-4 cursor-pointer text-center"
                onClick={() => setBookingType("scheduled")}
              >
                <div className="text-2xl mb-2">📅</div>
                <p className="font-semibold text-sm">Schedule</p>
              </Card>
            </div>
          </div>

          {bookingType === "scheduled" && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                label="Date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
              <Input
                type="time"
                label="Time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          )}

          <div>
            <p className="font-semibold text-gray-900 mb-3">Payment Method:</p>
            <Card
              variant="default"
              className="p-4 text-center bg-green-50 border-green-200"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">📱</span>
                <p className="font-bold text-lg text-green-800">M-PESA</p>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Secure mobile payment
              </p>
            </Card>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep(3)} fullWidth>
              Back
            </Button>
            <Button onClick={() => setStep(5)} fullWidth>
              Review
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Summary */}
      {step === 5 && (
        <div className="space-y-4">
          <Card className="p-6 bg-gray-50">
            <h3 className="font-bold text-lg mb-4">Booking Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-semibold">
                  {serviceCategory === "car-detailing"
                    ? "Car Detailing"
                    : "Home Cleaning"}
                </span>
              </div>

              {serviceCategory === "car-detailing" ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold">
                      {
                        VEHICLE_CATEGORIES.find((v) => v.id === vehicleType)
                          ?.name
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Package:</span>
                    <span className="font-semibold">
                      {
                        CAR_SERVICE_PACKAGES.find(
                          (s) => s.id === carServicePackage,
                        )?.name
                      }
                    </span>
                  </div>
                  {selectedCarServices.length > 0 && (
                    <div>
                      <span className="text-gray-600">Add-ons:</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedCarServices.map((id) => {
                          const addon = CAR_DETAILING_EXTRAS.find(
                            (s) => s.id === id,
                          );
                          return addon ? (
                            <span
                              key={id}
                              className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700"
                            >
                              {addon.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-semibold">
                      {
                        CLEANING_CATEGORIES.find(
                          (c) => c.id === cleaningCategory,
                        )?.name
                      }
                    </span>
                  </div>
                  {cleaningCategory === "HOUSE_CLEANING" && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service:</span>
                      <span className="font-semibold">
                        {houseCleaningType === "BATHROOM"
                          ? "Bathroom Cleaning"
                          : "Window Cleaning"}
                      </span>
                    </div>
                  )}
                  {cleaningCategory === "FUMIGATION" && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-semibold">
                        {fumigationType === "GENERAL"
                          ? "General Fumigation"
                          : "Bed Bug Removal"}
                      </span>
                    </div>
                  )}
                  {roomSize && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-semibold">
                        {ROOM_SIZES.find((r) => r.id === roomSize)?.name}
                      </span>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">When:</span>
                <span className="font-semibold">
                  {bookingType === "immediate"
                    ? "Now"
                    : `${scheduledDate} at ${scheduledTime}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment:</span>
                <span className="font-semibold uppercase">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price:</span>
                <span className="font-semibold">{formatCurrency(price)}</span>
              </div>
              {addonsTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Add-ons Total:</span>
                  <span className="font-semibold">
                    {formatCurrency(addonsTotal)}
                  </span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-lg">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-yellow-600">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(4)} fullWidth>
              Back
            </Button>
            <Button
              fullWidth
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="mt-4"
            >
              {isSubmitting ? "Submitting..." : "Confirm Booking"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
