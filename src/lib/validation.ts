import { z } from "zod";
import type {
  VehicleType,
  CarServicePackage,
  PaintCorrectionStage,
  CarDetailingExtra,
  MidSUVPricingTier,
  PropertySize,
  CleaningServiceOption,
  HomeCleaningAddon,
  VehicleCategory,
  CarServicePackageOption,
  PaintCorrectionStageOption,
  CarDetailingExtraOption,
  PropertyCategory,
  CleaningServicePackage,
  HomeCleaningAddonOption,
  CleaningCategory,
  HouseCleaningType,
  FumigationType,
  RoomSize,
} from "./types";

// ============================================
// CAR DETAILING - NEW STRUCTURE
// ============================================

export const VEHICLE_CATEGORIES: VehicleCategory[] = [
  {
    id: "SEDAN",
    name: "Sedan",
    description: "Standard sedan vehicles",
    icon: "🚗",
  },
  {
    id: "MID-SUV",
    name: "Mid-SUV",
    description: "Medium-sized SUVs",
    icon: "🚙",
  },
  {
    id: "SUV-DOUBLE-CAB",
    name: "SUV / Double Cab",
    description: "Large SUVs and double cab pickups",
    icon: "🚐",
  },
];

export const CAR_SERVICE_PACKAGES: CarServicePackageOption[] = [
  {
    id: "NORMAL-DETAIL",
    name: "Normal Detail",
    description: "Restore show-room look of the car",
    duration: "2-3 hours",
  },
  {
    id: "INTERIOR-STEAMING",
    name: "Interior Steaming",
    description:
      "Sanitation, deep cleaning and removal of stains & odours from the car",
    duration: "2-3 hours",
  },
  {
    id: "PAINT-CORRECTION",
    name: "Paint Correction",
    description: "Restoring your car's shine",
    duration: "3-5 hours",
    requiresStage: true,
  },
  {
    id: "FULL-DETAIL",
    name: "Full Detail",
    description:
      "Complete detailing package - interior, exterior, and protection",
    duration: "4-6 hours",
  },
  {
    id: "FLEET-PACKAGE",
    name: "Fleet Package",
    description: "Deep cleaning for 5 or more cars at a go",
    duration: "Varies by fleet size",
    requiresCarCount: true,
  },
];

export const PAINT_CORRECTION_STAGES: PaintCorrectionStageOption[] = [
  {
    id: "STAGE-1",
    name: "Stage 1",
    description: "Light paint correction - removes minor swirls and scratches",
  },
  {
    id: "STAGE-2",
    name: "Stage 2",
    description: "Medium paint correction - removes moderate imperfections",
  },
  {
    id: "STAGE-3",
    name: "Stage 3",
    description:
      "Heavy paint correction - removes deep scratches and oxidation",
  },
];

export const CAR_DETAILING_EXTRAS: CarDetailingExtraOption[] = [
  {
    id: "plastic-restoration",
    name: "Plastic Restoration",
    description: "Restore faded plastic trim and bumpers",
    price: 2000,
    icon: "🔧",
  },
  {
    id: "rust-removal",
    name: "Rust Removal",
    description: "Remove rust spots and prevent further corrosion",
    price: 2000,
    icon: "🛠️",
  },
  {
    id: "de-greasing",
    name: "De-Greasing",
    description: "Deep engine bay and undercarriage degreasing",
    price: 2000,
    icon: "💧",
  },
  {
    id: "brown-stain-removal",
    name: "Brown Stain Removal",
    description: "Remove stubborn brown stains from seats and carpets",
    price: 2000,
    icon: "",
  },
  {
    id: "window-polishing",
    name: "Window Polishing",
    description: "Professional window cleaning and polishing",
    price: 5000,
    icon: "🪟",
  },
];

