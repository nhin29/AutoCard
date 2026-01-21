# Clear Metro Bundler Cache

The warnings about missing default exports are due to Metro bundler cache. Follow these steps:

## Quick Fix

1. **Stop the current dev server** (Ctrl+C)

2. **Clear Metro cache:**
   ```bash
   npx expo start --clear
   ```

   OR

   ```bash
   npm start -- --clear
   ```

3. **If that doesn't work, clear all caches:**
   ```bash
   # Clear Metro cache
   rm -rf node_modules/.cache
   
   # Clear Expo cache
   npx expo start --clear
   
   # For iOS Simulator
   xcrun simctl erase all
   
   # For Android
   adb shell pm clear host.exp.exponent
   ```

## Alternative: Full Reset

If issues persist:

```bash
# Clear all caches
rm -rf node_modules/.cache
rm -rf .expo
rm -rf ios/build
rm -rf android/build
rm -rf android/app/build

# Restart
npm start -- --clear
```

The files are correctly structured - this is purely a cache issue.
