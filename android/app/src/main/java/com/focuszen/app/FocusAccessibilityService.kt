package com.focuszen.app

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.Toast

class FocusAccessibilityService : AccessibilityService() {

    private val TAG = "FocusZenBlocker"
    private var lastActivityClass: String = ""
    private var lastBlockedAt: Long = 0L
    private var lastTreeScanAt: Long = 0L
    private val BLOCK_COOLDOWN_MS = 1200L // prevent rapid back-loop
  private val SCAN_COOLDOWN_MS = 80L // throttle deep view hierarchy scans

    // ─── Event Handler ───────────────────────────────────────────────────────
    
    private val PACKAGE_MAP = mapOf(
        "com.google.android.youtube" to "YouTube",
        "com.instagram.android" to "Instagram",
        "com.facebook.katana" to "Facebook",
        "com.snapchat.android" to "Snapchat",
        "com.zhiliaoapp.musically" to "TikTok",
        "com.ss.android.ugc.trill" to "TikTok",
        "org.telegram.messenger" to "Telegram",
        "jp.naver.line.android" to "Line",
        "com.facebook.orca" to "Messenger",
        "com.facebook.mlite" to "Messenger",
        "com.whatsapp" to "WhatsApp",
        "com.twitter.android" to "X",
        "com.x.android" to "X"
    )

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        if (
        event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED &&
        event.eventType != AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED &&
        event.eventType != AccessibilityEvent.TYPE_VIEW_SCROLLED &&
        event.eventType != AccessibilityEvent.TYPE_VIEW_CLICKED &&
        event.eventType != AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED &&
        event.eventType != AccessibilityEvent.TYPE_VIEW_FOCUSED
    ) return

    val packageName = event.packageName?.toString() ?: return

       if (
        event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED ||
        event.eventType == AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED ||
        event.eventType == AccessibilityEvent.TYPE_VIEW_SCROLLED
        ) {
        lastActivityClass = event.className?.toString() ?: lastActivityClass
        }

        // Ignore our own app
        if (packageName == "com.focuszen.app") return

        val prefs = getSharedPreferences("FocusZenSettings", Context.MODE_PRIVATE)

        // ── Check Generic Full App Block ─────────────────────────────────────
        val appName = PACKAGE_MAP[packageName]
        if (appName != null) {
            if (isFeatureEnabled(appName, "blockApp")) {
                triggerBlockAction("$appName is blocked", isFullBlock = true)
                return
            }
        }

        // Throttle deep tree scanning to prevent ANR and silent service unbinding
        val now = System.currentTimeMillis()
        if (now - lastTreeScanAt < SCAN_COOLDOWN_MS) return
        lastTreeScanAt = now

        // ── Per-app feature blocking ─────────────────────────────────────────
        val rootNode = rootInActiveWindow ?: event.source ?: return