// New Detailed Services
export const INTERIOR_SERVICES = [
  {
    id: "vacuuming",
    name: "Deep Vacuuming",
    description: "Thorough vacuuming of seats, carpets, and mats",
    price: 500,
    icon: "🧹",
  },
  {
    id: "upholstery-shampoo",
    name: "Upholstery Shampoo",
    description: "Deep cleaning of fabric seats and carpets",
    price: 1500,
    icon: "🧼",
  },
  {
    id: "leather-conditioning",
    name: "Leather Conditioning",
    description: "Clean and condition leather seats",
    price: 1200,
    icon: "🛋️",
  },
  {
    id: "dashboard-polish",
    name: "Dashboard Polish",
    description: "Clean and protect dashboard and vinyl surfaces",
    price: 800,
    icon: "",
  },
];

export const EXTERIOR_SERVICES = [
  {
    id: "hand-wash",
    name: "Premium Hand Wash",
    description: "Gentle hand wash with pH neutral soap",
    price: 800,
    icon: "🚿",
  },
  {
    id: "clay-bar",
    name: "Clay Bar Treatment",
    description: "Remove embedded contaminants from paint",
    price: 2500,
    icon: "🧱",
  },
  {
    id: "waxing",
    name: "Premium Wax",
    description: "Apply high-quality wax for shine and protection",
    price: 1500,
    icon: "",
  },
  {
    id: "tire-shine",
    name: "Tire & Rim Shine",
    description: "Clean rims and dress tires",
    price: 500,
    icon: "🛞",
  },
];

// ============================================
// CAR DETAILING PRICING MATRIX
// ============================================

interface CarPricingStructure {
  [key: string]: {
    SEDAN: number;
    "MID-SUV": number | { STANDARD: number; PREMIUM: number };
    "SUV-DOUBLE-CAB": number | { STANDARD: number; PREMIUM: number };
  };
}

export const CAR_DETAILING_PRICING: CarPricingStructure = {
  "NORMAL-DETAIL": {
    SEDAN: 7000,
    "MID-SUV": { STANDARD: 7500, PREMIUM: 8000 },
    "SUV-DOUBLE-CAB": { STANDARD: 8000, PREMIUM: 8500 },
  },
  "INTERIOR-STEAMING": {
    SEDAN: 4400, // Using SUV price for sedan as well
    "MID-SUV": 5300,
    "SUV-DOUBLE-CAB": 6200,
  },
  "PAINT-CORRECTION-STAGE-1": {
    SEDAN: 5000,
    "MID-SUV": 6000,
    "SUV-DOUBLE-CAB": 7000,
  },
  "PAINT-CORRECTION-STAGE-2": {
    SEDAN: 6000,
    "MID-SUV": 7000,
    "SUV-DOUBLE-CAB": 8000,
  },
  "PAINT-CORRECTION-STAGE-3": {
    SEDAN: 7000,
    "MID-SUV": 8000,
    "SUV-DOUBLE-CAB": 9000,
  },
  "FULL-DETAIL": {
    SEDAN: 13000,
    "MID-SUV": 14000,
    "SUV-DOUBLE-CAB": 15000,
  },
  "FLEET-PACKAGE": {
    SEDAN: 3500, // Per car
    "MID-SUV": 3800, // Per car
    "SUV-DOUBLE-CAB": 4000, // Per car
  },
};

// Helper function to get car detailing price
export function getCarDetailingPrice(
  vehicleType: VehicleType,
  servicePackage: CarServicePackage,
  paintStage?: PaintCorrectionStage,
  midSUVTier?: MidSUVPricingTier,
  fleetCarCount?: number,
): number {
  let priceKey = servicePackage;

  // For paint correction, append the stage
  if (servicePackage === "PAINT-CORRECTION" && paintStage) {
    priceKey = `PAINT-CORRECTION-${paintStage}` as any;
  }

  const pricing = CAR_DETAILING_PRICING[priceKey];
  if (!pricing) return 0;

  let basePrice = pricing[vehicleType];

  // Handle Mid-SUV pricing tiers
  if (typeof basePrice === "object" && "STANDARD" in basePrice) {
    basePrice = basePrice[midSUVTier || "STANDARD"];
  }

  // For fleet package, multiply by car count
  if (servicePackage === "FLEET-PACKAGE" && fleetCarCount) {
    return (basePrice as number) * fleetCarCount;
  }

  return basePrice as number;
}

