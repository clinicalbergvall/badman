# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# ================================
# CAPACITOR SPECIFIC RULES
# ================================

# Keep Capacitor core classes
-keep class com.getcapacitor.** { *; }
-keepclassmembers class com.getcapacitor.** { *; }
-keepattributes *Annotation*, InnerClasses, Signature, Throws, SourceFile, LineNumberTable

# Keep plugin classes
-keep class com.getcapacitor.plugin.** { *; }
-keepclassmembers class com.getcapacitor.plugin.** { *; }

# Keep JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep WebView classes
-keepclassmembers class * extends android.webkit.WebViewClient {
    public void *(android.webkit.WebView, java.lang.String, android.graphics.Bitmap);
    public boolean *(android.webkit.WebView, java.lang.String);
}
-keepclassmembers class * extends android.webkit.WebChromeClient {
    public void *(android.webkit.WebView, java.lang.String);
}

# ================================
# ANDROID SYSTEM RULES
# ================================

# Keep Android components
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider
-keep public class * extends android.view.View

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep custom views
-keepclassmembers class * extends android.view.View {
    public <init>(android.content.Context);
    public <init>(android.content.Context, android.util.AttributeSet);
    public <init>(android.content.Context, android.util.AttributeSet, int);
}

# Keep setters in Views
-keepclassmembers public class * extends android.view.View {
   void set*(***);
   *** get*();
}

# Keep Parcelable implementations
-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator CREATOR;
}

# Keep Serializable implementations
-keepnames class * implements java.io.Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep enum classes
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# ================================
# ANDROIDX RULES
# ================================

# Keep AndroidX classes
-keep class androidx.** { *; }
-keep interface androidx.** { *; }
-dontwarn androidx.**

# Keep AppCompat classes
-keep class androidx.appcompat.** { *; }
-keep interface androidx.appcompat.** { *; }

# Keep CoordinatorLayout
-keep class androidx.coordinatorlayout.** { *; }
-dontwarn androidx.coordinatorlayout.**

# Keep Core Splash Screen
-keep class androidx.core.splashscreen.** { *; }
-dontwarn androidx.core.splashscreen.**

# ================================
# KOTLIN RULES (if using Kotlin)
# ================================

-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-keepclassmembers class **$WhenMappings {
    <fields>;
}
-keepclassmembers class kotlin.Metadata {
    public <methods>;
}

# ================================
# PERFORMANCE OPTIMIZATIONS
# ================================

# Optimize code
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-dontskipnonpubliclibraryclassmembers
-dontpreverify
-verbose

# Optimization flags
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-allowaccessmodification
-repackageclasses ''

# Remove logging
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}

# ================================
# WEBVIEW & JAVASCRIPT BRIDGE
# ================================

# Keep WebView JavaScript Bridge
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep all WebView related classes
-keep class android.webkit.** { *; }
-dontwarn android.webkit.**

# Keep JavaScript interfaces
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ================================
# GSON / JSON PARSING (if used)
# ================================

-keepattributes Signature
-keepattributes *Annotation*
-dontwarn sun.misc.**
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapter
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# Keep generic signatures for JSON
-keepattributes Signature
-keepclassmembers,allowobfuscation class * {
  @com.google.gson.annotations.SerializedName <fields>;
}

# ================================
# OKHTTP / NETWORKING (if used)
# ================================

-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep class okio.** { *; }
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase

# ================================
# CUSTOM APP CLASSES
# ================================

# Keep your app's package classes
-keep class com.cleancloak.app.** { *; }

# Keep models/data classes
-keep class com.cleancloak.app.models.** { *; }

# ================================
# REFLECTION RULES
# ================================

# Keep classes accessed via reflection
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# ================================
# RESOURCE SHRINKING
# ================================

# Keep resources
-keepclassmembers class **.R$* {
    public static <fields>;
}

# Keep resource IDs
-keepclasseswithmembers class **.R$* {
    public static final int *;
}

# ================================
# CRASH REPORTING (if using)
# ================================

# Keep stack traces readable
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Keep exception classes
-keep public class * extends java.lang.Exception

# ================================
# REMOVE DEBUG CODE
# ================================

# Remove debug logs in production
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# Remove debug/test classes
-dontwarn junit.**
-dontwarn org.junit.**
-dontwarn org.hamcrest.**
-dontwarn androidx.test.**

# ================================
# WARNINGS TO IGNORE
# ================================

# Ignore warnings for missing classes
-dontwarn com.google.android.gms.**
-dontwarn com.google.firebase.**
-dontwarn org.apache.http.**
-dontwarn android.net.http.**

# ================================
# ADDITIONAL OPTIMIZATIONS
# ================================

# Allow code shrinking
-dontshrink
-dontoptimize

# Preserve line numbers for debugging stack traces
-keepattributes SourceFile,LineNumberTable

# Keep annotations
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# ================================
# END OF PROGUARD RULES
# ================================
