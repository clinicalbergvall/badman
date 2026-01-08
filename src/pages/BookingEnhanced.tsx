import { useState, useEffect, useMemo, useRef } from "react";
import {
  Button,
  Input,
  Card,
  ProgressBar,
} from "@/components/ui";
import CleanerProfile from "./CleanerProfile";
import LocationMap from "@/components/LocationMap";
import { PaymentModal } from "@/components/PaymentModal";
import {
  VEHICLE_CATEGORIES,
  CAR_SERVICE_PACKAGES,
  PAINT_CORRECTION_STAGES,
  CAR_DETAILING_EXTRAS,
  getCarDetailingPrice,
  loginSchema,
} from "@/lib/validation";
import type {
  VehicleType,
  CarServicePackage,
  PaintCorrectionStage,
  CarDetailingExtra,
  MidSUVPricingTier,
  BookingType,
  PaymentMethod,
} from "@/lib/types";
import { formatCurrency, formatPhoneNumber } from "@/lib/utils";
import {
  saveUserSession,
  loadUserSession,
} from "@/lib/storage";
import { getCurrentLocation, getLocationPermissionStatus, reverseGeocode } from "@/lib/location";
import { authAPI, api } from "@/lib/api";
import toast from "react-hot-toast";
import { logger } from "@/lib/logger";


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



type UserType = "client" | "cleaner" | "admin" | null;