// Helper function to get vehicle category
export function getVehicleCategory(
  id: VehicleType,
): VehicleCategory | undefined {
  return VEHICLE_CATEGORIES.find((cat) => cat.id === id);
}

// Helper function to get car service package
export function getCarServicePackage(
  id: CarServicePackage,
): CarServicePackageOption | undefined {
  return CAR_SERVICE_PACKAGES.find((pkg) => pkg.id === id);
}

// Helper function to get paint correction stage
export function getPaintCorrectionStage(
  id: PaintCorrectionStage,
): PaintCorrectionStageOption | undefined {
  return PAINT_CORRECTION_STAGES.find((stage) => stage.id === id);
}

// Helper function to get car detailing extra
export function getCarDetailingExtra(
  id: CarDetailingExtra,
): CarDetailingExtraOption | undefined {
  return CAR_DETAILING_EXTRAS.find((extra) => extra.id === id);
}

// ============================================
// HOME CLEANING - NEW STRUCTURE
// ============================================

export const CLEANING_CATEGORIES: {
  id: CleaningCategory;
  name: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "HOUSE_CLEANING",
    name: "House Cleaning",
    description: "Bathroom and window cleaning services",
    icon: "🏠",
  },
  {
    id: "FUMIGATION",
    name: "Fumigation",
    description: "Pest control and bed bug removal",
    icon: "🦟",
  },
  {
    id: "MOVE_IN_OUT",
    name: "Move In/Out Cleaning",
    description: "Deep cleaning for moving days",
    icon: "📦",
  },
  {
    id: "POST_CONSTRUCTION",
    name: "Post Construction",
    description: "Heavy duty cleaning after renovation",
    icon: "🏗️",
  },
];

export const ROOM_SIZES: { id: RoomSize; name: string }[] = [
  { id: "STUDIO", name: "Studio" },
  { id: "1BED", name: "1 Bedroom" },
  { id: "2BED", name: "2 Bedrooms" },
  { id: "3BED", name: "3 Bedrooms" },
  { id: "4BED", name: "4 Bedrooms" },
  { id: "5BED", name: "5 Bedrooms" },
];

// Pricing Constants
export const BATHROOM_PRICING = {
  GENERAL: 3500,
  SINK: 800,
  TOILET: 2000,
};

export const WINDOW_PRICING = {
  SMALL: 500,
  LARGE: 800,
  WHOLE_HOUSE: 10000,
};

export const ROOM_PRICING = {
  STUDIO: 5000,
  "1BED": 6500,
  "2BED": 9000,
  "3BED": 12000,
  "4BED": 15000,
  "5BED": 18000,
  ADDITIONAL: 3000,
};

export const FUMIGATION_PRICING = {
  GENERAL: {
    STUDIO: 3500,
    "1BED": 4500,
    "2BED": 5500,
    "3BED": 7000,
    "4BED": 8500,
    "5BED": 10000,
    ADDITIONAL: 1500,
  },
  BED_BUG: {
    STUDIO: 4000,
    "1BED": 5000,
    "2BED": 6000,
    "3BED": 7000,
    "4BED": 8000,
    "5BED": 9000,
    ADDITIONAL: 1000,
  },
};

export const MOVE_IN_OUT_PRICING = {
  STUDIO: 5000,
  "1BED": 8000,
  "2BED": 11000,
  "3BED": 14000,
  "4BED": 17000,
  "5BED": 20000,
  ADDITIONAL: 3000,
};

