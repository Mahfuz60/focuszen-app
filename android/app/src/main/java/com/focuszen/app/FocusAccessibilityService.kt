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
    private val BLOCK_COOLDOWN_MS = 1200L // prevent rapid back-loop

    // ─── Event Handler ───────────────────────────────────────────────────────

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        val packageName = event.packageName?.toString() ?: return

        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            lastActivityClass = event.className?.toString() ?: ""
        }

        // Ignore our own app
        if (packageName == "com.focuszen.app") return

        val prefs = getSharedPreferences("FocusZenSettings", Context.MODE_PRIVATE)
        val strictMode = prefs.getBoolean("strict_mode", false)
        val focusActive = prefs.getBoolean("focus_active", false)
        val focusDeepWork = prefs.getBoolean("focus_deep_work", false)

        // ── Strict / Deep Work: full block of distracting apps ───────────────
        if ((strictMode || (focusActive && focusDeepWork)) && isDistractingApp(packageName)) {
            triggerBlockAction("Blocked by FocusZen", isFullBlock = true)
            return
        }

        // ── Per-app feature blocking ─────────────────────────────────────────
        val rootNode = rootInActiveWindow ?: return

        when (packageName) {
            "com.google.android.youtube"                          -> handleYouTube(rootNode)
            "com.facebook.katana"                                 -> handleFacebook(rootNode)
            "com.instagram.android"                               -> handleInstagram(rootNode)
            "com.zhiliaoapp.musically", "com.ss.android.ugc.trill" -> handleTikTok(rootNode)
            "com.snapchat.android"                                -> handleSnapchat(rootNode)
            "com.whatsapp"                                        -> handleWhatsApp(rootNode)
            "com.twitter.android", "com.x.android"               -> handleX(rootNode)
            "org.telegram.messenger"                              -> handleTelegram(rootNode)
            "com.facebook.mlite"                                  -> handleMessenger(rootNode)
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

    private fun handleYouTube(node: AccessibilityNodeInfo) {
        if (isFeatureEnabled("YouTube", "blockApp")) {
            triggerBlockAction("YouTube is blocked", true); return
        }

        // Block Shorts — check view ID, content description, activity class, text
        if (isFeatureEnabled("YouTube", "blockShorts")) {
            val inShorts = lastActivityClass.contains("shorts", ignoreCase = true)
                || hasNodeById(node, "com.google.android.youtube:id/shorts_player_container")
                || hasNodeById(node, "com.google.android.youtube:id/reel_player_page_container")
                || hasNodeByContentDesc(node, "Shorts")
                || hasNodeById(node, "com.google.android.youtube:id/shorts_container")
            if (inShorts) { triggerBlockAction("YouTube Shorts blocked"); return }
        }

        // Block Search
        if (isFeatureEnabled("YouTube", "blockSearch")) {
            val inSearch = lastActivityClass.contains("search", ignoreCase = true)
                || hasNodeById(node, "com.google.android.youtube:id/search_edit_text")
                || hasNodeById(node, "com.google.android.youtube:id/toolbar_search_button")
                    .let { _ ->
                        hasNodeById(node, "com.google.android.youtube:id/search_box_text") ||
                        hasNodeById(node, "com.google.android.youtube:id/search_edit_text")
                    }
            if (inSearch) { triggerBlockAction("YouTube Search blocked"); return }
        }

        // Block Comments
        if (isFeatureEnabled("YouTube", "blockComments")) {
            val inComments = hasNodeById(node, "com.google.android.youtube:id/comments_entry_point_header_root")
                || hasNodeById(node, "com.google.android.youtube:id/comment_text")
                || hasNodeByContentDesc(node, "Comments")
                || (hasNodeById(node, "com.google.android.youtube:id/comments_panel") &&
                    hasNodeById(node, "com.google.android.youtube:id/add_a_comment_button"))
            if (inComments) { triggerBlockAction("YouTube Comments blocked"); return }
        }
    }

    private fun handleFacebook(node: AccessibilityNodeInfo) {
        if (isFeatureEnabled("Facebook", "blockApp")) {
            triggerBlockAction("Facebook is blocked", true); return
        }

        // Block Reels — must be in a Reels-specific context
        if (isFeatureEnabled("Facebook", "blockReels")) {
            val inReels = lastActivityClass.contains("reel", ignoreCase = true)
                || hasNodeById(node, "com.facebook.katana:id/reels_video_container")
                || hasNodeById(node, "com.facebook.katana:id/reel_player_element_container")
                || hasNodeByContentDesc(node, "Reels")
                || (hasNodeByText(node, "Reels") && hasNodeById(node, "com.facebook.katana:id/video_player"))
            if (inReels) { triggerBlockAction("Facebook Reels blocked"); return }
        }

        // Block Stories
        if (isFeatureEnabled("Facebook", "blockStories")) {
            val inStories = lastActivityClass.contains("story", ignoreCase = true)
                || hasNodeById(node, "com.facebook.katana:id/stories_tray")
                || hasNodeById(node, "com.facebook.katana:id/story_viewer_container")
                || hasNodeByContentDesc(node, "Story")
                || (hasNodeByText(node, "Stories") && hasNodeById(node, "com.facebook.katana:id/media_viewer_root"))
            if (inStories) { triggerBlockAction("Facebook Stories blocked"); return }
        }

        // Block Feed — only trigger on actual feed scroll area, not just "Home" tab text
        if (isFeatureEnabled("Facebook", "blockFeed")) {
            val inFeed = hasNodeById(node, "com.facebook.katana:id/news_feed_recycler_view")
                || hasNodeById(node, "com.facebook.katana:id/feed_unit_root")
                || hasNodeById(node, "com.facebook.katana:id/timeline_list_view")
                || (lastActivityClass.contains("NewsFeed", ignoreCase = true))
            if (inFeed) { triggerBlockAction("Facebook Feed blocked"); return }
        }
    }

    private fun handleInstagram(node: AccessibilityNodeInfo) {
        if (isFeatureEnabled("Instagram", "blockApp")) {
            triggerBlockAction("Instagram is blocked", true); return
        }

        if (isFeatureEnabled("Instagram", "blockReels")) {
            val inReels = lastActivityClass.contains("reel", ignoreCase = true)
                || hasNodeById(node, "com.instagram.android:id/clips_player_container")
                || hasNodeById(node, "com.instagram.android:id/reels_tray_container")
                || hasNodeByContentDesc(node, "Reels")
            if (inReels) { triggerBlockAction("Instagram Reels blocked"); return }
        }

        if (isFeatureEnabled("Instagram", "blockStories")) {
            val inStories = lastActivityClass.contains("story", ignoreCase = true)
                || hasNodeById(node, "com.instagram.android:id/reel_viewer_root")
                || hasNodeById(node, "com.instagram.android:id/story_viewer_container")
                || hasNodeByContentDesc(node, "Story")
            if (inStories) { triggerBlockAction("Instagram Stories blocked"); return }
        }

        if (isFeatureEnabled("Instagram", "blockExplore")) {
            val inExplore = hasNodeById(node, "com.instagram.android:id/explore_fragment_container")
                || hasNodeByContentDesc(node, "Search and explore")
            if (inExplore) { triggerBlockAction("Instagram Explore blocked"); return }
        }
    }

    private fun handleTikTok(node: AccessibilityNodeInfo) {
        if (isFeatureEnabled("TikTok", "blockApp")) {
            triggerBlockAction("TikTok is blocked", true); return
        }

        if (isFeatureEnabled("TikTok", "blockReels")) {
            // TikTok IS essentially a reels feed — block main feed view
            val inFeed = hasNodeById(node, "com.zhiliaoapp.musically:id/feed")
                || hasNodeById(node, "com.ss.android.ugc.trill:id/feed")
                || hasNodeByContentDesc(node, "For You")
            if (inFeed) { triggerBlockAction("TikTok Feed blocked"); return }
        }

        if (isFeatureEnabled("TikTok", "blockSearch")) {
            val inSearch = hasNodeById(node, "com.zhiliaoapp.musically:id/search_input")
                || hasNodeByContentDesc(node, "Search")
                || lastActivityClass.contains("search", ignoreCase = true)
            if (inSearch) { triggerBlockAction("TikTok Search blocked"); return }
        }

        if (isFeatureEnabled("TikTok", "blockComments")) {
            val inComments = hasNodeByContentDesc(node, "Comments")
                || hasNodeById(node, "com.zhiliaoapp.musically:id/comment_input")
            if (inComments) { triggerBlockAction("TikTok Comments blocked"); return }
        }
    }

    private fun handleSnapchat(node: AccessibilityNodeInfo) {
        if (isFeatureEnabled("Snapchat", "blockApp")) {
            triggerBlockAction("Snapchat is blocked", true); return
        }

        if (isFeatureEnabled("Snapchat", "blockSpotlight")) {
            val inSpotlight = hasNodeByContentDesc(node, "Spotlight")
                || hasNodeById(node, "com.snapchat.android:id/spotlight_header")
                || lastActivityClass.contains("spotlight", ignoreCase = true)
            if (inSpotlight) { triggerBlockAction("Snapchat Spotlight blocked"); return }
        }

        if (isFeatureEnabled("Snapchat", "blockStories")) {
            val inStories = hasNodeByContentDesc(node, "Stories")
                || lastActivityClass.contains("story", ignoreCase = true)
            if (inStories) { triggerBlockAction("Snapchat Stories blocked"); return }
        }
    }

    private fun handleWhatsApp(node: AccessibilityNodeInfo) {
        if (isFeatureEnabled("WhatsApp", "blockApp")) {
            triggerBlockAction("WhatsApp is blocked", true); return
        }

        if (isFeatureEnabled("WhatsApp", "blockStatus")) {
            val inStatus = hasNodeByText(node, "Status") || hasNodeByText(node, "Updates")
                || hasNodeByContentDesc(node, "Status")
                || lastActivityClass.contains("status", ignoreCase = true)
            if (inStatus) { triggerBlockAction("WhatsApp Status blocked"); return }
        }

        if (isFeatureEnabled("WhatsApp", "blockChannels")) {
            val inChannels = hasNodeByText(node, "Channels")
                || hasNodeByContentDesc(node, "Channels")
                || lastActivityClass.contains("channel", ignoreCase = true)
            if (inChannels) { triggerBlockAction("WhatsApp Channels blocked"); return }
        }
    }

    private fun handleX(node: AccessibilityNodeInfo) {
        if (isFeatureEnabled("X", "blockApp")) {
            triggerBlockAction("X is blocked", true); return
        }

        if (isFeatureEnabled("X", "blockExplore")) {
            val inExplore = hasNodeByContentDesc(node, "Search and Explore")
                || hasNodeByContentDesc(node, "Explore")
                || lastActivityClass.contains("explore", ignoreCase = true)
            if (inExplore) { triggerBlockAction("X Explore blocked"); return }
        }
    }

    private fun handleTelegram(node: AccessibilityNodeInfo) {
        if (isFeatureEnabled("Telegram", "blockApp")) {
            triggerBlockAction("Telegram is blocked", true); return
        }

        if (isFeatureEnabled("Telegram", "blockChannels")) {
            val inChannels = lastActivityClass.contains("channel", ignoreCase = true)
                || hasNodeByContentDesc(node, "Channels")
            if (inChannels) { triggerBlockAction("Telegram Channels blocked"); return }
        }
    }

    private fun handleMessenger(node: AccessibilityNodeInfo) {
        if (isFeatureEnabled("Messenger", "blockApp")) {
            triggerBlockAction("Messenger is blocked", true); return
        }

        if (isFeatureEnabled("Messenger", "blockStories")) {
            val inStories = lastActivityClass.contains("story", ignoreCase = true)
                || hasNodeByContentDesc(node, "Stories")
            if (inStories) { triggerBlockAction("Messenger Stories blocked"); return }
        }
    }

    // ─── Browser URL Blocking ────────────────────────────────────────────────

    private fun handleBrowser(node: AccessibilityNodeInfo, packageName: String) {
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

    private fun extractBrowserUrl(node: AccessibilityNodeInfo, packageName: String): String? {
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
            "com.facebook.katana", "com.google.android.youtube",
            "com.instagram.android", "com.zhiliaoapp.musically",
            "com.ss.android.ugc.trill", "com.whatsapp",
            "com.twitter.android", "com.x.android",
            "com.snapchat.android", "org.telegram.messenger",
            "com.facebook.mlite"
        )
    }

    private fun isFeatureEnabled(appName: String, feature: String): Boolean {
        val prefs = getSharedPreferences("FocusZenSettings", Context.MODE_PRIVATE)
        return prefs.getBoolean("${appName}_${feature}", false)
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
            performGlobalAction(GLOBAL_ACTION_HOME)
        } else {
            performGlobalAction(GLOBAL_ACTION_BACK)
        }
    }

    private fun hasNodeByText(node: AccessibilityNodeInfo, text: String): Boolean {
        val results = node.findAccessibilityNodeInfosByText(text)
        return results != null && results.isNotEmpty()
    }

    private fun hasNodeById(node: AccessibilityNodeInfo, id: String): Boolean {
        val results = node.findAccessibilityNodeInfosByViewId(id)
        return results != null && results.isNotEmpty()
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
