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
            val value = features.getBoolean(key)
            editor.putBoolean("${appName}_${key}", value)
        }
        editor.apply()
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
}
