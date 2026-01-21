# Figma Design Integration Guide

This guide explains how to fetch design data from Figma and update the splash screen to match the exact design.

## Figma Design Reference

**Design URL:** https://www.figma.com/design/Q5IhAuBOfjRsqYZzhiCS4E/AutoCart-%7C-Ben--Copy-?node-id=7952-78560

**Node ID:** `7952-78560`

## Steps to Update Splash Screen with Figma Design

### 1. Fetch Design Data from Figma

Run the script to fetch the latest design data:

```bash
node scripts/fetch-figma-design.js
```

**Note:** If you encounter rate limit errors (429), wait a few minutes and try again. The Figma API has rate limits to prevent abuse.

### 2. Update Design Specifications

After fetching the data, update `utils/figma-design-specs.ts` with the actual values:

- **Background Color:** Extract from `node.backgroundColor` or `node.fills`
- **Logo Dimensions:** Extract from `node.absoluteBoundingBox.width` and `height`
- **Spacing:** Calculate from child node positions
- **Colors:** Extract from fills, strokes, or effects

### 3. Download Images

If the design contains images:

1. The script will output image URLs from the Figma API
2. Download the images and save them to `assets/images/`
3. Update `SPLASH_SCREEN_SPECS.logo.source` with the correct require path

Example:
```typescript
logo: {
  source: require('@/assets/images/splash-logo.png'),
}
```

### 4. Apply Typography

If the design specifies fonts:

1. Add custom fonts to `assets/fonts/` (if needed)
2. Load fonts using `expo-font` in `app/_layout.tsx`
3. Update typography specs in `figma-design-specs.ts`

### 5. Test the Splash Screen

Run the app and verify the splash screen matches the Figma design:

```bash
npm start
```

## Current Implementation

The splash screen is located at `app/splash.tsx` and uses design specs from `utils/figma-design-specs.ts`.

The component:
- Shows a logo/image from the Figma design
- Displays a loading indicator
- Automatically navigates to the main app after 3.5 seconds
- Uses exact colors, spacing, and dimensions from Figma

## Troubleshooting

### Rate Limit Issues

If you see "Rate limit exceeded" errors:
- Wait 5-10 minutes before retrying
- The Figma API allows a limited number of requests per hour
- Consider using the Figma Desktop MCP server for more reliable access

### Missing Images

If images aren't loading:
- Verify the image paths in `figma-design-specs.ts`
- Check that images exist in `assets/images/`
- Ensure image dimensions match the Figma design

### Styling Mismatches

If the design doesn't match:
- Double-check all values in `figma-design-specs.ts`
- Verify color formats (RGB vs hex)
- Check spacing calculations from Figma layout
- Ensure dimensions account for device pixel ratios

## Using Figma MCP Server

For a more integrated workflow, you can use the Figma Context MCP server:

1. Ensure the MCP server is configured in Cursor (already set up in `~/.cursor/mcp.json`)
2. Restart Cursor to load the MCP server
3. Use prompts like: "Get design specs from this Figma URL: [URL]"

The MCP server provides direct access to Figma design data without API rate limits (when using the desktop server).
