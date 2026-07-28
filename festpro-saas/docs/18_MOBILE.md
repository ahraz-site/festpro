# FestPro Mobile App (PWA) — Complete Official Documentation

**Module:** Mobile App / PWA  
**Version:** 1.0  
**Dependencies:** All modules  
**Applies To:** All users

---

# Section 1: Introduction

FestPro is available as a Progressive Web Application (PWA) that can be installed on mobile devices. It provides offline access to critical features, push notification support, and touch-optimized UI for on-the-go use during festivals.

---

# Section 3: Installation

## 3.1 Android (Chrome)

**Step 1:** Open https://festpro.app in Chrome.

**Step 2:** Tap the three-dot menu (⋮).

**Step 3:** Tap **Add to Home screen**.

**Step 4:** Tap **Add**.

**Step 5:** FestPro icon appears on the home screen.

## 3.2 iOS (Safari)

**Step 1:** Open https://festpro.app in Safari.

**Step 2:** Tap the Share button (square with arrow).

**Step 3:** Scroll down and tap **Add to Home Screen**.

**Step 4:** Edit the name if desired, tap **Add**.

**Step 5:** FestPro icon appears on the home screen.

---

# Section 5: Mobile Features

| Feature | Description | Offline Support |
|---------|-------------|:---------------:|
| Dashboard | View schedule, notifications | ✅ (cached) |
| QR Scanner | Scan participant QR codes | ❌ |
| Judge Scoring | Enter scores during competition | ✅ (queued) |
| Check-in | Check in participants | ❌ |
| Results | View published results | ✅ (cached) |
| Certificates | Download certificates | ✅ (cached) |
| Push Notifications | Real-time alerts | ✅ |
| Biometric Login | Fingerprint / Face ID | ✅ |

## 5.1 Offline Queue

When offline, judge scores are queued locally. Once the device reconnects to the internet:

1. Pending scores are automatically synced to the server
2. Sync status is shown in a banner at the top of the screen
3. Failed syncs are flagged for manual retry
4. Queue size is displayed in the settings menu

---

# Section 9: Business Rules

| Rule ID | Rule |
|---------|------|
| MOBILE-001 | PWA requires HTTPS (enforced by service worker specification) |
| MOBILE-002 | Offline data is stored in IndexedDB (max 50MB for most browsers) |
| MOBILE-003 | Scores entered offline are timestamped with local time and synced |
| MOBILE-004 | Offline data cannot be accessed without prior online session |
| MOBILE-005 | Push notifications require user permission (browser prompt) |
| MOBILE-006 | Biometric login requires device with WebAuthn support |

---

# Section 28: Best Practices

1. **Install the PWA before event day** — avoid installation issues during peak usage.
2. **Open the app while online** to cache frequently accessed data.
3. **Enable push notifications** for real-time schedule changes.
4. **Grant camera permission** for QR scanning and check-in.
5. **Use biometric login** for quick access during busy periods.
6. **Clear app cache** if experiencing issues (phone Settings → Apps → FestPro → Storage → Clear Cache).
7. **Update the app periodically** by visiting the website (PWA updates in background).
8. **Download certificates and schedules** while online for offline viewing.
9. **Keep screen brightness high** when scanning QR codes outdoors.
10. **Close other apps** to prevent background memory issues during scoring.

---

*End of Mobile App Module Documentation*
