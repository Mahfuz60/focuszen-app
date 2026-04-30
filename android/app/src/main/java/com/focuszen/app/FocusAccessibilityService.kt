package com.focuszen.app

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class FocusAccessibilityService : AccessibilityService() {

    private var lastActivityClass: String = ""

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        val packageName = event.packageName?.toString() ?: return
        val rootNode = rootInActiveWindow ?: return

        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            lastActivityClass = event.className?.toString() ?: ""
        }

        when (packageName) {
            "com.facebook.katana" -> handleFacebook(rootNode)
            "com.google.android.youtube" -> handleYouTube(rootNode)
        }
    }

    private fun handleFacebook(node: AccessibilityNodeInfo) {
        val isReelsActivity = lastActivityClass.contains("Reel", ignoreCase = true)
        val isStoryActivity = lastActivityClass.contains("Story", ignoreCase = true)
        
        val hasReelsText = findNodeByTextOrContent(node, "Reels")
        val remixNode = findNode(node, "Remix")
        val isRemixClickable = remixNode != null && remixNode.isClickable
        
        if (isReelsActivity || isStoryActivity || (hasReelsText && isRemixClickable)) {
            performGlobalAction(GLOBAL_ACTION_BACK)
        }
    }

    private fun handleYouTube(node: AccessibilityNodeInfo) {
        val shortsNode = findNode(node, "Shorts")
        val remixNode = findNode(node, "Remix")
        
        if (shortsNode != null && remixNode != null && remixNode.isClickable) {
            performGlobalAction(GLOBAL_ACTION_BACK)
        }
    }

    private fun findNode(node: AccessibilityNodeInfo?, text: String): AccessibilityNodeInfo? {
        if (node == null) return null
        
        val nodeText = node.text?.toString() ?: ""
        val contentDesc = node.contentDescription?.toString() ?: ""
        
        if (nodeText.contains(text, ignoreCase = true) || contentDesc.contains(text, ignoreCase = true)) {
            return node
        }

        for (i in 0 until node.childCount) {
            val found = findNode(node.getChild(i), text)
            if (found != null) return found
        }
        return null
    }

    private fun findNodeByTextOrContent(node: AccessibilityNodeInfo?, text: String): Boolean {
        return findNode(node, text) != null
    }

    override fun onInterrupt() {}
}
