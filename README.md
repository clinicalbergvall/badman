# CleanCloak ✨🏠

Enterprise-grade on-demand car detailing and home cleaning service platform for Kenya with team management, real-time tracking, and automated payments.

## 🚀 Platform Overview

CleanCloak is a comprehensive service booking platform that connects clients with professional cleaners through an intelligent team-based system. Features include real-time tracking, secure payments, team management, and admin oversight.

## ✨ Key Features

### 🎯 Client Experience
- **Modern UI/UX**: Dark theme with neon yellow accents, mobile-first responsive design
- **Dual Service Categories**: Professional Car Detailing & Home Cleaning services
- **Intelligent Booking Flow**: 7-step guided process with real-time validation
- **Live Service Tracking**: Real-time GPS tracking with ETA updates
- **In-App Communication**: Direct messaging with image sharing
- **Secure Payments**: Integrated IntaSend payment processing
- **Service History**: Comprehensive booking management and ratings

### 👥 Team Leader System
- **Crew Builder**: Team Leaders can build and manage cleaning crews
- **Auto Job Assignment**: Intelligent job distribution based on availability
- **60/40 Split**: Automated revenue sharing (Team Leader 60%, Crew 40%)
- **Crew Invitations**: Send and manage crew member invitations
- **Performance Tracking**: Monitor team efficiency and earnings

### 🔧 Cleaner Experience
- **Professional Profiles**: Comprehensive cleaner registration with verification
- **4-Point Verification**: ID, Police Clearance, References, Insurance
- **Service Selection**: Choose specializations (Car Detailing, Home Cleaning, or both)
- **Earnings Dashboard**: Track income and payment history
- **Team Management**: Join teams or work independently

### 🛡️ Admin Dashboard
- **Profile Review**: Approve/reject pending cleaner applications
- **Platform Management**: Oversee all platform activities
- **Analytics Dashboard**: Monitor business metrics and performance
- **User Management**: Manage clients, cleaners, and team leaders
- **Financial Oversight**: Track transactions and payouts

### 🌟 Advanced Features
- **Real-Time GPS Tracking**: Live location updates with map visualization
- **In-App Messaging**: Secure chat with read receipts and media sharing
- **Automated Payments**: IntaSend integration for seamless transactions
- **Verification System**: Multi-point background checks for safety
- **Mobile Responsive**: Optimized for all devices and screen sizes

## 🛠️ Technical Architecture

