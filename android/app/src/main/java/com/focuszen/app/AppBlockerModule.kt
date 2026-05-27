package com.focuszen.app

import android.app.AppOpsManager
import android.content.Context
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AppBlockerModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "AppBlockerModule"

    @ReactMethod
    fun setBlockingRules(rulesJson: String) {
        val prefs = reactApplicationContext.getSharedPreferences("FocusZenPrefs", Context.MODE_PRIVATE)
        prefs.edit().putString("blockingRules", rulesJson).apply()
    }

    @ReactMethod
    fun hasUsageStatsPermission(promise: Promise) {
        val appOps =
            reactApplicationContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager

        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                reactApplicationContext.packageName
            )
        } else {
            appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                reactApplicationContext.packageName
            )
        }

        promise.resolve(mode == AppOpsManager.MODE_ALLOWED)
    }
}