type StageId =
  | "account"
  | "vehicle"
  | "package"
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

    if (/-mobile-720p\.mp4$/.test(src)) return src
    if (!useMobileSrc) return src
    const base = src.slice(0, -4)
    return `${base}-mobile-720p.mp4`
  }
  const [userType, setUserType] = useState<UserType>(null);
  const [step, setStep] = useState(1);
  const serviceCategory = "car-detailing";


  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);


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
  const [failedPackage, setFailedPackage] = useState<Record<string, boolean>>({});




  const [bookingType, setBookingType] = useState<BookingType>("immediate");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");
  const [location, setLocation] = useState<{
    address?: string;
    manualAddress?: string;
    coordinates?: [number, number];
  }>({});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState<string>("unknown");


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
          el.play().catch(() => { })
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
      { id: "vehicle", label: "Vehicle" },
      { id: "package", label: "Package" },
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
    if (step === 2) return "vehicle";
    if (step === 3) return "package";
    if (step === 4) return "extras";
    if (step === 5) return "schedule";
    return "review";
  }, [step]);

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


  const price =
    vehicleType && carServicePackage
      ? getCarDetailingPrice(
        vehicleType,
        carServicePackage,
        paintStage || undefined,
        midSUVTier,
        fleetCarCount,
      )
      : 0;


  const carAddonsTotal = selectedCarExtras.reduce((total, extraId) => {
    const extra = CAR_DETAILING_EXTRAS.find((e) => e.id === extraId);
    return total + (extra?.price ?? 0);
  }, 0);

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
    "INTERIOR-STEAMING": "/assets/detailing/wash-2.png",
    "PAINT-CORRECTION": "/assets/detailing/wash-1.png",
    "FULL-DETAIL": "/assets/detailing/IMG_0120.png",
    "FLEET-PACKAGE": "/assets/images/premium-foam-wash.jpg",
  } as const




  if (!userType) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">

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
                  Find Professional Car Detailers
                </h3>
                <p className="text-sm text-gray-600">
                  Connect with expert detailers to elevate and maintain your vehicle
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


  const handleGetLocation = async () => {
    setIsLoadingLocation(true);
    const loc = await getCurrentLocation();
    setIsLoadingLocation(false);
    if (loc) {
      setLocation(loc);
    } else {
      toast.error("Could not fetch location. Please enter manually.");
    }
  };

  const handleLocationChange = async (lat: number, lng: number) => {
    // Update coordinates immediately for responsiveness
    setLocation((prev) => ({
      ...prev,
      coordinates: [lat, lng],
    }));

    try {
      // Reverse geocode to get the new address
      const address = await reverseGeocode(lat, lng);
      setLocation((prev) => ({
        ...prev,
        coordinates: [lat, lng],
        address: address,
        manualAddress: address
      }));
    } catch (error) {
      console.error("Failed to reverse geocode:", error);
    }
  };

  const handleBookingSubmit = async () => {
    try {
      setIsSubmitting(true);

      const bookingPayload = {
        contact: {
          name: name.trim() || "CleanCloak Client",
          phone,
        },
        serviceCategory,

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


      rememberSession({
        userType: "client",
        name: name.trim() || bookingRecord.contact?.name,
        phone,
      });


      toast.success(
        "🎉 Booking created! A cleaner will accept your request soon.",
      );


      setTimeout(() => {
        setStep(2);
        setName("");
        setPhone("");

        setVehicleType("");
        setCarServicePackage("");
        setPaintStage("");
        setMidSUVTier("STANDARD");
        setFleetCarCount(5);
        setSelectedCarExtras([]);
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
      { }
      {step === 1 && (
        <button
          onClick={() => setUserType(null)}
          className="text-gray-600 hover:text-gray-900 mb-1 flex items-center gap-2"
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

      { }
      <div className="mb-0">
        {step > 1 && (
          <button
            onClick={() => {
              if (step === 2) {
                setUserType(null);
              } else {
                setStep(step - 1);
              }
            }}
            className="text-gray-600 hover:text-gray-900 mb-0 flex items-center gap-2"
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
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-0">CleanCloak</h1>
          <p className="text-gray-600 mb-0">
            {step === 1 &&
              (isSignup
                ? "Create your account to find professional car detailers"
                : "Sign in to find professional car detailers")}
            {step === 2 && "Select vehicle type"}
            {step === 3 && "Select service package"}
            {step === 4 && "Select add-ons"}
            {step === 5 && "Location & scheduling"}
            {step === 6 && "Review your booking"}
          </p>
        </div>
      </div>

      { }
      <div className="space-y-2 mb-3">
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

      { }
      {
        step === 1 && (
          <div className="space-y-4">
            {isSignup && (
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Griffins Mhogo"
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

                if (!password || password.length < 6) {
                  toast.error("Password must be at least 6 characters");
                  return;
                }



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

                    const p = (phone || '').replace(/\s+/g, '')
                    const m = p.match(/^\+?254([17]\d{8})$/)
                    const normalized = m ? `0${m[1]}` : p
                    response = await authAPI.login(normalized, password);
                  }

                  if (response.success && response.user) {


                    toast.success(
                      isSignup
                        ? "Account created successfully! 🎉"
                        : "Signed in successfully!",
                    );
                    setStep(2);


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
        )
      }



      {/* Step 2: Vehicle Selection */}
      {step === 2 && (
        <div className="space-y-4">
          <Card className="p-6 mb-6">
            <div className="-mt-2 -mx-2 mb-4">
              <video
                className="w-full h-48 object-cover rounded-xl"
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
                onClick={() => {
                  setVehicleType(cat.id);
                  setStep(3); // Auto-progress to package selection
                }}
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

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep(1)} fullWidth>
              Back
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Package Selection */}
      {step === 3 && vehicleType && (
        <div className="space-y-4">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600">Selected Vehicle:</p>
            <div className="flex items-center gap-2 mt-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xl">
                {VEHICLE_CATEGORIES.find(c => c.id === vehicleType)?.icon}
              </span>
              <span className="font-bold text-gray-900">
                {VEHICLE_CATEGORIES.find(c => c.id === vehicleType)?.name}
              </span>
              <button
                onClick={() => setStep(2)}
                className="ml-auto text-xs text-yellow-600 font-bold hover:underline"
              >
                Change
              </button>
            </div>
          </div>

          <p className="font-semibold text-gray-900 mb-3">
            Select Detailing Package:
          </p>
          <div className="grid gap-3">
            {CAR_SERVICE_PACKAGES.map((pkg) => {
              // Calculate price for display
              let displayPrice = 0;
              if (pkg.id === "PAINT-CORRECTION") {
                // Show Stage 1 price as base
                displayPrice = getCarDetailingPrice(
                  vehicleType as VehicleType,
                  pkg.id,
                  "STAGE-1",
                  midSUVTier,
                );
              } else if (pkg.id === "FLEET-PACKAGE") {
                // Show per-car price
                displayPrice = getCarDetailingPrice(
                  vehicleType as VehicleType,
                  pkg.id,
                  undefined,
                  midSUVTier,
                  1,
                );
              } else {
                displayPrice = getCarDetailingPrice(
                  vehicleType as VehicleType,
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

                    // Auto-progress if not a special package
                    if (pkg.id !== "PAINT-CORRECTION" && pkg.id !== "FLEET-PACKAGE") {
                      setStep(4);
                    }
                  }}
                >
                  <div className="-mt-2 -mx-2 mb-4">
                    {pkg.id !== "FLEET-PACKAGE" && ( // Don't show media for fleet package
                      PACKAGE_VIDEOS[pkg.id] && !failedPackage[pkg.id] ? (
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
                      ) : null
                    )}
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
                        : formatCurrency(displayPrice)}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          { }
          {carServicePackage === "PAINT-CORRECTION" && (
            <div className="mt-6">
              <p className="font-semibold text-gray-900 mb-3">
                Select Paint Correction Stage:
              </p>
              <div className="grid gap-3">
                {PAINT_CORRECTION_STAGES.map((stage) => {
                  const stagePrice = getCarDetailingPrice(
                    vehicleType as VehicleType,
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

          { }
          {carServicePackage === "FLEET-PACKAGE" && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-semibold text-gray-900 mb-3">
                Number of Cars:
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFleetCarCount(prev => Math.max(2, prev - 1))}
                  className="w-12 h-12 rounded-full bg-white border border-gray-300 flex items-center justify-center text-xl font-bold hover:bg-gray-50 active:scale-95 transition-all"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {fleetCarCount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFleetCarCount(prev => Math.min(100, prev + 1))}
                  className="w-12 h-12 rounded-full bg-white border border-gray-300 flex items-center justify-center text-xl font-bold hover:bg-gray-50 active:scale-95 transition-all"
                >
                  +
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Total: {formatCurrency(getCarDetailingPrice(vehicleType as VehicleType, "FLEET-PACKAGE", undefined, midSUVTier, fleetCarCount))}
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep(2)} fullWidth>
              Back
            </Button>
            <Button
              onClick={() => setStep(4)}
              fullWidth
              disabled={!carServicePackage}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      { }
      {
        step === 4 && (
          <div className="space-y-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600">Selected Package:</p>
              <div className="flex items-center gap-3 mt-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-xl">✨</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">
                    {CAR_SERVICE_PACKAGES.find(p => p.id === carServicePackage)?.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {VEHICLE_CATEGORIES.find(v => v.id === vehicleType)?.name}
                  </p>
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="ml-auto text-xs text-yellow-600 font-bold hover:underline"
                >
                  Change
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Select Additional Services
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose specific detailing services you need
              </p>
            </div>

            { }
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
              <Button onClick={() => setStep(5)} fullWidth>
                Continue{" "}
                {selectedCarExtras.length > 0 &&
                  `(${selectedCarExtras.length} extras)`}
              </Button>
            </div>
          </div>
        )
      }

      { }
      {
        step === 5 && (
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

              <LocationMap
                location={location}
                height="200px"
                draggable={true}
                onLocationChange={handleLocationChange}
              />

              {(location.address || location.manualAddress || location.coordinates) && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Confirmed Location
                    </p>
                    <button
                      onClick={() => setLocation({})}
                      className="text-xs text-red-500 font-bold hover:underline"
                    >
                      Clear
                    </button>
                  </div>

                  {location.address && (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">📍</span>
                      <p className="text-sm text-blue-900 font-medium">
                        {location.address}
                      </p>
                    </div>
                  )}
                </div>
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
              <Button variant="outline" onClick={() => setStep(4)} fullWidth>
                Back
              </Button>
              <Button onClick={() => setStep(6)} fullWidth>
                Review
              </Button>
            </div>
          </div>
        )
      }

      { }
      {
        step === 6 && (
          <div className="space-y-4">
            <Card className="p-6 bg-gray-50">
              <h3 className="font-bold text-lg mb-4">Booking Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-semibold">Car Detailing</span>
                </div>

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
                {selectedCarExtras.length > 0 && (
                  <div>
                    <span className="text-gray-600">Add-ons:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedCarExtras.map((id) => {
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
              <Button variant="outline" onClick={() => setStep(5)} fullWidth>
                Back
              </Button>
              <Button
                fullWidth
                onClick={handleBookingSubmit}
                disabled={isSubmitting}
                className="mt-4"
              >
                {isSubmitting ? "Submitting..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )
      }
    </div >
  );
}
