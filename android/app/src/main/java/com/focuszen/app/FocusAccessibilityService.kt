package com.focuszen.app

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.os.Vibrator
import android.os.VibrationEffect
import android.os.Build
import android.util.Log
import android.widget.Toast
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class FocusAccessibilityService : AccessibilityService() {

    private val TAG = "FocusZenBlocker"
    private var lastActivityClass: String = ""

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        val packageName = event.packageName?.toString() ?: return
        
        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            lastActivityClass = event.className?.toString() ?: ""
        }

        val rootNode = rootInActiveWindow ?: return
        val prefs = getSharedPreferences("FocusZenSettings", Context.MODE_PRIVATE)
        val focusActive = prefs.getBoolean("focus_active", false)
        val focusDeepWork = prefs.getBoolean("focus_deep_work", false)

        val strictMode = prefs.getBoolean("strict_mode", false)

        // Strict Mode: Block all distracting apps entirely
        if (strictMode && isDistractingApp(packageName)) {
            val appName = getAppName(packageName)
            triggerBlockAction("Strict Mode: $appName", isFullBlock = true)
            return
        }

        // Prevent bypassing FocusZen by blocking the control screen while strict mode is on
        // (Assuming the package name is com.focuszen.app)
        if (strictMode && packageName == "com.focuszen.app" && lastActivityClass.contains("ControlScreen", ignoreCase = true)) {
            triggerBlockAction("Strict Mode: Settings locked", isFullBlock = false)
            return
        }

        if (focusActive && focusDeepWork && isDistractingApp(packageName)) {
            val appName = getAppName(packageName)
            triggerBlockAction("Deep Focus: $appName", isFullBlock = true)
            return
        }

        when (packageName) {
            "com.facebook.katana" -> handleFacebook(rootNode)
            "com.google.android.youtube" -> handleYouTube(rootNode)
            "com.instagram.android" -> handleInstagram(rootNode)
            "com.zhiliaoapp.musically", "com.ss.android.ugc.trill" -> handleTikTok(rootNode)
            "com.whatsapp" -> handleWhatsApp(rootNode)
            "com.twitter.android", "com.x.android" -> handleX(rootNode)
            "com.snapchat.android" -> handleSnapchat(rootNode)
            "com.android.chrome", "com.sec.android.app.sbrowser", "org.mozilla.firefox", "com.microsoft.emmx" -> handleBrowser(rootNode, packageName)
        }
    }

    private fun isDistractingApp(packageName: String): Boolean {
        return listOf(
            "com.facebook.katana", "com.google.android.youtube", "com.instagram.android",
            "com.zhiliaoapp.musically", "com.ss.android.ugc.trill", "com.whatsapp",
            "com.twitter.android", "com.x.android", "com.snapchat.android"
        ).contains(packageName)
    }

    private fun getAppName(packageName: String): String {
        return when (packageName) {
            "com.facebook.katana" -> "Facebook"
            "com.google.android.youtube" -> "YouTube"
            "com.instagram.android" -> "Instagram"
            "com.zhiliaoapp.musically", "com.ss.android.ugc.trill" -> "TikTok"
            "com.whatsapp" -> "WhatsApp"
            "com.twitter.android", "com.x.android" -> "X (Twitter)"
            "com.snapchat.android" -> "Snapchat"
            else -> "App"
        }
    }

    private fun isFeatureEnabled(appName: String, feature: String): Boolean {
        val prefs = getSharedPreferences("FocusZenSettings", Context.MODE_PRIVATE)
        return prefs.getBoolean("${appName}_${feature}", false) || prefs.getBoolean("strict_mode", false)
    }

    private fun triggerBlockAction(reason: String, isFullBlock: Boolean = false) {
        Log.d(TAG, "Triggering block: $reason")
        
        // Vibration feedback
        val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(200, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(200)
        }
        
        // Visual feedback
        Toast.makeText(applicationContext, "FocusZen: $reason blocked", Toast.LENGTH_SHORT).show()

        if (isFullBlock) {
            performGlobalAction(GLOBAL_ACTION_HOME)
        } else {
            performGlobalAction(GLOBAL_ACTION_BACK)
        }
    }

    private fun handleFacebook(node: AccessibilityNodeInfo) {
        if (isFeatureEnabled("Facebook", "blockApp")) { triggerBlockAction("Facebook", true); return }
        
        if (isFeatureEnabled("Facebook", "blockReels") && (lastActivityClass.contains("Reel", ignoreCase = true) || findNodeByText(node, "Reels") != null)) {
            triggerBlockAction("Reels")
        } else if (isFeatureEnabled("Facebook", "blockStories") && (lastActivityClass.contains("Story", ignoreCase = true) || findNodeByText(node, "Stories") != null)) {
            triggerBlockAction("Stories")
        } else if (isFeatureEnabled("Facebook", "blockFeed") && (findNodeByText(node, "News Feed") != null || findNodeByText(node, "Home") != null)) {
            triggerBlockAction("Feed")
        }
    }

    private fun handleYouTube(node: AccessibilityNodeInfo) {
        if (isFeatureEnabled("YouTube", "blockApp")) { triggerBlockAction("YouTube", true); return }

        if (isFeatureEnabled("YouTube", "blockShorts") && (lastActivityClass.contains("Shorts", ignoreCase = true) || 
            findNodeByText(node, "Shorts") != null ||
            findNodeById(node, "com.google.android.youtube:id/shorts_player_container") != null)) {
            triggerBlockAction("Shorts")
        } else if (isFeatureEnabled("YouTube", "blockSearch") && (lastActivityClass.contains("SearchActivity", ignoreCase = true) ||
            findNodeById(node, "com.google.android.youtube:id/search_edit_text") != null)) {
            triggerBlockAction("Search")
        }
    }

    private fun handleInstagram(node: AccessibilityNodeInfo) {
        if (isFeatureEnabled("Instagram", "blockApp")) { triggerBlockAction("Instagram", true); return }

        if (isFeatureEnabled("Instagram", "blockReels") && (lastActivityClass.contains("Reel", ignoreCase = true) || findNodeByText(node, "Reels") != null)) {
            triggerBlockAction("Reels")
        } else if (isFeatureEnabled("Instagram", "blockStories") && (lastActivityClass.contains("Story", ignoreCase = true) || findNodeByText(node, "Stories") != null)) {
            triggerBlockAction("Stories")
        }
    }

    private fun handleWhatsApp(node: AccessibilityNodeInfo) {
        if (isFeatureEnabled("WhatsApp", "blockApp")) { triggerBlockAction("WhatsApp", true); return }
        if (isFeatureEnabled("WhatsApp", "blockStatus") && (findNodeByText(node, "Status") != null || findNodeByText(node, "Updates") != null)) {
            triggerBlockAction("Status")
        }
    }

    private fun handleTikTok(node: AccessibilityNodeInfo) {
        if (isFeatureEnabled("TikTok", "blockApp")) { triggerBlockAction("TikTok", true); return }
    }

    private fun handleX(node: AccessibilityNodeInfo) {
        if (isFeatureEnabled("X", "blockApp")) { triggerBlockAction("X", true); return }
    }

    private fun handleSnapchat(node: AccessibilityNodeInfo) {
        if (isFeatureEnabled("Snapchat", "blockApp")) { triggerBlockAction("Snapchat", true); return }
    }

    private fun handleBrowser(node: AccessibilityNodeInfo, packageName: String) {
        val prefs = getSharedPreferences("FocusZenSettings", Context.MODE_PRIVATE)
        val adultBlock = prefs.getBoolean("adultContentBlock", false)
        val gamblingBlock = prefs.getBoolean("gamblingBlock", false)

        if (!adultBlock && !gamblingBlock) return

        val urlBarIds = listOf(
            "com.android.chrome:id/url_bar",
            "com.sec.android.app.sbrowser:id/location_bar_edit_text",
            "org.mozilla.firefox:id/url_bar_title",
            "com.microsoft.emmx:id/url_bar"
        )

        var urlText: String? = null
        for (id in urlBarIds) {
            val urlNode = findNodeById(node, id)
            if (urlNode != null) {
                urlText = urlNode.text?.toString()?.lowercase()
                break
            }
        }

        if (urlText == null) {
            // Fallback: search for nodes that look like a URL bar or contain common domain parts
            val possibleUrlNode = findNodeByTextPart(node, "http") ?: findNodeByTextPart(node, ".com")
            urlText = possibleUrlNode?.text?.toString()?.lowercase()
        }

        if (urlText != null) {
            if (adultBlock && isAdultSite(urlText)) {
                triggerBlockAction("Adult content restricted", isFullBlock = false)
            } else if (gamblingBlock && isGamblingSite(urlText)) {
                triggerBlockAction("Gambling restricted", isFullBlock = false)
            }
        }
    }

    private fun isAdultSite(url: String): Boolean {
        val keywords = listOf("porn", "xvideo", "redtube", "hub", "adult", "sex", "brazzers", "pussy", "dick")
        return keywords.any { url.contains(it) }
    }

    private fun isGamblingSite(url: String): Boolean {
        val keywords = listOf("bet", "casino", "gambling", "poker", "slot", "jackpot", "lottery", "stake", "1xbet")
        return keywords.any { url.contains(it) }
    }

    private fun findNodeByTextPart(node: AccessibilityNodeInfo?, textPart: String): AccessibilityNodeInfo? {
        if (node == null) return null
        if (node.text?.toString()?.contains(textPart, ignoreCase = true) == true) return node
        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            val found = findNodeByTextPart(child, textPart)
            if (found != null) return found
        }
        return null
    }

    private fun findNodeByText(node: AccessibilityNodeInfo?, text: String): AccessibilityNodeInfo? {
        if (node == null) return null
        val nodes = node.findAccessibilityNodeInfosByText(text)
        return if (nodes != null && nodes.isNotEmpty()) nodes[0] else null
    }

    private fun findNodeById(node: AccessibilityNodeInfo?, id: String): AccessibilityNodeInfo? {
        if (node == null) return null
        val nodes = node.findAccessibilityNodeInfosByViewId(id)
        return if (nodes != null && nodes.isNotEmpty()) nodes[0] else null
    }

    override fun onInterrupt() {}
}