export const POST_CONSTRUCTION_PRICING = {
  STUDIO: 10000,
  "1BED": 20000,
  "2BED": 30000,
  "3BED": 40000,
  "4BED": 50000,
  "5BED": 60000,
  ADDITIONAL: 10000,
};

// Helper to get pricing
export function getHomeCleaningPrice(
  category: CleaningCategory,
  details: {
    houseCleaningType?: HouseCleaningType;
    bathroomItems?: { general: boolean; sink: boolean; toilet: boolean };
    windowCount?: { small: number; large: number; wholeHouse: boolean };
    fumigationType?: FumigationType;
    roomSize?: RoomSize;
  },
): number {
  let total = 0;

  if (category === "HOUSE_CLEANING") {
    if (details.houseCleaningType === "BATHROOM" && details.bathroomItems) {
      if (details.bathroomItems.general) total += BATHROOM_PRICING.GENERAL;
      if (details.bathroomItems.sink) total += BATHROOM_PRICING.SINK;
      if (details.bathroomItems.toilet) total += BATHROOM_PRICING.TOILET;
    } else if (details.houseCleaningType === "WINDOW" && details.windowCount) {
      if (details.windowCount.wholeHouse) {
        total += WINDOW_PRICING.WHOLE_HOUSE;
      } else {
        total += details.windowCount.small * WINDOW_PRICING.SMALL;
        total += details.windowCount.large * WINDOW_PRICING.LARGE;
      }
    } else if (details.houseCleaningType === "ROOM" && details.roomSize) {
      total = ROOM_PRICING[details.roomSize] || 0;
    }
  } else if (
    category === "FUMIGATION" &&
    details.fumigationType &&
    details.roomSize
  ) {
    const pricing =
      details.fumigationType === "GENERAL"
        ? FUMIGATION_PRICING.GENERAL
        : FUMIGATION_PRICING.BED_BUG;
    total = pricing[details.roomSize] || 0;
  } else if (category === "MOVE_IN_OUT" && details.roomSize) {
    total = MOVE_IN_OUT_PRICING[details.roomSize] || 0;
  } else if (category === "POST_CONSTRUCTION" && details.roomSize) {
    total = POST_CONSTRUCTION_PRICING[details.roomSize] || 0;
  }

  return total;
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const phoneSchema = z
  .string()
  .regex(
    /^(07|01)\d{8}$/,
    "Phone must be Kenyan format (07XXXXXXXX or 01XXXXXXXX)",
  );

export const mpesaSchema = z
  .string()
  .regex(
    /^[A-Z0-9]{10}$/,
    "M-PESA code must be exactly 10 alphanumeric characters",
  )
  .length(10, "M-PESA code must be exactly 10 characters");

export const emailSchema = z.string().email("Invalid email address");

export const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
  manualAddress: z.string().optional(),
});

export const loginSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: phoneSchema,
  email: emailSchema.optional(),
});

// ============================================
// BACKWARD COMPATIBILITY EXPORTS
// ============================================

// For old code that imports these
export const vehicleCategories = VEHICLE_CATEGORIES;
export const carServicePackages = CAR_SERVICE_PACKAGES;
// Deprecated but keeping to avoid immediate breakages if referenced elsewhere
export const propertyCategories: PropertyCategory[] = [];
export const cleaningServicePackages: CleaningServicePackage[] = [];
export const CLEANING_SERVICE_PACKAGES = cleaningServicePackages;
export const homeCleaningAddons: HomeCleaningAddonOption[] = [];

// Old pricing functions (for backward compatibility)
export const getCarPrice = getCarDetailingPrice;
export const getCleaningPrice = (
  propertySize: PropertySize,
  service: CleaningServiceOption,
) => 0;
export const getPropertyCategory = (id: PropertySize) =>
  propertyCategories.find((c) => c.id === id);
export const getCleaningServicePackage = (id: CleaningServiceOption) =>
  cleaningServicePackages.find((s) => s.id === id);
