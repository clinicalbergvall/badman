export type ServiceCategory = "car-detailing" | "home-cleaning";

// Car Detailing Types - NEW STRUCTURE
export type VehicleType = "SEDAN" | "MID-SUV" | "SUV-DOUBLE-CAB";

export type CarServicePackage =
  | "NORMAL-DETAIL" // Restore show-room look
  | "INTERIOR-STEAMING" // Sanitation, deep cleaning, stain & odor removal
  | "PAINT-CORRECTION" // Restoring car's shine (has stages)
  | "FULL-DETAIL" // Complete package
  | "FLEET-PACKAGE"; // Deep cleaning for 5+ cars

export type PaintCorrectionStage = "STAGE-1" | "STAGE-2" | "STAGE-3";

export type CarDetailingExtra =
  | "plastic-restoration"
  | "rust-removal"
  | "de-greasing"
  | "brown-stain-removal"
  | "window-polishing";

// Mid-SUV pricing tier (for packages with two price options)
export type MidSUVPricingTier = "STANDARD" | "PREMIUM";

// Home Cleaning Types
// Home Cleaning Types
export type CleaningCategory =
  | "HOUSE_CLEANING"
  | "FUMIGATION"
  | "MOVE_IN_OUT"
  | "POST_CONSTRUCTION";

export type HouseCleaningType = "BATHROOM" | "WINDOW" | "ROOM";
export type FumigationType = "GENERAL" | "BED_BUG";

export type RoomSize = "STUDIO" | "1BED" | "2BED" | "3BED" | "4BED" | "5BED";

// Keeping these for backward compatibility if needed, but they will be phased out
export type PropertySize = "SMALL" | "MEDIUM" | "LARGE" | RoomSize;
export type CleaningServiceOption =
  | "STANDARD"
  | "DEEP"
  | "CARPET"
  | "WINDOW"
  | "POST_CONSTRUCTION"
  | "MOVE_IN_OUT"
  | HouseCleaningType;

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in-progress"
  | "completed";
export type PaymentMethod = "mpesa" | "card" | "cash";
export type BookingType = "immediate" | "scheduled";

export interface VehicleCategory {
  id: VehicleType;
  name: string;
  description: string;
  icon: string;
}

export interface CarServicePackageOption {
  id: CarServicePackage;
  name: string;
  description: string;
  duration: string;
  requiresStage?: boolean; // For paint correction
  requiresCarCount?: boolean; // For fleet package
}

export interface PaintCorrectionStageOption {
  id: PaintCorrectionStage;
  name: string;
  description: string;
}

export interface CarDetailingExtraOption {
  id: CarDetailingExtra;
  name: string;
  description: string;
  price: number;
  icon: string;
}

export type HomeCleaningAddon =
  | "pet-hair-treatment"
  | "inside-cabinets"
  | "appliance-detail"
  | "window-detailing"
  | "laundry-folding"
  | "organization-reset";

export interface HomeCleaningAddonOption {
  id: HomeCleaningAddon;
  name: string;
  description: string;
  icon: string;
  price: number;
  bestFor?: string;
}

export interface PropertyCategory {
  id: PropertySize;
  name: string;
  description: string;
  icon: string;
}

export interface CleaningServicePackage {
  id: CleaningServiceOption;
  name: string;
  description: string;
  duration: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  manualAddress?: string;
}

export interface BookingData {
  id?: string;
  phone: string;
  mpesa: string;
  serviceCategory: ServiceCategory;
  // Car detailing fields - NEW STRUCTURE
  vehicleType?: VehicleType;
  carServicePackage?: CarServicePackage;
  paintCorrectionStage?: PaintCorrectionStage; // Only for PAINT-CORRECTION package
  midSUVPricingTier?: MidSUVPricingTier; // For Mid-SUV pricing choice
  fleetCarCount?: number; // Only for FLEET-PACKAGE (minimum 5)
  selectedCarExtras?: CarDetailingExtra[]; // Optional extras
  // Home cleaning fields
  // Home cleaning fields
  cleaningCategory?: CleaningCategory;
  roomSize?: RoomSize;

  // House Cleaning Specifics
  houseCleaningType?: HouseCleaningType;
  bathroomItems?: {
    general: boolean;
    sink: boolean;
    toilet: boolean;
  };
  windowCount?: {
    small: number;
    large: number;
    wholeHouse: boolean;
  };

  // Fumigation Specifics
  fumigationType?: FumigationType;

  // Legacy fields (keeping optional for now)
  propertySize?: PropertySize;
  cleaningServiceOption?: CleaningServiceOption;
  selectedHomeAddons?: HomeCleaningAddon[];
  location?: Location;
  selectedCleanerId?: string;
  selectedCleanerName?: string;
  selectedCleanerPhoto?: string;
  bookingType: BookingType;
  scheduledDate?: string;
  scheduledTime?: string;
  paymentMethod: PaymentMethod;
  price: number;
  addonsTotal?: number;
  status?: BookingStatus;
  createdAt?: string;
  rating?: number;
  review?: string;
}

export interface PricingMatrix {
  [key: string]: {
    [key: string]: number;
  };
}

export interface BookingHistoryItem extends BookingData {
  id: string;
  status: BookingStatus;
  createdAt: string;
  rating?: number;
  review?: string;
  cleaner?: { name?: string; phone?: string };
  cleanerProfile?: { passportPhoto?: string; profileImage?: string };
  paid?: boolean; // Add this property
}

export interface UserAccountSession {
  userType: "client" | "cleaner" | "admin";
  name: string;
  phone: string;
  lastSignedIn: string;
}

export interface CleanerProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  bio?: string;
  profileImage?: string;
  passportPhoto?: string;
  fullBodyPhoto?: string;
  portfolioImages: string[];
  services: ServiceCategory[];
  rating: number;
  totalJobs: number;
  verified: boolean;
  approvalStatus?: "pending" | "approved" | "rejected";
  verification?: VerificationDetails;
  beforeAfterPhotos?: BeforeAfterPhoto[];
  mpesaPhoneNumber?: string;
  createdAt: string;
}

export interface VerificationDetails {
  idVerified: boolean;
  idNumber?: string;
  idDocumentFront?: string;
  idDocumentBack?: string;
  policeCheck: boolean;
  policeCertificate?: string;
  references: Reference[];
  insuranceCoverage: boolean;
  insuranceDocument?: string;
  verifiedAt?: string;
}

export interface Reference {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  verified: boolean;
}

export interface TrackingData {
  bookingId: string;
  cleanerId: string;
  currentLocation: Location;
  status: "on-way" | "arrived" | "in-progress" | "completed";
  estimatedArrival?: string;
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  senderRole: "client" | "cleaner";
  message: string;
  imageUrl?: string;
  timestamp: string;
  read: boolean;
}

export interface ChatRoom {
  id: string;
  bookingId: string;
  clientId: string;
  cleanerId: string;
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
}

export interface PortfolioImage {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: string;
}

export interface BeforeAfterPhoto {
  id: string;
  bookingId: string;
  beforeImage: string;
  afterImage: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
  servicesUsed?: string[];
}

export interface CleanerJobOpportunity {
  id: string;
  title: string;
  location: string;
  payout: string;
  timing: string;
  requirements: string[];
  serviceCategory: ServiceCategory;
  priority?: "standard" | "featured" | "auto-team";
  saved?: boolean;
  bookingId?: string;
  createdAt?: string;
}

export interface CleanerChecklistItem {
  id: string;
  label: string;
  done: boolean;
}
