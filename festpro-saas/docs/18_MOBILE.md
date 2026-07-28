# FestPro Mobile App (PWA) — Complete Official Documentation

**Module:** 18 — Mobile App / PWA  
**Version:** 2.0  
**Dependencies:** All modules  
**Applies To:** All users — Judges, Volunteers, Staff, Participants, Admins

---

# Section 1: Introduction

FestPro is available as a Progressive Web Application (PWA) that works on both Android and iOS devices. It provides offline-capable access to critical features — judges can enter scores offline (queue and sync), volunteers can check in/out, participants can view schedules and results, and everyone receives real-time push notifications. The PWA installs directly from the browser with no app store required.

## Key Capabilities

| Capability | Description |
|------------|-------------|
| Installable | Add to Home Screen on Android (Chrome) and iOS (Safari) |
| Offline Mode | Scores, schedules, and results cached for offline access |
| Offline Queue | Score submissions queued when offline, synced when online |
| QR Scanner | Scan participant/volunteer QR codes for check-in |
| Push Notifications | Real-time alerts for schedule changes, results, calls |
| Biometric Login | Fingerprint / Face ID for quick authentication |
| Camera Access | Photo uploads, QR scanning, profile pictures |
| Touch Optimised | UI designed for touch interaction on mobile screens |

---

# Section 2: Before You Start

## Prerequisites

| Prerequisite | Details |
|---|---|
| Supported Browser | Chrome (Android) or Safari (iOS) |
| HTTPS | PWA requires HTTPS (enforced by service workers) |
| Internet Connection | Required for initial load and periodic sync |

## Installation Checklist

- [ ] Open https://festpro.app in Chrome/Safari
- [ ] Log in to your account
- [ ] Install the PWA (see Section 3)
- [ ] Grant notification permission (prompted on first visit)
- [ ] Test offline mode: enable airplane mode and navigate
- [ ] Test QR scanner: grant camera permission
- [ ] Configure biometric login (optional)

---

# Section 3: Installation

## 3.1 Android (Chrome)

**Step 1:** Open https://festpro.app in Chrome browser.  
**Step 2:** Tap the three-dot menu (⋮) in the top-right corner.  
**Step 3:** Tap **Add to Home screen**.  
**Step 4:** (Optional) Edit the name, then tap **Add**.  
**Step 5:** The FestPro icon appears on the home screen.  
**Step 6:** Open from home screen — it launches in full-screen mode.

*Alternative:* Chrome may show an "Install FestPro" banner at the bottom — tap **Install**.

## 3.2 iOS (Safari)

**Step 1:** Open https://festpro.app in Safari browser.  
**Step 2:** Tap the **Share** button (square with arrow at the bottom).  
**Step 3:** Scroll down and tap **Add to Home Screen**.  
**Step 4:** (Optional) Edit the name, then tap **Add** (top-right).  
**Step 5:** The FestPro icon appears on the home screen.  
**Step 6:** Open from home screen — it launches without browser chrome.

*Note:* On iOS, some PWA features (background sync, file system access) are limited compared to Android.

## 3.3 Updating the PWA

PWAs update automatically in the background. To force an update:
1. Close the PWA completely
2. Open https://festpro.app in the browser (not PWA)
3. The new version loads
4. Close browser and re-open PWA

---

# Section 4: Mobile Features

## Feature Matrix

| Feature | Offline Support | Permission Required | Notes |
|---------|:---------------:|:------------------:|-------|
| Dashboard | ✅ (cached) | None | Last-loaded data cached |
| Schedule | ✅ (cached) | None | Auto-refreshes when online |
| Judge Scoring | ✅ (queued) | None | Scores sync when online |
| QR Scanner | ❌ | Camera | Requires live connection for validation |
| Check-in | ❌ | Camera | Online required for real-time status |
| Results | ✅ (cached) | None | Last-published results cached |
| Certificates | ✅ (cached) | Storage | Downloaded PDFs cached |
| Push Notifications | ✅ | Notification | Requires permission grant |
| Biometric Login | ✅ | Biometric | WebAuthn/Device biometrics |

## 4.1 Dashboard (Mobile)

