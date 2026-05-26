package com.focuszen.app

object AppPackageMap {
  private val appPackages = mapOf(
    "YouTube" to "com.google.android.youtube",
    "Instagram" to "com.instagram.android",
    "Facebook" to "com.facebook.katana",
    "Snapchat" to "com.snapchat.android",
    "TikTok" to "com.zhiliaoapp.musically",
    "Telegram" to "org.telegram.messenger",
    "Line" to "jp.naver.line.android",
    "Messenger" to "com.facebook.orca",
    "WhatsApp" to "com.whatsapp",
    "X" to "com.twitter.android"
  )

  fun packageFor(appName: String): String? = appPackages[appName]

  fun appNameFor(packageName: String): String? {
    return appPackages.entries.firstOrNull { it.value == packageName }?.key
  }
}