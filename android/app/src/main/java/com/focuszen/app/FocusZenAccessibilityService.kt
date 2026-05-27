package com.focuszen.app

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.SystemClock
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import org.json.JSONArray
import org.json.JSONObject

class FocusZenAccessibilityService : AccessibilityService() {
    private var lastBlockedKey: String? = null
    private var lastBlockedAt: Long = 0L

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        event ?: return

        val packageName = event.packageName?.toString() ?: return
        if (packageName == applicationContext.packageName) return

        val appName = AppPackageMap.appNameFor(packageName) ?: return
        val reason = getBlockReason(appName, event) ?: return

        blockApp(appName, reason)
    }

    override fun onInterrupt() = Unit

    private fun getBlockReason(
        appName: String,
        event: AccessibilityEvent
    ): String? {
        val prefs = getSharedPreferences("FocusZenPrefs", Context.MODE_PRIVATE)

        val blockApp = prefs.getBoolean("feature_${appName}_blockApp", false)
        if (blockApp) return "app"

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

        if (
            !blockShorts &&
            !blockReels &&
            !blockStories &&
            !blockFeed &&
            !blockSearch &&
            !blockComments &&
            !blockExplore &&
            !blockSpotlight &&
            !blockChannels &&
            !blockStatus &&
            !blockVoom
        ) {
            return null
        }

        val screenText = collectScreenText(event).lowercase()

        return when (appName) {
            "YouTube" -> when {
                blockShorts && screenText.contains("shorts") -> "shorts"
                blockSearch && containsAny(screenText, listOf("search youtube", "search")) -> "search"
                blockComments && screenText.contains("comments") -> "comments"
                else -> null
            }

            "Facebook" -> when {
                blockReels && screenText.contains("reels") -> "reels"
                blockStories && screenText.contains("stories") -> "stories"
                blockFeed && containsAny(screenText, listOf("news feed", "feed")) -> "feed"
                else -> null
            }

            "Instagram" -> when {
                blockReels && screenText.contains("reels") -> "reels"
                blockStories && screenText.contains("story") -> "stories"
                blockExplore && containsAny(screenText, listOf("explore", "search")) -> "explore"
                else -> null
            }

            "TikTok" -> when {
                blockReels && containsAny(screenText, listOf("for you", "following")) -> "reels"
                blockSearch && screenText.contains("search") -> "search"
                blockComments && screenText.contains("comments") -> "comments"
                else -> null
            }

            "Snapchat" -> when {
                blockSpotlight && screenText.contains("spotlight") -> "spotlight"
                blockStories && screenText.contains("stories") -> "stories"
                else -> null
            }

            "Telegram" -> if (blockChannels && screenText.contains("channel")) "channels" else null

            "Line" -> if (blockVoom && screenText.contains("voom")) "voom" else null

            "Messenger" -> if (blockStories && screenText.contains("stories")) "stories" else null

            "WhatsApp" -> when {
                blockStatus && screenText.contains("status") -> "status"
                blockChannels && screenText.contains("channels") -> "channels"
                else -> null
            }

            "X" -> if (blockExplore && containsAny(screenText, listOf("explore", "search"))) "explore" else null

            else -> null
        }
    }

    private fun collectScreenText(event: AccessibilityEvent): String {
        val values = mutableListOf<String>()

        event.text?.forEach { value ->
            if (!value.isNullOrBlank()) values.add(value.toString())
        }

        event.contentDescription?.let { value ->
            if (value.isNotBlank()) values.add(value.toString())
        }

        rootInActiveWindow?.let { root ->
            collectNodeText(root, values, 0)
        }

        return values.joinToString(" ")
    }

    private fun collectNodeText(
        node: AccessibilityNodeInfo,
        values: MutableList<String>,
        depth: Int
    ) {
        if (depth > 8) return

        node.text?.let { value ->
            if (value.isNotBlank()) values.add(value.toString())
        }

        node.contentDescription?.let { value ->
            if (value.isNotBlank()) values.add(value.toString())
        }

        node.viewIdResourceName?.let { value ->
            if (value.isNotBlank()) values.add(value)
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

    private fun blockApp(appName: String, reason: String) {
        val key = "$appName:$reason"
        val now = SystemClock.elapsedRealtime()

        if (lastBlockedKey == key && now - lastBlockedAt < 1500L) {
            return
        }

        lastBlockedKey = key
        lastBlockedAt = now

        performGlobalAction(GLOBAL_ACTION_BACK)
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
}