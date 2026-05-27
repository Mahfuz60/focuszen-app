package com.focuszen.app

import android.app.AppOpsManager
import android.content.ComponentName
import android.content.Context
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import android.text.TextUtils
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class PermissionCheckerModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "PermissionChecker"

    @ReactMethod
    fun checkUsageAccess(promise: Promise) {
        promise.resolve(hasUsageAccess())
    }

    @ReactMethod
    fun checkAccessibility(promise: Promise) {
        promise.resolve(isAccessibilityEnabled())
    }

    @ReactMethod
    fun checkOverlay(promise: Promise) {
        promise.resolve(
            Build.VERSION.SDK_INT < Build.VERSION_CODES.M ||
                Settings.canDrawOverlays(reactContext)
        )
    }

    @ReactMethod
    fun checkBatteryOptimization(promise: Promise) {
        val powerManager =
            reactContext.getSystemService(Context.POWER_SERVICE) as PowerManager

        promise.resolve(
            Build.VERSION.SDK_INT < Build.VERSION_CODES.M ||
                powerManager.isIgnoringBatteryOptimizations(reactContext.packageName)
        )
    }

    private fun hasUsageAccess(): Boolean {
        val appOps =
            reactContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager

        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                reactContext.packageName
            )
        } else {
            appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                reactContext.packageName
            )
        }

        return mode == AppOpsManager.MODE_ALLOWED
    }

    private fun isAccessibilityEnabled(): Boolean {
        val enabledServices = Settings.Secure.getString(
            reactContext.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false

        val expectedPackage = reactContext.packageName
        val expectedClass = FocusZenAccessibilityService::class.java.name

        val splitter = TextUtils.SimpleStringSplitter(':')
        splitter.setString(enabledServices)

        while (splitter.hasNext()) {
            val service = splitter.next()
            val component = ComponentName.unflattenFromString(service)

            if (
                component?.packageName == expectedPackage &&
                component.className == expectedClass
            ) {
                return true
            }

            if (
                service.equals("$expectedPackage/$expectedClass", ignoreCase = true) ||
                service.equals("$expectedPackage/.FocusZenAccessibilityService", ignoreCase = true)
            ) {
                return true
            }
        }

        return false
    }
}