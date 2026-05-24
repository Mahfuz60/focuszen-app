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
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.view.Gravity
import android.view.KeyEvent
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.TextView
import android.widget.LinearLayout
import android.app.PendingIntent
import android.content.Intent
import android.net.Uri

class FocusAccessibilityService : AccessibilityService() {

    private val TAG = "FocusZenBlocker"
    private var lastActivityClass: String = ""
    private var lastBlockedAt: Long = 0L
    private var lastTreeScanAt: Long = 0L
    private val BLOCK_COOLDOWN_MS = 400L // Reduced for instant StayFree-style reaction
    private val SCAN_COOLDOWN_MS = 60L // Faster scanning for smoothness

    private var blackoutView: View? = null
    private var isBlackoutActive = false

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

    private var lastPackageName: String = ""

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

        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val className = event.className?.toString() ?: ""
            if (className.isNotEmpty() && !className.contains("widget.") && !className.contains("view.") && !className.endsWith("Layout") && !className.endsWith("View") && !className.endsWith("Button") && !className.endsWith("RecyclerView") && !className.endsWith("ViewGroup")) {
                lastActivityClass = className
                Log.d(TAG, "Active Activity changed: $lastActivityClass")
            }
        }

        // Ignore our own app
        if (packageName == "com.focuszen.app") return

        val prefs = getSafePrefs()

        // Bypass cooldown on package change
        val now = System.currentTimeMillis()
        if (packageName != lastPackageName) {
            lastPackageName = packageName
        } else {
            if (now - lastTreeScanAt < SCAN_COOLDOWN_MS) return
        }
        lastTreeScanAt = now

        val rootNode = rootInActiveWindow
        val isRootNode = rootNode != null
        val nodeToUse = rootNode ?: event.source ?: return

        try {
            checkAndBlock(nodeToUse, packageName, prefs)
        } finally {
            if (isRootNode) {
                rootNode?.recycle()
            }
        }
    }

    private fun checkAndBlock(node: AccessibilityNodeInfo, packageName: String, prefs: android.content.SharedPreferences) {
        // ── Check Strict Mode ───────────────────────────────────────────────
        if (prefs.getBoolean("strict_mode", false)) {
            if (packageName == "com.android.settings" || packageName == "com.miui.securitycenter") {
                if (hasNodeByText(node, "Accessibility") ||
                    hasNodeByText(node, "FocusZen") ||
                    hasNodeByText(node, "Device admin")
                ) {
                    triggerBlockAction("Strict mode active - Settings blocked", isFullBlock = true, appName = "Settings")
                    return
                }
            }
        }

        // ── Check Generic Full App Block ─────────────────────────────────────
        val appName = PACKAGE_MAP[packageName]
        if (appName != null) {
            if (isFeatureEnabled(appName, "blockApp")) {
                triggerBlockAction("$appName is blocked", isFullBlock = true, appName = appName)
                return
            }
        }

        // ── Per-app feature blocking ─────────────────────────────────────────
        when (packageName) {
            "com.google.android.youtube"                          -> handleYouTube(node)
            "com.facebook.katana"                                 -> handleFacebook(node)
            "com.instagram.android"                               -> handleInstagram(node)
            "com.zhiliaoapp.musically", "com.ss.android.ugc.trill" -> handleTikTok(node)
            "com.snapchat.android"                                -> handleSnapchat(node)
            "com.whatsapp"                                        -> handleWhatsApp(node)
            "com.twitter.android", "com.x.android"               -> handleX(node)
            "org.telegram.messenger"                              -> handleTelegram(node)
            "com.facebook.orca", "com.facebook.mlite"            -> handleMessenger(node)
            "jp.naver.line.android"                              -> handleLine(node)
            // Browsers
            "com.android.chrome",
            "com.sec.android.app.sbrowser",
            "org.mozilla.firefox",
            "com.microsoft.emmx",
            "com.opera.browser",
            "com.brave.browser",
            "com.duckduckgo.mobile.android"                       -> handleBrowser(node, packageName)
        }
    }

    // ─── App Handlers ─────────────────────────────────────────────────────────

    private fun handleYouTube(node: AccessibilityNodeInfo?) {
        if (isFeatureEnabled("YouTube", "blockApp")) {
            triggerBlockAction("YouTube is blocked", true, "YouTube"); return
        }

        // Block Shorts — check highly specific accessibility content descriptions inside the player
        if (isFeatureEnabled("YouTube", "blockShorts")) {
            val inShorts = lastActivityClass.contains("ReelWatch", ignoreCase = true)
                || lastActivityClass.contains("Shorts", ignoreCase = true)
                || hasNodeByContentDesc(node, "Like this Short")
                || hasNodeByContentDesc(node, "Dislike this Short")
                || hasNodeByContentDesc(node, "Remix this Short")
                || hasNodeWithIdLike(node, "shorts_player")
                || hasNodeWithIdLike(node, "reel_player")
                || hasNodeWithIdLike(node, "reel_watch")
                || hasNodeWithIdLike(node, "shorts_tombstone")
                || hasNodeWithIdLike(node, "shorts_title")
                || hasNodeWithIdLike(node, "shorts_comment")
                || hasNodeWithIdLike(node, "shorts_share")
                || hasNodeWithIdLike(node, "shorts_like")
                || hasNodeWithIdLike(node, "shorts_dislike")
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
            triggerBlockAction("Facebook is blocked", true, "Facebook"); return
        }

        // Block Reels — must be in a Reels-specific context
        if (isFeatureEnabled("Facebook", "blockReels")) {
            val inReels = lastActivityClass.contains("Reel", ignoreCase = true)
                || lastActivityClass.contains("Shorts", ignoreCase = true)
                || hasNodeByContentDesc(node, "Like this reel")
                || hasNodeByContentDesc(node, "Comment on this reel")
                || hasNodeByContentDesc(node, "Share this reel")
                || hasNodeByContentDesc(node, "Reels video")
                || hasNodeWithIdLike(node, "reels_video")
                || hasNodeWithIdLike(node, "reel_player")
                || hasNodeWithIdLike(node, "fb_shorts")
                || hasNodeWithIdLike(node, "reel_viewer")
                || hasNodeWithIdLike(node, "reels_viewer")
                || hasNodeWithIdLike(node, "reels_feed")
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
            triggerBlockAction("Instagram is blocked", true, "Instagram"); return
        }

        if (isFeatureEnabled("Instagram", "blockReels")) {
            val inReels = lastActivityClass.contains("Reel", ignoreCase = true)
                || lastActivityClass.contains("Clip", ignoreCase = true)
                || hasNodeByContentDesc(node, "Like this reel")
                || hasNodeByContentDesc(node, "Comment on this reel")
                || hasNodeByContentDesc(node, "Share this reel")
                || hasNodeByContentDesc(node, "Reel of")
                || hasNodeWithIdLike(node, "clips_player")
                || hasNodeWithIdLike(node, "reels_tray")
                || hasNodeWithIdLike(node, "clips_video")
                || hasNodeWithIdLike(node, "clips_play")
                || hasNodeWithIdLike(node, "reel_viewer")
                || hasNodeWithIdLike(node, "instagram_reels")
            if (inReels) { triggerBlockAction("Instagram Reels blocked"); return }
        }

        if (isFeatureEnabled("Instagram", "blockStories")) {
            val inStories = lastActivityClass.contains("story", ignoreCase = true)
                || hasNodeWithIdLike(node, "reel_viewer_root")
                || hasNodeWithIdLike(node, "story_viewer_container")
                || hasNodeWithIdLike(node, "story_viewer")
            if (inStories) { triggerBlockAction("Instagram Stories blocked"); return }
        }

        if (isFeatureEnabled("Instagram", "blockExplore")) {
            val inExplore = lastActivityClass.contains("explore", ignoreCase = true)
                || hasNodeWithIdLike(node, "explore_fragment_container")
                || hasNodeWithIdLike(node, "explore_search")
                || hasNodeByText(node, "Search")
            if (inExplore) { triggerBlockAction("Instagram Explore blocked"); return }
        }
    }

    private fun handleTikTok(node: AccessibilityNodeInfo?) {
        if (isFeatureEnabled("TikTok", "blockApp")) {
            triggerBlockAction("TikTok is blocked", true, "TikTok"); return
        }

        if (isFeatureEnabled("TikTok", "blockReels")) {
            // TikTok IS essentially a reels feed — block main feed view
            val inFeed = hasNodeWithIdLike(node, "id/feed") 
                || hasNodeWithIdLike(node, "vertical_view_pager")
                || hasNodeWithIdLike(node, "feed_view_pager")
                || hasNodeWithIdLike(node, "aweme_video")
                || lastActivityClass.contains("MainActivity", ignoreCase = true) && hasNodeWithIdLike(node, "viewpager")
            if (inFeed) { triggerBlockAction("TikTok Feed blocked"); return }
        }

        if (isFeatureEnabled("TikTok", "blockSearch")) {
            val inSearch = hasNodeWithIdLike(node, "search_input")
                || hasNodeWithIdLike(node, "search_box")
                || lastActivityClass.contains("search", ignoreCase = true)
            if (inSearch) { triggerBlockAction("TikTok Search blocked"); return }
        }

        if (isFeatureEnabled("TikTok", "blockComments")) {
            val inComments = lastActivityClass.contains("comment", ignoreCase = true)
                || hasNodeWithIdLike(node, "comment_input")
                || hasNodeWithIdLike(node, "comment_list")
                || hasNodeByText(node, "Add comment")
            if (inComments) { triggerBlockAction("TikTok Comments blocked"); return }
        }
    }

    private fun handleSnapchat(node: AccessibilityNodeInfo?) {
        if (isFeatureEnabled("Snapchat", "blockApp")) {
            triggerBlockAction("Snapchat is blocked", true, "Snapchat"); return
        }

        if (isFeatureEnabled("Snapchat", "blockSpotlight")) {
            val inSpotlight = hasNodeWithIdLike(node, "spotlight")
                || hasNodeWithIdLike(node, "spotlight_header")
                || lastActivityClass.contains("spotlight", ignoreCase = true)
            if (inSpotlight) { triggerBlockAction("Snapchat Spotlight blocked"); return }
        }

        if (isFeatureEnabled("Snapchat", "blockStories")) {
            val inStories = lastActivityClass.contains("story", ignoreCase = true)
                || hasNodeWithIdLike(node, "story_player")
                || hasNodeWithIdLike(node, "snap_viewer")
            if (inStories) { triggerBlockAction("Snapchat Stories blocked"); return }
        }
    }

    private fun handleWhatsApp(node: AccessibilityNodeInfo?) {
        if (isFeatureEnabled("WhatsApp", "blockApp")) {
            triggerBlockAction("WhatsApp is blocked", true, "WhatsApp"); return
        }

        if (isFeatureEnabled("WhatsApp", "blockStatus")) {
            val inStatus = lastActivityClass.contains("status", ignoreCase = true)
                || hasNodeWithIdLike(node, "status_shared")
                || hasNodeWithIdLike(node, "tab_status")
            if (inStatus) { triggerBlockAction("WhatsApp Status blocked"); return }
        }

        if (isFeatureEnabled("WhatsApp", "blockChannels")) {
            val inChannels = lastActivityClass.contains("channel", ignoreCase = true)
                || hasNodeWithIdLike(node, "tab_channels")
                || hasNodeWithIdLike(node, "channel_view")
            if (inChannels) { triggerBlockAction("WhatsApp Channels blocked"); return }
        }
    }

    private fun handleX(node: AccessibilityNodeInfo?) {
        if (isFeatureEnabled("X", "blockApp")) {
            triggerBlockAction("X is blocked", true, "X"); return
        }

        if (isFeatureEnabled("X", "blockExplore")) {
            val inExplore = lastActivityClass.contains("explore", ignoreCase = true)
                || hasNodeWithIdLike(node, "explore_tab")
                || hasNodeWithIdLike(node, "search_results")
            if (inExplore) { triggerBlockAction("X Explore blocked"); return }
        }
    }

    private fun handleTelegram(node: AccessibilityNodeInfo?) {
        if (isFeatureEnabled("Telegram", "blockApp")) {
            triggerBlockAction("Telegram is blocked", true, "Telegram"); return
        }

        if (isFeatureEnabled("Telegram", "blockChannels")) {
            val inChannels = lastActivityClass.contains("channel", ignoreCase = true)
                || hasNodeWithIdLike(node, "channel_chat")
            if (inChannels) { triggerBlockAction("Telegram Channels blocked"); return }
        }
    }

    private fun handleMessenger(node: AccessibilityNodeInfo?) {
        if (isFeatureEnabled("Messenger", "blockApp")) {
            triggerBlockAction("Messenger is blocked", true, "Messenger"); return
        }

        if (isFeatureEnabled("Messenger", "blockStories")) {
            val inStories = lastActivityClass.contains("story", ignoreCase = true)
                || hasNodeWithIdLike(node, "stories_viewer")
                || hasNodeWithIdLike(node, "story_viewer")
            if (inStories) { triggerBlockAction("Messenger Stories blocked"); return }
        }
    }

    private fun handleLine(node: AccessibilityNodeInfo?) {
        if (isFeatureEnabled("Line", "blockApp")) {
            triggerBlockAction("Line is blocked", true, "Line"); return
        }

        if (isFeatureEnabled("Line", "blockVoom")) {
            val inVoom = lastActivityClass.contains("voom", ignoreCase = true)
                || hasNodeWithIdLike(node, "voom_feed")
                || hasNodeWithIdLike(node, "voom_player")
            if (inVoom) { triggerBlockAction("Line VOOM blocked"); return }
        }
    }

    // ─── Browser URL Blocking ────────────────────────────────────────────────

    private fun handleBrowser(node: AccessibilityNodeInfo?, packageName: String) {
        val prefs = getSafePrefs()
        val adultBlock = prefs.getBoolean("adultContentBlock", false)
        val gamblingBlock = prefs.getBoolean("gamblingBlock", false)
        val customDomains = prefs.getString("custom_blocked_domains", "")
            ?.split(",")?.map { it.trim() }?.filter { it.isNotEmpty() } ?: emptyList()

        if (!adultBlock && !gamblingBlock && customDomains.isEmpty()) return

        val urlText = extractBrowserUrl(node, packageName) ?: return

        when {
            adultBlock && isAdultSite(urlText) ->
                triggerBlockAction("Adult content blocked", isFullBlock = true, appName = "Website")
            gamblingBlock && isGamblingSite(urlText) ->
                triggerBlockAction("Gambling site blocked", isFullBlock = true, appName = "Website")
            customDomains.isNotEmpty() && isCustomBlocked(urlText, customDomains) ->
                triggerBlockAction("Site blocked by FocusZen", isFullBlock = true, appName = "Website")
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
            if (urlNode != null) {
                val text = urlNode.text?.toString()?.lowercase()
                urlNode.recycle()
                if (text != null && text.isNotEmpty()) return text
            }
        }

        // Fallback: full tree traversal for any node whose text looks like a URL
        return extractUrlFromTree(node)
    }

    private fun extractUrlFromTree(node: AccessibilityNodeInfo?): String? {
        if (node == null) return null
        val text = node.text?.toString() ?: ""
        if (looksLikeUrl(text)) return text.lowercase()
        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            if (child != null) {
                val result = extractUrlFromTree(child)
                child.recycle()
                if (result != null) return result
            }
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

    private fun getSafePrefs(): android.content.SharedPreferences {
        return getSharedPreferences("FocusZenSettings", Context.MODE_PRIVATE)
    }

    private fun isFeatureEnabled(appName: String, feature: String): Boolean {
        val prefs = getSafePrefs()
        val key = "${appName}_${feature}"
        val value = prefs.getBoolean(key, false)
        Log.d(TAG, "Feature check: $key=$value")
        return value
    }

    private fun triggerBlockAction(reason: String, isFullBlock: Boolean = false, appName: String? = null) {
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
            try {
                showBlackoutOverlay(appName ?: "App")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to block: ${e.message}")
                sendHome()
            }
        } else {
            performGlobalAction(GLOBAL_ACTION_BACK)
        }
    }

    private fun sendHome() {
        val success = performGlobalAction(GLOBAL_ACTION_HOME)
        if (!success) {
            try {
                val homeIntent = Intent(Intent.ACTION_MAIN).apply {
                    addCategory(Intent.CATEGORY_HOME)
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                startActivity(homeIntent)
            } catch (e: Exception) {}
        }
    }

    private fun dpToPx(dp: Int): Int {
        val density = resources.displayMetrics.density
        return (dp * density).toInt()
    }

    private fun showBlackoutOverlay(appName: String) {
        if (isBlackoutActive) return
        Handler(Looper.getMainLooper()).post {
            try {
                val windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
                
                val rootLayout = object : FrameLayout(this) {
                    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
                        if (event.keyCode == KeyEvent.KEYCODE_BACK) {
                            sendHome()
                            removeBlackoutOverlay()
                            return true
                        }
                        return super.dispatchKeyEvent(event)
                    }
                }.apply {
                    val gd = GradientDrawable(
                        GradientDrawable.Orientation.TOP_BOTTOM,
                        intArrayOf(Color.parseColor("#0f172a"), Color.parseColor("#0b0f19"))
                    )
                    background = gd
                    isClickable = true
                    isFocusable = true
                }

                val contentLayout = LinearLayout(this).apply {
                    orientation = LinearLayout.VERTICAL
                    gravity = Gravity.CENTER
                    layoutParams = FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.MATCH_PARENT,
                        FrameLayout.LayoutParams.WRAP_CONTENT,
                        Gravity.CENTER
                    )
                }

                val iconContainer = FrameLayout(this).apply {
                    val circleGd = GradientDrawable().apply {
                        shape = GradientDrawable.OVAL
                        setColor(Color.parseColor("#1e293b"))
                        setStroke(4, Color.parseColor("#6366f1"))
                    }
                    background = circleGd
                    val size = dpToPx(100)
                    layoutParams = LinearLayout.LayoutParams(size, size).apply {
                        gravity = Gravity.CENTER_HORIZONTAL
                        bottomMargin = dpToPx(24)
                    }
                }

                val shieldEmoji = TextView(this).apply {
                    text = "🛡️"
                    textSize = 40f
                    gravity = Gravity.CENTER
                    layoutParams = FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.MATCH_PARENT,
                        FrameLayout.LayoutParams.MATCH_PARENT
                    )
                }
                iconContainer.addView(shieldEmoji)
                contentLayout.addView(iconContainer)

                val titleView = TextView(this).apply {
                    text = "Time to Focus"
                    textSize = 28f
                    setTextColor(Color.WHITE)
                    typeface = Typeface.DEFAULT_BOLD
                    gravity = Gravity.CENTER
                    layoutParams = LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.WRAP_CONTENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    ).apply {
                        bottomMargin = dpToPx(12)
                    }
                }
                contentLayout.addView(titleView)

                val subtitleView = TextView(this).apply {
                    text = "$appName is blocked right now to help you stay productive."
                    textSize = 16f
                    setTextColor(Color.parseColor("#94a3b8"))
                    gravity = Gravity.CENTER
                    setLineSpacing(4f, 1.1f)
                    val padding = dpToPx(32)
                    setPadding(padding, 0, padding, 0)
                    layoutParams = LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    ).apply {
                        bottomMargin = dpToPx(40)
                    }
                }
                contentLayout.addView(subtitleView)

                val buttonView = TextView(this).apply {
                    text = "Got It, Close App"
                    textSize = 16f
                    setTextColor(Color.WHITE)
                    typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
                    gravity = Gravity.CENTER
                    
                    val btnGd = GradientDrawable().apply {
                        shape = GradientDrawable.RECTANGLE
                        cornerRadius = dpToPx(14).toFloat()
                        setColor(Color.parseColor("#6366f1"))
                    }
                    background = btnGd
                    
                    val verticalPadding = dpToPx(16)
                    val horizontalPadding = dpToPx(32)
                    setPadding(horizontalPadding, verticalPadding, horizontalPadding, verticalPadding)
                    
                    layoutParams = LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    ).apply {
                        val margin = dpToPx(48)
                        leftMargin = margin
                        rightMargin = margin
                    }
                    
                    setOnClickListener {
                        sendHome()
                        removeBlackoutOverlay()
                    }
                }
                contentLayout.addView(buttonView)

                rootLayout.addView(contentLayout)

                val params = WindowManager.LayoutParams(
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.MATCH_PARENT,
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY
                    } else {
                        @Suppress("DEPRECATION")
                        WindowManager.LayoutParams.TYPE_PHONE
                    },
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                    PixelFormat.TRANSLUCENT
                ).apply {
                    gravity = Gravity.CENTER
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                        layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
                    }
                }

                windowManager.addView(rootLayout, params)
                blackoutView = rootLayout
                isBlackoutActive = true
            } catch (e: Exception) {
                Log.e(TAG, "Failed to show block overlay: ${e.message}")
            }
        }
    }

    private fun removeBlackoutOverlay() {
        if (!isBlackoutActive || blackoutView == null) return
        Handler(Looper.getMainLooper()).post {
            try {
                val windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
                windowManager.removeView(blackoutView)
                blackoutView = null
                isBlackoutActive = false
            } catch (e: Exception) {
                Log.e(TAG, "Failed to remove blackout overlay: ${e.message}")
            }
        }
    }

    private fun hasNodeByText(node: AccessibilityNodeInfo?, text: String): Boolean {
        if (node == null) return false
        val results = node.findAccessibilityNodeInfosByText(text)
        val found = results != null && results.isNotEmpty()
        results?.forEach { it.recycle() }
        return found
    }

    private fun hasNodeById(node: AccessibilityNodeInfo?, id: String): Boolean {
        if (node == null) return false
        val results = node.findAccessibilityNodeInfosByViewId(id)
        val found = results != null && results.isNotEmpty()
        results?.forEach { it.recycle() }
        return found
    }

    private fun hasNodeWithIdLike(node: AccessibilityNodeInfo?, idContains: String): Boolean {
        if (node == null) return false
        val viewId = node.viewIdResourceName?.lowercase() ?: ""
        val shortId = if (viewId.contains(":id/")) viewId.substringAfter(":id/") else viewId
        if (shortId.contains(idContains.lowercase())) return true
        
        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            if (child != null) {
                val found = hasNodeWithIdLike(child, idContains)
                child.recycle()
                if (found) return true
            }
        }
        return false
    }

    private fun hasNodeByContentDesc(node: AccessibilityNodeInfo?, desc: String): Boolean {
        if (node == null) return false
        if (node.contentDescription?.toString()?.contains(desc, ignoreCase = true) == true) return true
        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            if (child != null) {
                val found = hasNodeByContentDesc(child, desc)
                child.recycle()
                if (found) return true
            }
        }
        return false
    }

    private fun findNodeById(node: AccessibilityNodeInfo?, id: String): AccessibilityNodeInfo? {
        if (node == null) return null
        val results = node.findAccessibilityNodeInfosByViewId(id)
        if (results != null && results.isNotEmpty()) {
            val first = results[0]
            for (i in 1 until results.size) {
                results[i].recycle()
            }
            return first
        }
        return null
    }

    override fun onInterrupt() {}
}
