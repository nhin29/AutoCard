# Troubleshooting Guide

## Runtime Errors

### AsyncStorage Directory Creation Error

**Error**: `Failed to create storage directory. Error Domain=NSCocoaErrorDomain Code=512`

**Cause**: This is a known issue in iOS Simulator where a file named `@anonymous` exists instead of a directory in the ExponentExperienceData folder.

**Solution**:
1. **Quick fix**: Reset the iOS Simulator
   - Open Simulator
   - Go to `Device > Erase All Content and Settings...`
   - Restart the app

2. **Permanent fix**: The app now uses a safe AsyncStorage wrapper that handles these errors gracefully. The app will continue to work even if storage operations fail (data just won't persist).

**Note**: This issue only occurs in development with Expo Go/simulator. Production builds are not affected.

---

### React Native SVG Duplicate Registration

**Error**: `Invariant Violation: Tried to register two views with the same name RNSVG*`

**Cause**: This is a known issue with React Native's new architecture (Fabric) and hot reload. SVG components get registered twice during hot reload.

**Solution**:
1. **Clear Metro cache and restart**:
   ```bash
   npx expo start --clear
   ```

2. **If issue persists**, restart the Metro bundler completely:
   ```bash
   # Stop the current Metro bundler (Ctrl+C)
   # Then restart with cache cleared
   npx expo start --clear
   ```

3. **For production builds**: This issue does not occur in production builds, only during development with hot reload.

**Note**: The metro.config.js has been configured to help prevent this, but if you see these errors, clearing the cache usually resolves it.

---

### Expo AV Deprecation Warning

**Warning**: `[expo-av]: Expo AV has been deprecated and will be removed in SDK 54`

**Status**: This is just a deprecation warning. `expo-av` still works in SDK 54, but will be removed in future versions.

**Action Required**: 
- The app currently uses `expo-av` in `app/story/preview-story.tsx` for video playback
- Plan to migrate to `expo-video` package in the future
- No immediate action needed - the app will continue to work

**Migration Path** (when ready):
```bash
npm install expo-video
# Then update app/story/preview-story.tsx to use expo-video instead of expo-av
```

---

## Build Issues

### Environment Variables Missing

If you see errors about missing environment variables during build:

1. **For EAS builds**: Set secrets via EAS CLI:
   ```bash
   eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "your-url"
   eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-key"
   eas secret:create --scope project --name EXPO_PUBLIC_PLATE_RECOGNIZER_API_KEY --value "your-key"
   ```

2. **For local builds**: Ensure `.env` file exists with all required variables (see `.env.example`)

---

## General Tips

- **Always clear cache** when encountering strange errors: `npx expo start --clear`
- **Reset simulator** if storage errors persist: `Device > Erase All Content and Settings...`
- **Check Expo Doctor**: Run `npx expo-doctor` to verify project configuration
- **Production builds**: Most development-only issues don't occur in production builds
