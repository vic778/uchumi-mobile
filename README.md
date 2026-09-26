# Uchumi Mobile

React Native / Expo app for the Uchumi savings platform.

---

## Getting started

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** (Android) or the Camera app (iOS) to open the app during development.

---

## Push Notifications

Push notifications are implemented with `expo-notifications` and Expo's push relay service.

### How it works

1. When a user logs in, the app requests notification permission and gets an **Expo Push Token** for the device.
2. That token is saved to the backend (`PATCH /api/push_token`).
3. Whenever a notification is created in the backend (deposit, loan update, withdrawal approval, etc.), `Notification.notify` automatically calls `PushNotificationService` which sends the push to Expo's API (`https://exp.host/api/v2/push/send`).
4. Expo routes it to Apple (APNs) on iOS or Google (FCM) on Android.

### Expo Go limitation

Remote push notifications were removed from Expo Go in SDK 53. The app detects Expo Go at runtime and silently skips push registration — everything else works normally. **You must use a development build or production build to test/receive push notifications.**

---

## Building a development build (required for push notifications)

A development build is a custom version of the app that includes all native modules (including push), while still allowing you to iterate quickly.

### Prerequisites

- An [Expo account](https://expo.dev/signup) (free)
- EAS CLI installed: `npm install -g eas-cli`
- Logged in: `eas login`

### Step 1 — Configure EAS

If you haven't already, initialise EAS for this project:

```bash
eas init
```

This creates a project on expo.dev and writes your `projectId` into `app.json`.

### Step 2 — Configure FCM (Android push)

1. Go to [Firebase Console](https://console.firebase.google.com/) → create a project (or use an existing one).
2. Add an **Android app** using the package name from `app.json` → `expo.android.package`.
3. Download `google-services.json` and place it in the root of this repo.
4. Upload the FCM key to EAS:

```bash
eas credentials
# → Android → select your build profile → FCM API Key → paste the Server Key from Firebase Console → Project Settings → Cloud Messaging
```

### Step 3 — Configure APNs (iOS push)

```bash
eas credentials
# → iOS → select your build profile → Push Notifications → let EAS generate or upload your APNs key
```

EAS can auto-generate APNs keys if you provide your Apple Developer account credentials when prompted.

### Step 4 — Build

```bash
# Android
eas build --platform android --profile development

# iOS
eas build --platform ios --profile development
```

This uploads the project to Expo's build servers and returns a download link when done (no Xcode or Android Studio needed locally).

Install the resulting `.apk` (Android) or `.ipa` (iOS, via TestFlight or direct install) on your device.

### Step 5 — Start the dev server and connect

```bash
npx expo start --dev-client
```

Open the development build app on your device → scan the QR code → the app loads with full push support.

---

## Production build

```bash
eas build --platform all --profile production
eas submit --platform all   # submits to App Store / Play Store
```

---

## Over-the-air updates (after shipping)

```bash
eas update --branch production --message "fix: ..."
```

Users on the production build receive the update automatically on next launch without going through the stores.
