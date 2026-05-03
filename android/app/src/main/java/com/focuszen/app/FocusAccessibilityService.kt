package com.focuszen.app

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.os.Vibrator
import android.os.VibrationEffect
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

        if (focusActive && focusDeepWork && isDistractingApp(packageName)) {
            triggerBlockAction("Deep Focus: $packageName", isFullBlock = true)
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
        }
    }

    private fun isDistractingApp(packageName: String): Boolean {
        return listOf(
            "com.facebook.katana", "com.google.android.youtube", "com.instagram.android",
            "com.zhiliaoapp.musically", "com.ss.android.ugc.trill", "com.whatsapp",
            "com.twitter.android", "com.x.android", "com.snapchat.android"
        ).contains(packageName)
    }

    private fun isFeatureEnabled(appName: String, feature: String): Boolean {
        val prefs = getSharedPreferences("FocusZenSettings", Context.MODE_PRIVATE)
        return prefs.getBoolean("${appName}_${feature}", false) || prefs.getBoolean("strict_mode", false)
    }

    private fun triggerBlockAction(reason: String, isFullBlock: Boolean = false) {
        Log.d(TAG, "Triggering block: $reason")
        
        // Vibration feedback
        val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        vibrator.vibrate(VibrationEffect.createOneShot(200, VibrationEffect.DEFAULT_AMPLITUDE))
        
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
