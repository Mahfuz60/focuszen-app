package com.focuszen.app

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap

class FocusZenSettingsModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "FocusZenSettings"

    @ReactMethod
    fun isAccessibilityServiceEnabled(promise: Promise) {
        val enabled = Settings.Secure.getString(
            reactApplicationContext.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        )

        val expectedPackage = reactApplicationContext.packageName
        val expectedClass = FocusZenAccessibilityService::class.java.name

        val isEnabled = enabled
            ?.split(":")
            ?.any { service ->
                val component = ComponentName.unflattenFromString(service)

                (
                    component?.packageName == expectedPackage &&
                        component.className == expectedClass
                ) ||
                    service.equals("$expectedPackage/$expectedClass", ignoreCase = true) ||
                    service.equals("$expectedPackage/.FocusZenAccessibilityService", ignoreCase = true)
            } == true

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
        val prefs = reactApplicationContext.getSharedPreferences(
            "FocusZenPrefs",
            Context.MODE_PRIVATE
        )
        val editor = prefs.edit()
        val keys = features.keySetIterator()

        while (keys.hasNextKey()) {
            val key = keys.nextKey()

            try {
                val value = features.getBoolean(key)
                editor.putBoolean("feature_${appName}_${key}", value)
            } catch (error: Exception) {
                // Ignore non-boolean values.
            }
        }

        editor.apply()
    }

    @ReactMethod
    fun setBlockedPackages(packages: ReadableArray) {
        val values = mutableSetOf<String>()

        for (index in 0 until packages.size()) {
            packages.getString(index)?.let(values::add)
        }

        val prefs = reactApplicationContext.getSharedPreferences(
            "FocusZenPrefs",
            Context.MODE_PRIVATE
        )

        prefs.edit()
            .putStringSet("blockedPackages", values)
            .apply()
    }

    @ReactMethod
    fun setSafeBrowsing(adultContentBlock: Boolean, gamblingBlock: Boolean) {
        val prefs = reactApplicationContext.getSharedPreferences(
            "FocusZenPrefs",
            Context.MODE_PRIVATE
        )

        prefs.edit()
            .putBoolean("adultContentBlock", adultContentBlock)
            .putBoolean("gamblingBlock", gamblingBlock)
            .apply()
    }

    @ReactMethod
    fun setCustomBlockedDomains(domains: ReadableArray) {
        val values = mutableListOf<String>()

        for (index in 0 until domains.size()) {
            domains.getString(index)?.let(values::add)
        }

        val prefs = reactApplicationContext.getSharedPreferences(
            "FocusZenPrefs",
            Context.MODE_PRIVATE
        )

        prefs.edit()
            .putStringSet("customBlockedDomains", values.toSet())
            .apply()
    }

    @ReactMethod
    fun setFocusSession(isActive: Boolean, deepWorkEnabled: Boolean) {
        val prefs = reactApplicationContext.getSharedPreferences(
            "FocusZenPrefs",
            Context.MODE_PRIVATE
        )

        prefs.edit()
            .putBoolean("focusSessionActive", isActive)
            .putBoolean("deepWorkEnabled", deepWorkEnabled)
            .apply()
    }
}