package com.focuszen.app

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.SystemClock
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class FocusZenAccessibilityService : AccessibilityService() {
    private var lastBlockedKey: String? = null
    private var lastBlockedAt: Long = 0L

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        event ?: return

        val packageName = event.packageName?.toString() ?: return

        if (packageName == applicationContext.packageName) {
            return
        }

        val appName = AppPackageMap.appNameFor(packageName) ?: return
        val prefs = getSharedPreferences("FocusZenPrefs", Context.MODE_PRIVATE)

        if (isFullAppBlocked(prefs, packageName)) {
            blockPackage(packageName, "full_app")
            return
        }

        val screenText = collectEventAndScreenText(event).lowercase()
        val reason = getFeatureBlockReason(appName, prefs, screenText)

        if (reason != null) {
            blockPackage(packageName, reason)
        }
    }

    override fun onInterrupt() = Unit

    private fun isFullAppBlocked(
        prefs: android.content.SharedPreferences,
        packageName: String
    ): Boolean {
        val blockedPackages = prefs.getStringSet("blockedPackages", emptySet()) ?: emptySet()
        return blockedPackages.contains(packageName)
    }

    private fun getFeatureBlockReason(
        appName: String,
        prefs: android.content.SharedPreferences,
        screenText: String
    ): String? {
        val blockShorts = prefs.getBoolean("feature_${appName}_blockShorts", false)
        val blockReels = prefs.getBoolean("feature_${appName}_blockReels", false)
        val blockStories = prefs.getBoolean("feature_${appName}_blockStories", false)
        val blockFeed = prefs.getBoolean("feature_${appName}_blockFeed", false)
        val blockSearch = prefs.getBoolean("feature_${appName}_blockSearch", false)
        val blockComments = prefs.getBoolean("feature_${appName}_blockComments", false)
        val blockExplore = prefs.getBoolean("feature_${appName}_blockExplore", false)
        val blockSpotlight = prefs.getBoolean("feature_${appName}_blockSpotlight", false)
        val blockChannels = prefs.getBoolean("feature_${appName}_blockChannels", false)
        val blockStatus = prefs.getBoolean("feature_${appName}_blockStatus", false)
        val blockVoom = prefs.getBoolean("feature_${appName}_blockVoom", false)

        return when (appName) {
            "YouTube" -> when {
                blockShorts && containsAny(screenText, listOf("shorts", "youtube shorts")) -> "shorts"
                blockSearch && containsAny(screenText, listOf("search youtube", "search")) -> "search"
                blockComments && containsAny(screenText, listOf("comments", "comment")) -> "comments"
                else -> null
            }

            "Facebook" -> when {
                blockReels && containsAny(screenText, listOf("reels", "reel")) -> "reels"
                blockStories && containsAny(screenText, listOf("stories", "story")) -> "stories"
                blockFeed && containsAny(screenText, listOf("feed", "news feed")) -> "feed"
                else -> null
            }

            "Instagram" -> when {
                blockReels && containsAny(screenText, listOf("reels", "reel")) -> "reels"
                blockStories && containsAny(screenText, listOf("stories", "story")) -> "stories"
                blockExplore && containsAny(screenText, listOf("explore", "search")) -> "explore"
                else -> null
            }

            "TikTok" -> when {
                blockReels && containsAny(screenText, listOf("for you", "following", "tiktok")) -> "reels"
                blockSearch && screenText.contains("search") -> "search"
                blockComments && containsAny(screenText, listOf("comments", "comment")) -> "comments"
                else -> null
            }

            "Snapchat" -> when {
                blockSpotlight && screenText.contains("spotlight") -> "spotlight"
                blockStories && containsAny(screenText, listOf("stories", "story")) -> "stories"
                else -> null
            }

            "Telegram" -> when {
                blockChannels && containsAny(screenText, listOf("channel", "channels")) -> "channels"
                else -> null
            }

            "Line" -> when {
                blockVoom && screenText.contains("voom") -> "voom"
                else -> null
            }

            "Messenger" -> when {
                blockStories && containsAny(screenText, listOf("stories", "story")) -> "stories"
                else -> null
            }

            "WhatsApp" -> when {
                blockStatus && screenText.contains("status") -> "status"
                blockChannels && containsAny(screenText, listOf("channel", "channels")) -> "channels"
                else -> null
            }

            "X" -> when {
                blockExplore && containsAny(screenText, listOf("explore", "search")) -> "explore"
                else -> null
            }

            else -> null
        }
    }

    private fun blockPackage(packageName: String, reason: String) {
        val now = SystemClock.elapsedRealtime()
        val key = "$packageName:$reason"

        if (lastBlockedKey == key && now - lastBlockedAt < 1500L) {
            return
        }

        lastBlockedKey = key
        lastBlockedAt = now

        Log.d("FocusZenBlocker", "Blocking package=$packageName reason=$reason")

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

    private fun collectEventAndScreenText(event: AccessibilityEvent): String {
        val values = mutableListOf<String>()

        event.text?.forEach { value ->
            if (!value.isNullOrBlank()) {
                values.add(value.toString())
            }
        }

        event.contentDescription?.let { value ->
            if (value.isNotBlank()) {
                values.add(value.toString())
            }
        }

        rootInActiveWindow?.let { root ->
            collectNodeText(root, values, 0)
        }

        val result = values.joinToString(" ")
        Log.d("FocusZenBlocker", "screenText=$result")
        return result
    }

    private fun collectNodeText(
        node: AccessibilityNodeInfo,
        values: MutableList<String>,
        depth: Int
    ) {
        if (depth > 8) {
            return
        }

        node.text?.let { value ->
            if (value.isNotBlank()) {
                values.add(value.toString())
            }
        }

        node.contentDescription?.let { value ->
            if (value.isNotBlank()) {
                values.add(value.toString())
            }
        }

        node.viewIdResourceName?.let { value ->
            if (value.isNotBlank()) {
                values.add(value)
            }
        }

        for (index in 0 until node.childCount) {
            node.getChild(index)?.let { child ->
                collectNodeText(child, values, depth + 1)
            }
        }
    }

    private fun containsAny(text: String, values: List<String>): Boolean {
        return values.any { text.contains(it) }
    }
}