### Frontend Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5 with hot module replacement
- **Styling**: Tailwind CSS 3 with custom design system
- **State Management**: React hooks + Context API
- **Validation**: Zod schemas for type-safe validation
- **Notifications**: React Hot Toast for user feedback
- **Maps**: OpenStreetMap with GPS integration
- **Theme**: Dark mode with neon yellow (#FACC15) accents

### Backend Stack
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with role-based access control
- **Payments**: IntaSend payment gateway integration
- **File Upload**: Multer for document and image handling
- **Security**: bcryptjs, CORS, input validation
- **Real-time**: Ready for WebSocket integration

### Database Models
- **Users**: Client, Cleaner, and Team Leader accounts
- **CleanerProfiles**: Professional profiles with verification
- **Bookings**: Service booking management
- **Teams**: Team structure and member management
- **Tracking**: GPS location and status tracking
- **ChatRooms**: Message history and communication
- **Transactions**: Payment and payout records

### 🎨 Component Library
Premium UI components built with accessibility in mind:
- **Button** - Multiple variants (primary, secondary, outline, ghost, destructive)
- **Input** - With icons, labels, errors, helper text, and validation
- **Card** - Hoverable, selectable, and loading states
- **Badge** - Status indicators with color coding
- **ProgressBar** - Animated progress tracking with milestones
- **LiveTracking** - Real-time GPS tracking with map display
- **ChatBox** - Full-featured messaging interface
- **VerificationBadge** - Multi-point verification display
- **ServiceCard** - Service selection with pricing
- **TeamBuilder** - Crew management interface

### Pricing Matrix

**Car Detailing Services:**
| Vehicle Type | Interior | Exterior | Paint Correction | Full Detail |
|--------------|----------|----------|------------------|-------------|
| SUV          | KSh 7,500| KSh 8,500| KSh 9,500       | KSh 16,000  |
| Mid-SUV      | KSh 9,000| KSh 10,000| KSh 11,000     | KSh 18,000  |
| Saloon       | KSh 11,000| KSh 12,000| KSh 13,000    | KSh 20,000  |

**Home Cleaning Services:**
| Property Size | Standard | Deep | Carpet | Window | Post-Construction | Move-In/Out |
|---------------|----------|------|--------|--------|-------------------|-------------|
| Small (1-2BR) | KSh 5,000| KSh 6,000| KSh 7,000| KSh 8,000| KSh 15,000| KSh 10,000|
| Medium (3-4BR)| KSh 7,500| KSh 9,000| KSh 10,000| KSh 11,000| KSh 18,000| KSh 13,000|
| Large (5+BR)  | KSh 10,000| KSh 12,000| KSh 13,000| KSh 14,000| KSh 22,000| KSh 16,000|

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
clean-cloak/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── index.ts
│   │   ├── PhoneInput.tsx   # Legacy (can be removed)
│   │   ├── MpesaInput.tsx   # Legacy (can be removed)
│   │   └── ServiceCard.tsx  # Legacy (can be removed)
│   ├── lib/
│   │   ├── types.ts         # TypeScript type definitions
│   │   ├── validation.ts    # Zod schemas & data
│   │   └── utils.ts         # Helper functions
│   ├── pages/
│   │   └── Booking.tsx      # Main booking flow
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## Key Features

### Architecture
- ✅ Dual service category support (Car & Home)
- ✅ Proper component library with reusable primitives
- ✅ Centralized type definitions
- ✅ Better state management with clear data flow
- ✅ Utility functions for formatting and validation
- ✅ Geolocation integration
- ✅ Booking history management

### UX Enhancements
- ✅ Service category selection
- ✅ Smooth fade-in animations between steps
- ✅ Auto-formatting for phone numbers and M-PESA codes
- ✅ Visual progress bar
- ✅ GPS location detection with manual override
- ✅ Immediate vs scheduled booking options
- ✅ Detailed service descriptions with duration
- ✅ Comprehensive booking summary
- ✅ Booking history with status tracking
- ✅ Rating system for completed services
- ✅ Better error messages

### Code Quality
- ✅ Full TypeScript coverage
- ✅ Consistent naming conventions
- ✅ Modular and maintainable code structure
- ✅ Proper separation of concerns

### Design
- ✅ Modern gradient hero section
- ✅ Card-based layouts with hover states
- ✅ Icon integration throughout
- ✅ Responsive design (mobile-first)
- ✅ Accessible color contrast

## 🚀 Implementation Status

### ✅ Completed Features
- **Core Platform**: Dual service categories, booking flow, user management
- **Real-Time Features**: GPS tracking, in-app messaging, status updates
- **Verification System**: 4-point background checks with document upload
- **Team Management**: Team Leader system with crew building and auto-assignment
- **Payment Integration**: IntaSend payment processing with automated splits
- **Admin Dashboard**: Profile review, platform management, analytics
- **Mobile Optimization**: Fully responsive design with touch-friendly interface

### 🔄 In Development
- **WebSocket Integration**: True real-time updates for tracking and chat
- **Advanced Analytics**: Business intelligence and reporting dashboard
- **Push Notifications**: Mobile app notifications for booking updates
- **Multi-Language Support**: Swahili language integration
- **Promo System**: Discount codes and promotional campaigns

### 🎯 Future Roadmap
- **Mobile Apps**: Native iOS and Android applications
- **AI Matching**: Intelligent cleaner-client matching algorithm
- **Subscription Services**: Recurring cleaning packages
- **Expansion**: Additional service categories and geographic expansion
- **Enterprise Features**: B2B client management and corporate accounts

## 📋 Development Guidelines

### Code Standards
- **TypeScript**: Strict mode enabled with comprehensive type coverage
- **Components**: Functional components with hooks, no classes
- **Styling**: Tailwind utility classes with custom design tokens
- **Validation**: Zod schemas for all form inputs
- **Error Handling**: Comprehensive error boundaries and user feedback

### Validation Rules
- **Phone**: Kenyan format `+2547XXXXXXXX` (mobile numbers only)
- **M-PESA**: Exactly 10 alphanumeric characters
- **Email**: Standard email format validation
- **Location**: GPS coordinates with address validation

### Data Storage
- **Client Side**: LocalStorage for booking drafts and user preferences
- **Server Side**: MongoDB for persistent data storage
- **Cache**: Redis for session management (future)
- **Files**: Cloud storage for documents and images (future)

### API Standards
- **RESTful**: Consistent endpoint naming and HTTP methods
- **Authentication**: JWT tokens with role-based access control
- **Validation**: Request validation with descriptive error messages
- **Rate Limiting**: API protection against abuse
- **Documentation**: Comprehensive API documentation

### Security Measures
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control (Client/Cleaner/Admin)
- **Data Protection**: Encrypted sensitive information
- **Input Validation**: Protection against injection attacks
- **CORS**: Proper cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git for version control

### Installation
```bash
# Clone repository
git clone <repository-url>
cd cleancloak

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev          # Frontend (http://localhost:5173)
cd backend && npm run dev  # Backend (http://localhost:5000)
```

### Environment Configuration
Required environment variables:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/cleancloak

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# IntaSend Payments
INTASEND_SECRET_KEY=your-intasend-secret
INTASEND_PUBLIC_KEY=your-intasend-public
INTASEND_WEBHOOK_SECRET=your-webhook-secret
```

## 📱 Platform Access

### User Roles
- **Clients**: Book services, track progress, make payments
- **Cleaners**: Receive jobs, update status, manage earnings
- **Team Leaders**: Build teams, assign jobs, manage splits
- **Admins**: Platform oversight, user management, analytics

### Access URLs
- **Client Platform**: `http://localhost:5173` (main application)
- **Admin Dashboard**: `http://localhost:5173/admin`
- **API Documentation**: `http://localhost:5000/api-docs`

## 📞 Support & Contact

### Technical Support
- **Documentation**: Check project README and code comments
- **Issues**: Report bugs via GitHub issues
- **Email**: support@cleancloak.com
- **Services**: info@cleancloak.com
- **Partnerships**: partners@cleancloak.com
- **Careers**: careers@cleancloak.com

---

**🏆 Enterprise-Grade Platform Built for Kenya's Cleaning Industry**

*Professional Car Detailing & Home Cleaning with Team Management, Real-Time Tracking, and Automated Payments*

© 2025 CleanCloak. All rights reserved.
