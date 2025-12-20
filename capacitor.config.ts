import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cleancloak.app",
  appName: "Clean Cloak",
  webDir: "dist",

  // Server configuration
  server: {
    // Allow navigation to external URLs
    allowNavigation: [
      "clean-cloak-b.onrender.com",
      "*.onrender.com",
      "*.netlify.app",
    ],

    // Clear text traffic for development (disable in production)
    androidScheme: "https",

    // Hostname for local development
    hostname: "localhost",
  },

  // Android-specific performance optimizations
  android: {
    // Enable hardware acceleration
    allowMixedContent: true,

    // WebView settings for better performance
    webContentsDebuggingEnabled: false, // Disable in production for security

    // Background color (matches your app theme)
    backgroundColor: "#ffffff",

    // Build configuration
    buildOptions: {
      // Enable ProGuard/R8 for code shrinking
      shrinkResources: true,
    },
  },

  // iOS-specific settings (for future)
  ios: {
    contentInset: "automatic",
    scrollEnabled: true,
  },

  // Plugins configuration
  plugins: {
    // Splash screen
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#FACC15", // Yellow brand color
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerColor: "#000000",
    },

    // Keyboard settings
    Keyboard: {
      resize: "native",
      style: "dark",
      resizeOnFullScreen: true,
    },

    // Status bar
    StatusBar: {
      style: "dark",
      backgroundColor: "#FACC15",
    },

    // App settings
    App: {
      // This property doesn't exist in Capacitor's App plugin
    },

    // Network settings
    CapacitorHttp: {
      enabled: true,
    },
  },

  // Performance optimizations
  loggingBehavior: "production", // Reduce logging in production
};

module.exports = config;
