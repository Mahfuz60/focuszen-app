package com.focuszen.app

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.SystemClock
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class FocusZenAccessibilityService : AccessibilityService() {
    private var lastBlockedPackage: String? = null
    private var lastBlockedAt: Long = 0L

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        event ?: return

        val packageName = event.packageName?.toString() ?: return

        if (packageName == applicationContext.packageName) {
            return
        }

        if (shouldBlockPackage(packageName)) {
            blockPackage(packageName)
            return
        }

        val appName = AppPackageMap.appNameFor(packageName) ?: return
        val prefs = getSharedPreferences("FocusZenPrefs", Context.MODE_PRIVATE)

        val focusActive = prefs.getBoolean("focusSessionActive", false)
        if (!focusActive) {
            return
        }

        val blockShorts = prefs.getBoolean("feature_${appName}_blockShorts", false)
        val blockReels = prefs.getBoolean("feature_${appName}_blockReels", false)

        if (blockShorts || blockReels) {
            val text = rootInActiveWindow?.let { collectText(it) } ?: ""
            val lowerText = text.lowercase()

            if (
                (blockShorts && lowerText.contains("shorts")) ||
                (blockReels && lowerText.contains("reels"))
            ) {
                blockPackage(packageName)
            }
        }
    }

    override fun onInterrupt() = Unit

    private fun shouldBlockPackage(packageName: String): Boolean {
        val prefs = getSharedPreferences("FocusZenPrefs", Context.MODE_PRIVATE)

        val focusActive = prefs.getBoolean("focusSessionActive", false)
        if (!focusActive) {
            return false
        }

        val blockedPackages = prefs.getStringSet("blockedPackages", emptySet()) ?: emptySet()

        return blockedPackages.contains(packageName)
    }

    private fun blockPackage(packageName: String) {
        val now = SystemClock.elapsedRealtime()

        if (lastBlockedPackage == packageName && now - lastBlockedAt < 1500L) {
            return
        }

        lastBlockedPackage = packageName
        lastBlockedAt = now

        performGlobalAction(GLOBAL_ACTION_BACK)

        val appName = AppPackageMap.appNameFor(packageName) ?: packageName
        openBlockScreen(appName)
    }

    private fun openBlockScreen(appName: String) {
        val uri = Uri.parse("focuszen://blocked/${Uri.encode(appName)}")

        val intent = Intent(Intent.ACTION_VIEW, uri)
        intent.setPackage(applicationContext.packageName)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)

        startActivity(intent)
    }

    private fun collectText(node: AccessibilityNodeInfo): String {
        val text = java.lang.StringBuilder()

        node.text?.let {
            text.append(it).append(" ")
        }

        node.contentDescription?.let {
            text.append(it).append(" ")
        }

        for (i in 0 until node.childCount) {
            node.getChild(i)?.let { child ->
                text.append(collectText(child))
            }
        }

        return text.toString()
    }
}