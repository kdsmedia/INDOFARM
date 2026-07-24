---
name: Native build prerequisites
description: Environment constraints for producing the release APK.
---

Release packaging needs Java, Android SDK/Gradle, installable Capacitor
dependencies, the Firebase Android configuration, and a release keystore.

**Why:** The current Replit environment has Java but does not provide the
Android SDK/Gradle toolchain, and its package firewall may reject transitive
native build packages.

**How to apply:** Verify these prerequisites before promising an APK artifact.
Never claim a release build succeeded when only the JavaScript bundle passed
static checks.