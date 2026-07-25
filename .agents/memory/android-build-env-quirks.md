---
name: Android build environment quirks
description: Environment constraints and workarounds needed to run Gradle successfully in Replit.
---

## Rules

1. **Always use JDK 21** — the default `java` in PATH is GraalVM 19 which breaks `jlink` during AGP transforms. Set `JAVA_HOME=/nix/store/k95pqfzyvrna93hc9a4cg5csl7l4fh0d-openjdk-21.0.7+6` before running Gradle.

2. **Set ANDROID_HOME to the libexec subdirectory** — the Nix SDK store path ends at the top-level package; the actual SDK is inside `libexec/android-sdk`. Use `$SDK/libexec/android-sdk`, not `$SDK`.

3. **Unset ANDROID_SDK_ROOT** — if both `ANDROID_HOME` and `ANDROID_SDK_ROOT` are set to different paths, AGP's lint task aborts before compilation. Unset `ANDROID_SDK_ROOT` before the Gradle invocation.

4. **Capacitor CLI `cap sync` broken by tar version mismatch** — CLI 6.2.1 requires `tar ^6` but environment has `tar 7.5.22`. Workaround: use `cap copy android` (copies web assets only) plus a manually created `android/capacitor-cordova-android-plugins/` directory with `build.gradle` and `cordova.variables.gradle`.

5. **Accept Android SDK license** — set `NIXPKGS_ACCEPT_ANDROID_SDK_LICENSE=1` before calling `nix eval` to resolve the SDK path.

**Why:** These quirks are invisible from the code itself and took several build iterations to isolate.

**How to apply:** Use this shell preamble before every `./gradlew` invocation:

```sh
export NIXPKGS_ACCEPT_ANDROID_SDK_LICENSE=1
export JAVA_HOME=/nix/store/k95pqfzyvrna93hc9a4cg5csl7l4fh0d-openjdk-21.0.7+6
export PATH="$JAVA_HOME/bin:$PATH"
SDK=$(nix eval --impure --raw --expr 'let pkgs = import <nixpkgs> {}; x = pkgs.androidenv.composeAndroidPackages { platformVersions = [ "34" ]; buildToolsVersions = [ "34.0.0" ]; includeEmulator = false; includeSources = false; }; in toString x.androidsdk')
export ANDROID_HOME="$SDK/libexec/android-sdk"
unset ANDROID_SDK_ROOT
```