```
┌──────────────────────────────────┐
│  ☰ FestPro          🔔 🔍  👤  │
├──────────────────────────────────┤
│  DISTRICT YOUTH FESTIVAL 2025    │
│  ──────────────────────────────  │
│  ┌────────────────────────────┐  │
│  │ 📅 Today's Schedule       │  │
│  │ 10:00 AM  Kathakali  Stg A│  │
│  │ 11:00 AM  Mohiniyattam Stg│  │
│  │ 02:00 PM  Group Song  Stg B│  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ 🏆 My Competitions        │  │
│  │ ✅ Kathakali (Check: 10AM)│  │
│  │ ✅ Group Song (Check: 2PM)│  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ 🔄 Offline Queue: 3 pending│ │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

## 4.2 Offline Score Entry (Judge)

```
┌──────────────────────────────────┐
│  ⬅ Back         Enter Scores    │
├──────────────────────────────────┤
│  Kathakali — Round 1            │
│  Participant: Aarav Sharma      │
│  ──────────────────────────────  │
│  Expression          ═══●═══ 8  │
│  Technique           ═══●═══ 7  │
│  Costume             ═══●═══ 9  │
│  Stage Presence      ═══●═══ 8  │
│  ──────────────────────────────  │
│  Total: 32/40                    │
│  ──────────────────────────────  │
│  Comments: [.................]   │
│  ──────────────────────────────  │
│  [💾 Save Offline — Will Sync]  │
└──────────────────────────────────┘
```

---

# Section 5: Step-by-Step Guide

## 5.1 Enabling Biometric Login

1. Open FestPro PWA / Website
2. Go to **Profile → Settings → Security**
3. Tap **Enable Biometric Login** (Fingerprint / Face ID)
4. Authenticate with your current password
5. Register your device biometric
6. Next time, tap the fingerprint icon on the login screen to use biometrics

## 5.2 Using the Offline Score Queue (Judges)

1. Open the PWA while online to cache the competition data
2. Go to **Judging → [Competition] → Enter Scores**
3. Enter scores as usual — the app works even without internet
4. Each score card shows a **💾 Saved Offline** indicator
5. The **Offline Queue** badge shows pending sync count
6. When internet is restored: scores auto-sync
7. A banner confirms: **"3 scores synced successfully"**
8. If sync fails: tap **Retry** on the failed items

## 5.3 Scanning QR Codes

1. Open the PWA
2. Navigate to **Check-in** or **Attendance**
3. Tap **Scan QR Code**
4. Grant **Camera Permission** when prompted
5. Point the camera at the participant's QR code (from their mobile or printed card)
6. The app vibrates/beeps on successful scan
7. Participant information displays: name, competition, registered items
8. Tap **Confirm Check-in**
9. Status updates in real-time (requires connection)

---

# Section 6: Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| MOBILE-001 | PWA requires HTTPS (enforced by service worker specification) | Browser API |
| MOBILE-002 | Offline data is stored in IndexedDB (max 50MB for most browsers) | Browser API |
| MOBILE-003 | Scores entered offline are timestamped with local device time | Client Logic |
| MOBILE-004 | Offline data cannot be accessed without prior online session (cache warmed) | Service Worker |
| MOBILE-005 | Push notifications require user permission (browser prompt) | Browser API |
| MOBILE-006 | Biometric login requires device with WebAuthn/FIDO2 support | WebAuthn API |
| MOBILE-007 | Offline scores are synced in FIFO order (first queued, first synced) | Queue Logic |
| MOBILE-008 | Failed syncs are retried 3 times with exponential backoff | Sync Engine |
| MOBILE-009 | Camera access is required only for QR scanning features | Permission API |
| MOBILE-010 | PWA cache is cleared on app update to prevent stale data | Service Worker |

---

# Section 7: Best Practices

1. **Install the PWA before event day** — avoid installation issues during peak usage
2. **Open the app while online** to cache frequently accessed data before going offline
3. **Enable push notifications** for real-time schedule changes and calls
4. **Grant camera permission** in advance for QR scanning and check-in
5. **Use biometric login** for quick access during busy periods
6. **Clear app cache** if experiencing issues: Phone Settings → Apps → FestPro → Storage → Clear Cache
7. **Update the app periodically** — PWA updates in background; re-open the browser to force update
8. **Download certificates and schedules while online** for offline viewing
9. **Keep screen brightness high** when scanning QR codes outdoors
10. **Close other apps** to prevent background memory issues during scoring
11. **Check sync status** after regaining connectivity — ensure offline scores are uploaded
12. **Lock screen orientation** for score entry (judges should hold phone steady)

---

# Section 8: Common Mistakes

1. ❌ **Not installing before the event** — installing on mobile data at the venue is slow
2. ❌ **Denying notification permission** — missing critical schedule changes
3. ❌ **Submitting scores offline without checking sync status** — scores may not upload
4. ❌ **Using in-app browser** — PWA features only work in Chrome/Safari, not in-app browsers
5. ❌ **Not refreshing cached schedules** — viewing stale schedule from yesterday
6. ❌ **Clearing browser data** — removes PWA and all cached data
7. ❌ **Expecting full offline functionality** — QR check-in and real-time features need internet
8. ❌ **Ignoring storage warnings** — IndexedDB can fill up with large media

---

# Section 9: Troubleshooting

## P1: PWA won't install
**Problem:** "Add to Home Screen" option is greyed out or missing.  
**Root Causes:** (1) HTTPS not enforced. (2) Service worker not registered. (3) Using an unsupported browser. (4) Already installed.  
**Solution:** Ensure you're on https://festpro.app via Chrome or Safari. Check if already installed. Clear browser cache and reload.

## P2: Offline scores not syncing
**Problem:** Scores remain in queue after reconnecting.  
**Root Causes:** (1) Network connectivity not fully restored. (2) Session expired. (3) Server rejecting the scores.  
**Solution:** Tap **Manual Sync** in the offline queue. Check internet connectivity. Log out and log back in. Retry.

## P3: Push notifications not arriving
**Problem:** Notifications work on web but not on PWA.  
**Root Causes:** (1) Permission not granted for PWA specifically. (2) Service worker not running. (3) PWA background restricted by OS.  
**Solution:** Check browser notification permissions for the PWA URL. On Android: go to App Info → Notifications → Enable.

## P4: Camera not working for QR scan
**Problem:** QR scanner shows black screen or permission error.  
**Root Causes:** (1) Camera permission denied. (2) Another app using camera. (3) HTTPS not enforced (camera requires secure context).  
**Solution:** Grant camera permission in browser/settings. Close other camera apps. Ensure HTTPS.

## P5: Biometric login not available
**Problem:** "Enable Biometric" option is greyed out.  
**Root Causes:** (1) Device doesn't support WebAuthn. (2) No biometric sensor (fingerprint/face). (3) Browser doesn't support WebAuthn.  
**Solution:** Use password login. Try a different browser. Check if device has biometric hardware.

---

# Section 10: FAQ

| # | Question | Answer |
|---|----------|--------|
| 1 | **Is there an iOS/Android app on the App Store?** | No — FestPro is a PWA and installs directly from the browser. No app store needed. |
| 2 | **Does the PWA work offline?** | Partially. Cached data (schedules, results, certificates) is viewable offline. Score entry works offline with auto-sync. QR scanning and check-in require internet. |
| 3 | **How do I update the PWA?** | Close and reopen the PWA. Check for updates by visiting the website in browser. |
| 4 | **Can I use biometrics for login?** | Yes, on devices with fingerprint or face recognition support (WebAuthn). |
| 5 | **What happens if I clear my browser cache?** | The PWA is removed. You'll need to reinstall and re-cache data. |
| 6 | **Can I use the PWA on multiple devices?** | Yes, log in on any device. Offline data is per-device. |
| 7 | **How much storage does the PWA use?** | Typically 5-50MB depending on cached data. Manageable from Phone Settings → Storage. |
| 8 | **Does the PWA work on tablets?** | Yes, responsive design works on tablets (iPad, Android tablets). |
| 9 | **Can judges score offline on multiple participants?** | Yes. Each score submission is individually queued. No limit on queue size. |
| 10 | **Is QR scanning available offline?** | No. QR validation requires server lookup, so internet is required. |

---

# Section 11: Glossary

| Term | Definition |
|------|------------|
| **PWA** | Progressive Web App — a website that behaves like a native app |
| **Service Worker** | Browser script that enables offline caching and push notifications |
| **IndexedDB** | Browser-based database for storing offline data |
| **WebAuthn** | Web Authentication API for biometric and passwordless login |
| **Offline Queue** | List of pending operations to sync when connectivity returns |
| **FIFO** | First In, First Out — queue processing order |

---

*End of Mobile App Module Documentation (Module 18)*
