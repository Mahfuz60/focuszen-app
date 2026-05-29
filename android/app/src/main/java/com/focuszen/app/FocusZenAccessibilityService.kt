package com.focuszen.app

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class FocusZenAccessibilityService : AccessibilityService() {
    private val handler = Handler(Looper.getMainLooper())

    private var lastBlockedKey: String? = null
    private var lastBlockedAt: Long = 0L
    private var lastSeenPackage: String? = null

    private val pollRunnable = object : Runnable {
        override fun run() {
            try {
                inspectCurrentScreen("poll", null)
            } catch (error: Exception) {
                Log.e(TAG, "poll failed", error)
            } finally {
                handler.postDelayed(this, POLL_DELAY_MS)
            }
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d(TAG, "Accessibility service connected")

        handler.removeCallbacks(pollRunnable)
        handler.post(pollRunnable)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        event ?: return

        try {
            inspectCurrentScreen("event:${event.eventType}", event)
        } catch (error: Exception) {
            Log.e(TAG, "event failed", error)
        }
    }

    override fun onInterrupt() = Unit

    override fun onDestroy() {
        handler.removeCallbacks(pollRunnable)
        super.onDestroy()
    }

    private fun inspectCurrentScreen(source: String, event: AccessibilityEvent?) {
        val root = rootInActiveWindow

        val packageName =
            event?.packageName?.toString()
                ?: root?.packageName?.toString()
                ?: lastSeenPackage
                ?: return

        lastSeenPackage = packageName

        if (packageName == applicationContext.packageName) return
        if (SYSTEM_PACKAGES.contains(packageName)) return

        val prefs = getSharedPreferences("FocusZenPrefs", Context.MODE_PRIVATE)
        val blockedPackages = prefs.getStringSet("blockedPackages", emptySet()) ?: emptySet()
        val focusActive = prefs.getBoolean("focusSessionActive", false)
        val focusBlockedPackages =
            prefs.getStringSet("focusBlockedPackages", emptySet()) ?: emptySet()

        Log.d(
            TAG,
            "source=$source package=$packageName blockedPackages=$blockedPackages focusActive=$focusActive focusBlockedPackages=$focusBlockedPackages"
        )

        if (blockedPackages.contains(packageName)) {
            blockPackage(packageName, "full_app")
            return
        }

        if (focusActive && focusBlockedPackages.contains(packageName)) {
            blockPackage(packageName, "focus_mode")
            return
        }

        val appName = AppPackageMap.appNameFor(packageName) ?: return
        val screenText = collectScreenText(event, root).lowercase()

        Log.d(TAG, "app=$appName text=$screenText")

        val reason = getFeatureBlockReason(appName, prefs, screenText)

        if (reason != null) {
            blockPackage(packageName, reason)
        }
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
                blockShorts && containsAny(
                    screenText,
                    listOf(
                        "shorts",
                        "youtube shorts",
                        "shorts_video",
                        "shorts player",
                        "reel_watch_sequence",
                        "shorts_shelf",
                        "com.google.android.youtube:id/reel",
                        "com.google.android.youtube:id/shorts"
                    )
                ) -> "shorts"

                blockSearch && containsAny(
                    screenText,
                    listOf(
                        "search youtube",
                        "search",
                        "com.google.android.youtube:id/search"
                    )
                ) -> "search"

                blockComments && containsAny(
                    screenText,
                    listOf(
                        "comments",
                        "comment",
                        "add a comment"
                    )
                ) -> "comments"

                else -> null
            }

            "Facebook" -> when {
                blockReels && containsAny(
                    screenText,
                    listOf(
                        "reels",
                        "reel",
                        "watch reels",
                        "fb reels",
                        "fb_shorts",
                        "facebook reels"
                    )
                ) -> "reels"

                blockStories && containsAny(
                    screenText,
                    listOf(
                        "stories",
                        "story",
                        "create story"
                    )
                ) -> "stories"

                blockFeed && containsAny(
                    screenText,
                    listOf(
                        "feed",
                        "news feed",
                        "what's on your mind"
                    )
                ) -> "feed"

                else -> null
            }

            "Instagram" -> when {
                blockReels && containsAny(
                    screenText,
                    listOf(
                        "reels",
                        "reel",
                        "clips",
                        "instagram reels"
                    )
                ) -> "reels"

                blockStories && containsAny(
                    screenText,
                    listOf(
                        "stories",
                        "story",
                        "your story"
                    )
                ) -> "stories"

                blockExplore && containsAny(
                    screenText,
                    listOf(
                        "explore",
                        "search",
                        "com.instagram.android:id/search"
                    )
                ) -> "explore"

                else -> null
            }

            "TikTok" -> when {
                blockReels && containsAny(
                    screenText,
                    listOf(
                        "for you",
                        "following",
                        "tiktok",
                        "feed"
                    )
                ) -> "feed"

                blockSearch && screenText.contains("search") -> "search"

                blockComments && containsAny(
                    screenText,
                    listOf(
                        "comments",
                        "comment"
                    )
                ) -> "comments"

                else -> null
            }

            "X" -> when {
                blockExplore && containsAny(
                    screenText,
                    listOf(
                        "explore",
                        "search",
                        "trending"
                    )
                ) -> "explore"

                blockFeed && containsAny(
                    screenText,
                    listOf(
                        "home",
                        "timeline",
                        "for you",
                        "following"
                    )
                ) -> "feed"

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

            else -> null
        }
    }

    private fun blockPackage(packageName: String, reason: String) {
        val now = SystemClock.elapsedRealtime()
        val key = "$packageName:$reason"

        if (lastBlockedKey == key && now - lastBlockedAt < BLOCK_COOLDOWN_MS) {
            return
        }

        lastBlockedKey = key
        lastBlockedAt = now

        Log.d(TAG, "BLOCK package=$packageName reason=$reason")

        performGlobalAction(GLOBAL_ACTION_BACK)
        performGlobalAction(GLOBAL_ACTION_HOME)

        val appName = AppPackageMap.appNameFor(packageName) ?: packageName
        openBlockScreen(appName, reason)
    }

    private fun openBlockScreen(appName: String, reason: String) {
    val uri = Uri.parse(
        "focuszen://blocked/${Uri.encode(appName)}?reason=${Uri.encode(reason)}"
    )

    val intent = Intent(Intent.ACTION_VIEW, uri)
    intent.setPackage(applicationContext.packageName)
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
    intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)

    try {
        startActivity(intent)
    } catch (error: Exception) {
        Log.e(TAG, "failed to open deep link block screen", error)

        val launchIntent =
            packageManager.getLaunchIntentForPackage(applicationContext.packageName)

        if (launchIntent != null) {
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            startActivity(launchIntent)
        }
    }
}
    private fun collectScreenText(
        event: AccessibilityEvent?,
        root: AccessibilityNodeInfo?
    ): String {
        val values = mutableListOf<String>()

        event?.text?.forEach { value ->
            if (!value.isNullOrBlank()) {
                values.add(value.toString())
            }
        }

        event?.contentDescription?.let { value ->
            if (value.isNotBlank()) {
                values.add(value.toString())
            }
        }

        root?.let {
            collectNodeText(it, values, 0)
        }

        return values.joinToString(" ")
    }

    private fun collectNodeText(
        node: AccessibilityNodeInfo,
        values: MutableList<String>,
        depth: Int
    ) {
        if (depth > MAX_TREE_DEPTH) return

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

    companion object {
        private const val TAG = "FocusZenBlocker"
        private const val POLL_DELAY_MS = 700L
        private const val BLOCK_COOLDOWN_MS = 1200L
        private const val MAX_TREE_DEPTH = 10

        private val SYSTEM_PACKAGES = setOf(
            "com.android.systemui",
            "com.miui.home",
            "com.android.launcher",
            "com.google.android.apps.nexuslauncher",
            "com.mi.android.globallauncher",
            "com.android.settings"
        )
    }
}