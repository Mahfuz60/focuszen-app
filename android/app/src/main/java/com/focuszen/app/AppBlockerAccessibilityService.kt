package com.focuszen.app

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.util.Log

class AppBlockerAccessibilityService : AccessibilityService() {

    private val TAG = "AppBlockerService"

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        val packageName = event.packageName?.toString() ?: return
        if (packageName == "com.google.android.youtube") {
            blockShorts(event)
        }
    }

    override fun onInterrupt() {}

    private fun blockShorts(event: AccessibilityEvent) {
        val node = rootInActiveWindow ?: return

        try {
            // Fingerprint check: Search using contentDescription + className
            val shortsTabNode = findNodeByFingerprint(node, "Shorts", "android.widget.TextView")
                ?: findNodeByFingerprint(node, "Shorts", "android.view.ViewGroup")

            if (shortsTabNode != null) {
                shortsTabNode.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                Log.d(TAG, "Shorts tab clicked via fingerprint.")
                return
            }

            // Window-State check: Detect navigation to Shorts activities
            if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
                val className = event.className?.toString() ?: ""
                if (className.contains("ReelWatchActivity", ignoreCase = true) ||
                    className.contains("ShortsActivity", ignoreCase = true)) {
                    performGlobalAction(GLOBAL_ACTION_BACK)
                    Log.d(TAG, "Shorts blocked via Activity detection.")
                }
            }
        } finally {
            node.recycle()
        }
    }

    private fun findNodeByFingerprint(
        node: AccessibilityNodeInfo?,
        descContains: String,
        targetClassName: String
    ): AccessibilityNodeInfo? {
        if (node == null) return null

        val description = node.contentDescription?.toString() ?: ""
        val className = node.className?.toString() ?: ""

        if (description.contains(descContains, ignoreCase = true) && className == targetClassName) {
            return node
        }

        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            val found = findNodeByFingerprint(child, descContains, targetClassName)
            if (found != null) {
                return found
            }
        }
        return null
    }
}
