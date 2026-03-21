# iOS release repair notes — 2026-03-21

## Outcome

- Version `1.11.0` confirmed across app metadata.
- iOS release build succeeded.
- TestFlight upload succeeded.

## What was fixed

1. **Version alignment**

- Confirmed / normalized `1.11.0` in:
- `package.json`
- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`
- `src-tauri/gen/apple/project.yml`
- `src-tauri/gen/apple/app_iOS/Info.plist`

2. **Release helper correctness**

- Updated `scripts/release.mjs` so version bumps include `src-tauri/Cargo.toml`.

3. **Repo irregularities cleaned up**

- Removed accidental nested repo copy from inside `code-editor/`.
- Removed stale generated simulator/build junk.

4. **iOS build failure fix**

- Xcode/Tauri iOS release builds were failing in the `Build Rust Code` script phase.
- Root cause: `ENABLE_USER_SCRIPT_SANDBOXING` caused Cargo traversal to fail inside the generated Apple project.
- Fix applied in generated Apple project config:
- `src-tauri/gen/apple/project.yml`
- `src-tauri/gen/apple/app.xcodeproj/project.pbxproj`
- Effective setting:
- `ENABLE_USER_SCRIPT_SANDBOXING = NO`

## Successful build artifact

- IPA path:
- `src-tauri/gen/apple/build/arm64/KnotCode.ipa`

## Successful upload

- Upload transport: `xcrun altool`
- App Store Connect accepted the upload.

## Notes

- App Store Connect auth initially failed due to stale/incorrect Apple ID app-specific password.
- Retrying with updated upload credentials succeeded.
- Xcode emitted a deprecation note that `app-store` export naming is deprecated in favor of `app-store-connect`.
