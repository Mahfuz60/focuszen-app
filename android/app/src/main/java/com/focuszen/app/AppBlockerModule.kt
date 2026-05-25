package com.focuszen.app

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AppBlockerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "AppBlockerModule"

    @ReactMethod
    fun setBlockingRules(rulesJson: String) {
        val prefs = reactApplicationContext
            .getSharedPreferences("AppBlocker", Context.MODE_PRIVATE)
        prefs.edit().putString("rules", rulesJson).apply()
    }

    @ReactMethod
    fun hasUsageStatsPermission(promise: com.facebook.react.bridge.Promise) {
        val appOps = reactApplicationContext
            .getSystemService(Context.APP_OPS_SERVICE) as android.app.AppOpsManager
        val mode = appOps.checkOpNoThrow(
            android.app.AppOpsManager.OPSTR_GET_USAGE_STATS,
            android.os.Process.myUid(),
            reactApplicationContext.packageName
        )
        promise.resolve(mode == android.app.AppOpsManager.MODE_ALLOWED)
    }
}