        when (packageName) {
            "com.google.android.youtube"                          -> handleYouTube(rootNode)
            "com.facebook.katana"                                 -> handleFacebook(rootNode)
            "com.instagram.android"                               -> handleInstagram(rootNode)
            "com.zhiliaoapp.musically", "com.ss.android.ugc.trill" -> handleTikTok(rootNode)
            "com.snapchat.android"                                -> handleSnapchat(rootNode)
            "com.whatsapp"                                        -> handleWhatsApp(rootNode)
            "com.twitter.android", "com.x.android"               -> handleX(rootNode)
            "org.telegram.messenger"                              -> handleTelegram(rootNode)
            "com.facebook.orca", "com.facebook.mlite"            -> handleMessenger(rootNode)
            "jp.naver.line.android"                              -> handleLine(rootNode)
            // Browsers
            "com.android.chrome",
            "com.sec.android.app.sbrowser",
            "org.mozilla.firefox",
            "com.microsoft.emmx",
            "com.opera.browser",
            "com.brave.browser",
            "com.duckduckgo.mobile.android"                       -> handleBrowser(rootNode, packageName)
        }
    }

    // ─── App Handlers ─────────────────────────────────────────────────────────


    private fun handleYouTube(node: AccessibilityNodeInfo?) {
        if (isFeatureEnabled("YouTube", "blockApp")) {
            triggerBlockAction("YouTube is blocked", true); return
        }

        // Block Shorts — check highly specific accessibility content descriptions inside the player
        if (isFeatureEnabled("YouTube", "blockShorts")) {
            val inShorts = lastActivityClass.contains("ReelWatch", ignoreCase = true)
                || lastActivityClass.contains("Shorts", ignoreCase = true)
                || hasNodeByContentDesc(node, "Like this Short")
                || hasNodeByContentDesc(node, "Dislike this Short")
                || hasNodeByContentDesc(node, "Remix this Short")
                || hasNodeWithIdLike(node, "shorts_player_container")
                || hasNodeWithIdLike(node, "reel_player_page_container")
            if (inShorts) { triggerBlockAction("YouTube Shorts blocked"); return }
        }

        // Block Search
        if (isFeatureEnabled("YouTube", "blockSearch")) {
            val inSearch = lastActivityClass.contains("search", ignoreCase = true)
                || hasNodeWithIdLike(node, "search_edit_text")
                || hasNodeWithIdLike(node, "search_box_text")
                || hasNodeByText(node, "Search YouTube")
            if (inSearch) { triggerBlockAction("YouTube Search blocked"); return }
        }

        // Block Comments
        if (isFeatureEnabled("YouTube", "blockComments")) {
            val inComments = lastActivityClass.contains("comment", ignoreCase = true)
                || hasNodeWithIdLike(node, "comments_entry_point_header_root")
                || hasNodeWithIdLike(node, "comment_text")
                || (hasNodeWithIdLike(node, "comments_panel") && hasNodeWithIdLike(node, "add_a_comment_button"))
                || hasNodeByText(node, "Add a comment")
            if (inComments) { triggerBlockAction("YouTube Comments blocked"); return }
        }
    }

    private fun handleFacebook(node: AccessibilityNodeInfo?) {
        if (isFeatureEnabled("Facebook", "blockApp")) {
            triggerBlockAction("Facebook is blocked", true); return
        }

        // Block Reels — must be in a Reels-specific context
        if (isFeatureEnabled("Facebook", "blockReels")) {
            val inReels = lastActivityClass.contains("Reel", ignoreCase = true)
                || lastActivityClass.contains("Shorts", ignoreCase = true)
                || hasNodeByContentDesc(node, "Like this reel")
                || hasNodeByContentDesc(node, "Comment on this reel")
                || hasNodeByContentDesc(node, "Share this reel")
                || hasNodeWithIdLike(node, "reels_video_container")
                || hasNodeWithIdLike(node, "reel_player_element_container")
            if (inReels) { triggerBlockAction("Facebook Reels blocked"); return }
        }

        // Block Stories
        if (isFeatureEnabled("Facebook", "blockStories")) {
            val inStories = lastActivityClass.contains("story", ignoreCase = true)
                || hasNodeWithIdLike(node, "stories_tray")
                || hasNodeWithIdLike(node, "story_viewer_container")
            if (inStories) { triggerBlockAction("Facebook Stories blocked"); return }
        }

        // Block Feed — only trigger on actual feed scroll area, not just "Home" tab text
        if (isFeatureEnabled("Facebook", "blockFeed")) {
            val inFeed = hasNodeWithIdLike(node, "news_feed_recycler_view")
                || hasNodeWithIdLike(node, "feed_unit_root")
                || hasNodeWithIdLike(node, "timeline_list_view")
                || (lastActivityClass.contains("NewsFeed", ignoreCase = true))
            if (inFeed) { triggerBlockAction("Facebook Feed blocked"); return }
        }
    }

    private fun handleInstagram(node: AccessibilityNodeInfo?) {
        if (isFeatureEnabled("Instagram", "blockApp")) {
            triggerBlockAction("Instagram is blocked", true); return
        }

        if (isFeatureEnabled("Instagram", "blockReels")) {
            val inReels = lastActivityClass.contains("Reel", ignoreCase = true)
                || lastActivityClass.contains("Clip", ignoreCase = true)
                || hasNodeByContentDesc(node, "Like this reel")
                || hasNodeByContentDesc(node, "Comment on this reel")
                || hasNodeByContentDesc(node, "Share this reel")
                || hasNodeWithIdLike(node, "clips_player_container")
                || hasNodeWithIdLike(node, "reels_tray_container")
            if (inReels) { triggerBlockAction("Instagram Reels blocked"); return }
        }

        if (isFeatureEnabled("Instagram", "blockStories")) {
            val inStories = lastActivityClass.contains("story", ignoreCase = true)
                || hasNodeWithIdLike(node, "reel_viewer_root")
                || hasNodeWithIdLike(node, "story_viewer_container")
            if (inStories) { triggerBlockAction("Instagram Stories blocked"); return }
        }

        if (isFeatureEnabled("Instagram", "blockExplore")) {
            val inExplore = lastActivityClass.contains("explore", ignoreCase = true)
                || hasNodeWithIdLike(node, "explore_fragment_container")
                || hasNodeByText(node, "Search")
            if (inExplore) { triggerBlockAction("Instagram Explore blocked"); return }
        }
    }

    private fun handleTikTok(node: AccessibilityNodeInfo?) {
        if (isFeatureEnabled("TikTok", "blockApp")) {
            triggerBlockAction("TikTok is blocked", true); return
        }

        if (isFeatureEnabled("TikTok", "blockReels")) {
            // TikTok IS essentially a reels feed — block main feed view
            val inFeed = hasNodeWithIdLike(node, "id/feed") || hasNodeWithIdLike(node, "vertical_view_pager")
            if (inFeed) { triggerBlockAction("TikTok Feed blocked"); return }
        }

        if (isFeatureEnabled("TikTok", "blockSearch")) {
            val inSearch = hasNodeWithIdLike(node, "search_input")
                || lastActivityClass.contains("search", ignoreCase = true)
            if (inSearch) { triggerBlockAction("TikTok Search blocked"); return }
        }

        if (isFeatureEnabled("TikTok", "blockComments")) {
            val inComments = lastActivityClass.contains("comment", ignoreCase = true)
                || hasNodeWithIdLike(node, "comment_input")
                || hasNodeByText(node, "Add comment")
            if (inComments) { triggerBlockAction("TikTok Comments blocked"); return }
        }
    }

    private fun handleSnapchat(node: AccessibilityNodeInfo?) {
        if (isFeatureEnabled("Snapchat", "blockApp")) {
            triggerBlockAction("Snapchat is blocked", true); return
        }

        if (isFeatureEnabled("Snapchat", "blockSpotlight")) {
            val inSpotlight = hasNodeWithIdLike(node, "spotlight_header")
                || lastActivityClass.contains("spotlight", ignoreCase = true)
            if (inSpotlight) { triggerBlockAction("Snapchat Spotlight blocked"); return }
        }

        if (isFeatureEnabled("Snapchat", "blockStories")) {
            val inStories = lastActivityClass.contains("story", ignoreCase = true)
            if (inStories) { triggerBlockAction("Snapchat Stories blocked"); return }
        }
    }

    private fun handleWhatsApp(node: AccessibilityNodeInfo?) {
        if (isFeatureEnabled("WhatsApp", "blockApp")) {
            triggerBlockAction("WhatsApp is blocked", true); return
        }

        if (isFeatureEnabled("WhatsApp", "blockStatus")) {
            val inStatus = lastActivityClass.contains("status", ignoreCase = true)
            if (inStatus) { triggerBlockAction("WhatsApp Status blocked"); return }
        }

        if (isFeatureEnabled("WhatsApp", "blockChannels")) {
            val inChannels = lastActivityClass.contains("channel", ignoreCase = true)
            if (inChannels) { triggerBlockAction("WhatsApp Channels blocked"); return }
        }
    }

    private fun handleX(node: AccessibilityNodeInfo?) {
        if (isFeatureEnabled("X", "blockApp")) {
            triggerBlockAction("X is blocked", true); return
        }

        if (isFeatureEnabled("X", "blockExplore")) {
            val inExplore = lastActivityClass.contains("explore", ignoreCase = true)
            if (inExplore) { triggerBlockAction("X Explore blocked"); return }
        }
    }

    private fun handleTelegram(node: AccessibilityNodeInfo?) {
        if (isFeatureEnabled("Telegram", "blockApp")) {
            triggerBlockAction("Telegram is blocked", true); return
        }

        if (isFeatureEnabled("Telegram", "blockChannels")) {
            val inChannels = lastActivityClass.contains("channel", ignoreCase = true)
            if (inChannels) { triggerBlockAction("Telegram Channels blocked"); return }
        }
    }

    private fun handleMessenger(node: AccessibilityNodeInfo?) {
        if (isFeatureEnabled("Messenger", "blockApp")) {
            triggerBlockAction("Messenger is blocked", true); return
        }

        if (isFeatureEnabled("Messenger", "blockStories")) {
            val inStories = lastActivityClass.contains("story", ignoreCase = true)
            if (inStories) { triggerBlockAction("Messenger Stories blocked"); return }
        }
    }

    private fun handleLine(node: AccessibilityNodeInfo?) {
        if (isFeatureEnabled("Line", "blockApp")) {
            triggerBlockAction("Line is blocked", true); return
        }

        if (isFeatureEnabled("Line", "blockVoom")) {
            val inVoom = lastActivityClass.contains("voom", ignoreCase = true)
            if (inVoom) { triggerBlockAction("Line VOOM blocked"); return }
        }
    }

    // ─── Browser URL Blocking ────────────────────────────────────────────────

    private fun handleBrowser(node: AccessibilityNodeInfo?, packageName: String) {
        val prefs = getSharedPreferences("FocusZenSettings", Context.MODE_PRIVATE)
        val adultBlock = prefs.getBoolean("adultContentBlock", false)
        val gamblingBlock = prefs.getBoolean("gamblingBlock", false)
        val customDomains = prefs.getString("custom_blocked_domains", "")
            ?.split(",")?.map { it.trim() }?.filter { it.isNotEmpty() } ?: emptyList()

        if (!adultBlock && !gamblingBlock && customDomains.isEmpty()) return

        val urlText = extractBrowserUrl(node, packageName) ?: return

        when {
            adultBlock && isAdultSite(urlText) ->
                triggerBlockAction("Adult content blocked", isFullBlock = false)
            gamblingBlock && isGamblingSite(urlText) ->
                triggerBlockAction("Gambling site blocked", isFullBlock = false)
            customDomains.isNotEmpty() && isCustomBlocked(urlText, customDomains) ->
                triggerBlockAction("Site blocked by FocusZen", isFullBlock = false)
        }
    }

    private fun extractBrowserUrl(node: AccessibilityNodeInfo?, packageName: String): String? {
        // Known URL bar view IDs per browser
        val knownIds = when (packageName) {
            "com.android.chrome" -> listOf(
                "com.android.chrome:id/url_bar",
                "com.android.chrome:id/location_bar_edit_text"
            )
            "com.sec.android.app.sbrowser" -> listOf(
                "com.sec.android.app.sbrowser:id/location_bar_edit_text",
                "com.sec.android.app.sbrowser:id/sb_text_inputurl"
            )
            "org.mozilla.firefox" -> listOf(
                "org.mozilla.firefox:id/url_bar_title",
                "org.mozilla.firefox:id/mozac_browser_toolbar_url_view",
                "org.mozilla.firefox:id/toolbar_edit_text"
            )
            "com.microsoft.emmx" -> listOf(
                "com.microsoft.emmx:id/url_bar",
                "com.microsoft.emmx:id/address_bar_text_view"
            )
            "com.brave.browser" -> listOf("com.brave.browser:id/url_bar")
            "com.opera.browser" -> listOf("com.opera.browser:id/url_field")
            "com.duckduckgo.mobile.android" -> listOf("com.duckduckgo.mobile.android:id/omnibarTextInput")
            else -> emptyList()
        }

        for (id in knownIds) {
            val urlNode = findNodeById(node, id)
            if (urlNode?.text != null) return urlNode.text.toString().lowercase()
        }

        // Fallback: full tree traversal for any node whose text looks like a URL
        return extractUrlFromTree(node)
    }

    private fun extractUrlFromTree(node: AccessibilityNodeInfo?): String? {
        if (node == null) return null
        val text = node.text?.toString() ?: ""
        if (looksLikeUrl(text)) return text.lowercase()
        for (i in 0 until node.childCount) {
            val result = extractUrlFromTree(node.getChild(i))
            if (result != null) return result
        }
        return null
    }

    private fun looksLikeUrl(text: String): Boolean {
        if (text.length < 4) return false
        return text.contains("://") || text.contains(".com") || text.contains(".net") ||
               text.contains(".org") || text.contains(".io") || text.contains(".co") ||
               text.contains("www.")
    }

    // ─── Domain Block Lists ───────────────────────────────────────────────────

    private fun isAdultSite(url: String): Boolean {
        val domains = listOf(
            "pornhub", "xvideos", "xnxx", "xhamster", "redtube", "youporn",
            "tube8", "spankbang", "porntrex", "eporner", "fuq.com", "drtuber",
            "tnaflix", "fapster", "nudevista", "thumbzilla", "porn.com",
            "sex.com", "adult", "brazzers", "bangbros", "realitykings",
            "naughtyamerica", "mofos", "digitalplayground", "wicked",
            "18only", "18+", "onlyfans", "manyvids", "clips4sale",
            "chaturbate", "myfreecams", "camsoda", "stripchat",
            "livejasmin", "bongacams", "camfuze", "jerkmate",
            "pussy", "cock", "cumshot", "hentai", "doujin",
            "fapnation", "nhentai", "rule34", "gelbooru",
            "literotica", "sexstories", "eroticanywhere",
            "porndude", "pornmaki", "xxx"
        )
        return domains.any { url.contains(it) }
    }

    private fun isGamblingSite(url: String): Boolean {
        val domains = listOf(
            // Sports betting
            "bet365", "betway", "1xbet", "1xslots", "22bet", "melbet",
            "mostbet", "betwinner", "linebet", "parimatch", "dafabet",
            "betfair", "betvictor", "william-hill", "williamhill",
            "ladbrokes", "coral.co", "paddy-power", "paddypower",
            "draftkings", "fanduel", "pointsbet", "betmgm",
            // Casino
            "casino", "casinodays", "jackpot", "jackpotcity", "slotocash",
            "spin.com", "poker", "pokerstars", "ggpoker", "partypoker",
            "888poker", "worldseries.com",
            "slot", "slots", "vegasslots", "spin247",
            "betsson", "unibet", "leo.com", "leovagas",
            "casumo", "lucky", "luckystar", "mrq.com",
            "draftkings", "roulette", "baccarat", "blackjack",
            // Lottery / other
            "lottery", "lotto", "powerball", "megamillions",
            "stake.com", "rollbit", "bc.game", "cloudbet",
            "bitstarz", "mbitcasino", "bspin", "betbtc",
            "gamble", "gambling", "sportsbet", "oddsportal",
            "oddschecker", "flashscore.bet", "sbobetcc",
            "sbobet", "ibcbet", "maxbet", "m88", "w88", "fun88"
        )
        return domains.any { url.contains(it) }
    }

    private fun isCustomBlocked(url: String, domains: List<String>): Boolean {
        return domains.any { url.contains(it.lowercase()) }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────


    private fun isDistractingApp(packageName: String): Boolean {
        return packageName in listOf(
            "com.facebook.katana", "com.facebook.orca", "com.facebook.mlite",
            "com.google.android.youtube", "com.instagram.android",
            "com.zhiliaoapp.musically", "com.ss.android.ugc.trill",
            "com.whatsapp", "com.twitter.android", "com.x.android",
            "com.snapchat.android", "org.telegram.messenger",
            "jp.naver.line.android"
        )
    }

    private fun isFeatureEnabled(appName: String, feature: String): Boolean {
        val prefs = getSharedPreferences("FocusZenSettings", Context.MODE_PRIVATE)
        val key = "${appName}_${feature}"
        val value = prefs.getBoolean(key, false)
        Log.d(TAG, "Feature check: $key=$value")
        return value
    }

    private fun triggerBlockAction(reason: String, isFullBlock: Boolean = false) {
        val now = System.currentTimeMillis()
        if (now - lastBlockedAt < BLOCK_COOLDOWN_MS) return // cooldown
        lastBlockedAt = now

        Log.d(TAG, "Block: $reason")

        val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        vibrator?.let {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                it.vibrate(VibrationEffect.createOneShot(150, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                it.vibrate(150)
            }
        }

        // Show toast on main thread
        Handler(Looper.getMainLooper()).post {
            Toast.makeText(applicationContext, "🛡 $reason", Toast.LENGTH_SHORT).show()
        }

        if (isFullBlock) {
            val success = performGlobalAction(GLOBAL_ACTION_HOME)
            if (!success) {
                // Fallback for strict OS environments (MIUI, ColorOS)
                try {
                    val homeIntent = android.content.Intent(android.content.Intent.ACTION_MAIN).apply {
                        addCategory(android.content.Intent.CATEGORY_HOME)
                        flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    startActivity(homeIntent)
                } catch (e: Exception) {}
            }
        } else {
            performGlobalAction(GLOBAL_ACTION_BACK)
        }
    }

    private fun hasNodeByText(node: AccessibilityNodeInfo?, text: String): Boolean {
        if (node == null) return false
        val results = node.findAccessibilityNodeInfosByText(text)
        return results != null && results.isNotEmpty()
    }

    private fun hasNodeById(node: AccessibilityNodeInfo?, id: String): Boolean {
        if (node == null) return false
        val results = node.findAccessibilityNodeInfosByViewId(id)
        return results != null && results.isNotEmpty()
    }

    private fun hasNodeWithIdLike(node: AccessibilityNodeInfo?, idContains: String): Boolean {
        if (node == null) return false
        val viewId = node.viewIdResourceName?.lowercase() ?: ""
        val shortId = if (viewId.contains(":id/")) viewId.substringAfter(":id/") else viewId
        if (shortId.contains(idContains.lowercase())) return true
        
        for (i in 0 until node.childCount) {
            if (hasNodeWithIdLike(node.getChild(i), idContains)) return true
        }
        return false
    }

    private fun hasNodeByContentDesc(node: AccessibilityNodeInfo?, desc: String): Boolean {
        if (node == null) return false
        if (node.contentDescription?.toString()?.contains(desc, ignoreCase = true) == true) return true
        for (i in 0 until node.childCount) {
            if (hasNodeByContentDesc(node.getChild(i), desc)) return true
        }
        return false
    }

    private fun findNodeById(node: AccessibilityNodeInfo?, id: String): AccessibilityNodeInfo? {
        if (node == null) return null
        val results = node.findAccessibilityNodeInfosByViewId(id)
        return if (results != null && results.isNotEmpty()) results[0] else null
    }

    override fun onInterrupt() {}
}
