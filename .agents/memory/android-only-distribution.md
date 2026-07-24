---
name: Android-only distribution
description: Product distribution boundary for INDOFARM.
---

INDOFARM is distributed only as the Android APK with package
`com.altomedia.indofarm`. The Capacitor bundle is an internal implementation
detail of that APK, not a separate product or delivery target.

**Why:** The user explicitly requires an official Android game and does not want
non-Android delivery surfaces.

**How to apply:** Keep package scripts, documentation, workflows, and runtime
fallbacks focused on native Android. Do not reintroduce standalone delivery
surfaces or development-only service entry points.