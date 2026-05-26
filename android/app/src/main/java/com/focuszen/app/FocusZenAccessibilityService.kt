package com.focuszen.app

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.SystemClock
import android.view.accessibility.AccessibilityEvent

class FocusZenAccessibilityService : AccessibilityService() {

    private var lastBlockedPackage: String? = null
    private var lastBlockedAt: Long = 0L

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val packageName = event.packageName?.toString() ?: return
        if (packageName == applicationContext.packageName) return
        if (!shouldBlock(packageName)) return

        val now = SystemClock.elapsedRealtime()
        if (lastBlockedPackage == packageName && now - lastBlockedAt < 1500L) {
            return
        }

        lastBlockedPackage = packageName
        lastBlockedAt = now

        performGlobalAction(GLOBAL_ACTION_BACK)
        openBlockScreen(packageName)
    }

    override fun onInterrupt() = Unit

    private fun shouldBlock(packageName: String): Boolean {
        val globalPrefs = getSharedPreferences("FocusZenPrefs", Context.MODE_PRIVATE)
        val appName = AppPackageMap.appNameFor(packageName) ?: return false

        val blockApp = globalPrefs.getBoolean("feature_${appName}_blockApp", false)
        val blockShorts = globalPrefs.getBoolean("feature_${appName}_blockShorts", false)
        val blockReels = globalPrefs.getBoolean("feature_${appName}_blockReels", false)
        val blockStories = globalPrefs.getBoolean("feature_${appName}_blockStories", false)
        val blockFeed = globalPrefs.getBoolean("feature_${appName}_blockFeed", false)
        val blockSearch = globalPrefs.getBoolean("feature_${appName}_blockSearch", false)
        val blockComments = globalPrefs.getBoolean("feature_${appName}_blockComments", false)

        return blockApp || blockShorts || blockReels || blockStories || blockFeed || blockSearch || blockComments
    }

    private fun openBlockScreen(packageName: String) {
        val appName = AppPackageMap.appNameFor(packageName) ?: packageName
        val uri = Uri.parse("focuszen://blocked/${Uri.encode(appName)}")

        val intent = Intent(Intent.ACTION_VIEW, uri)
        intent.setPackage(applicationContext.packageName)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)

        try {
            startActivity(intent)
        } catch (e: Exception) {
            // Log fallback
        }
    }
}