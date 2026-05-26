package com.focuszen.app

import android.content.Context
import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.*

class FocusZenSettingsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "FocusZenSettings"
    }

   @ReactMethod
    fun isAccessibilityServiceEnabled(promise: Promise) {
        val expectedService =
            "${reactApplicationContext.packageName}/${FocusZenAccessibilityService::class.java.name}"

        val enabledServices = Settings.Secure.getString(
            reactApplicationContext.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: ""

        val isEnabled = enabledServices
            .split(":")
            .any { it.equals(expectedService, ignoreCase = true) }

        promise.resolve(isEnabled)
    }

    @ReactMethod
    fun startService() {
       
       // AccessibilityService is controlled by Android settings.
    } 

    @ReactMethod
    fun stopService() {
        // AccessibilityService is controlled by Android settings.
    }

    @ReactMethod
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun updateAppFeatures(appName: String, features: ReadableMap) {
        val prefs = reactApplicationContext.getSharedPreferences("FocusZenPrefs", Context.MODE_PRIVATE)
        val editor = prefs.edit()
        val keys = features.keySetIterator()
        while (keys.hasNextKey()) {
            val key = keys.nextKey()
            try {
                val value = features.getBoolean(key)
                editor.putBoolean("feature_${appName}_${key}", value)
            } catch (e: Exception) {
                // Ignore type mismatches
            }
        }
        editor.apply()
    }

    @ReactMethod
    fun setSafeBrowsing(adultContentBlock: Boolean, gamblingBlock: Boolean) {
        val prefs = reactApplicationContext.getSharedPreferences("FocusZenPrefs", Context.MODE_PRIVATE)
        prefs.edit()
            .putBoolean("adultContentBlock", adultContentBlock)
            .putBoolean("gamblingBlock", gamblingBlock)
            .apply()
    }

    @ReactMethod
    fun setCustomBlockedDomains(domains: ReadableArray) {
        val list = ArrayList<String>()
        for (i in 0 until domains.size()) {
            try {
                val domain = domains.getString(i)
                if (domain != null) {
                    list.add(domain)
                }
            } catch (e: Exception) {
                // Ignore invalid types
            }
        }
        val json = "[" + list.joinToString(",") { "\"$it\"" } + "]"
        val prefs = reactApplicationContext.getSharedPreferences("FocusZenPrefs", Context.MODE_PRIVATE)
        prefs.edit().putString("customBlockedDomains", json).apply()
    }

    @ReactMethod
    fun setFocusSession(isActive: Boolean, deepWorkEnabled: Boolean) {
        val prefs = reactApplicationContext.getSharedPreferences("FocusZenPrefs", Context.MODE_PRIVATE)
        prefs.edit()
            .putBoolean("focusSessionActive", isActive)
            .putBoolean("deepWorkEnabled", deepWorkEnabled)
            .apply()
    }
}
