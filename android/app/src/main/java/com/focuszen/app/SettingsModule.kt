package com.focuszen.app

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class SettingsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val prefs: SharedPreferences =
        reactContext.getSharedPreferences("FocusZenSettings", Context.MODE_PRIVATE)

    override fun getName(): String {
        return "FocusZenSettings"
    }

    @ReactMethod
    fun updateAppFeatures(appName: String, features: ReadableMap) {
        val editor = prefs.edit()
        val featureKeys = features.keySetIterator()
        while (featureKeys.hasNextKey()) {
            val key = featureKeys.nextKey()
            try {
                if (features.getType(key) == com.facebook.react.bridge.ReadableType.Boolean) {
                    val value = features.getBoolean(key)
                    editor.putBoolean("${appName}_${key}", value)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        editor.commit() // Synchronous write to ensure AccessibilityService gets it immediately
    }
    
    @ReactMethod
    fun setStrictMode(enabled: Boolean) {
        prefs.edit().putBoolean("strict_mode", enabled).apply()
    }

    @ReactMethod
    fun setFocusSession(active: Boolean, deepWork: Boolean) {
        prefs.edit().apply {
            putBoolean("focus_active", active)
            putBoolean("focus_deep_work", deepWork)
            apply()
        }
    }

    @ReactMethod
    fun startService() {
        val intent = Intent(reactApplicationContext, FocusForegroundService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactApplicationContext.startForegroundService(intent)
        } else {
            reactApplicationContext.startService(intent)
        }
    }

    @ReactMethod
    fun stopService() {
        val intent = Intent(reactApplicationContext, FocusForegroundService::class.java)
        reactApplicationContext.stopService(intent)
    }

    @ReactMethod
    fun setSafeBrowsing(adultContentBlock: Boolean, gamblingBlock: Boolean) {
        prefs.edit()
            .putBoolean("adultContentBlock", adultContentBlock)
            .putBoolean("gamblingBlock", gamblingBlock)
            .apply()
    }

    @ReactMethod
    fun setCustomBlockedDomains(domains: com.facebook.react.bridge.ReadableArray) {
        val sb = StringBuilder()
        for (i in 0 until domains.size()) {
            if (i > 0) sb.append(",")
            sb.append(domains.getString(i))
        }
        prefs.edit().putString("custom_blocked_domains", sb.toString()).apply()
    }

    // NEW: Check if accessibility service is enabled
    @ReactMethod
    fun isAccessibilityServiceEnabled(promise: com.facebook.react.bridge.Promise) {
        try {
            val enabled = isServiceEnabled()
            promise.resolve(enabled)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // NEW: Open accessibility settings
    @ReactMethod
    fun openAccessibilitySettings() {
        try {
            val intent = Intent(android.provider.Settings.ACTION_ACCESSIBILITY_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun isServiceEnabled(): Boolean {
        val serviceName = "${reactApplicationContext.packageName}/${FocusAccessibilityService::class.java.name}"
        val settingValue = android.provider.Settings.Secure.getString(
            reactApplicationContext.contentResolver,
            android.provider.Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        )
        return settingValue?.contains(serviceName) == true
    }
}

