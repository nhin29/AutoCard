// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix for react-native-svg duplicate registration with new architecture + hot reload
// This is a known issue when using new architecture (Fabric) with hot reload
// The SVG components get registered twice during hot reload
// Solution: Clear Metro cache and restart if you see duplicate registration errors
config.resolver = {
  ...config.resolver,
  // Ensure consistent module resolution
  unstable_enablePackageExports: true,
};

module.exports = config;
