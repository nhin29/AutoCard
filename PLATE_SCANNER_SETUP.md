# UK License Plate Scanner Setup

## Overview

Simple camera-based UK license plate scanner using:
- **expo-camera** - Captures photos
- **OpenAI Vision API** - OCR for plate recognition
- **UK plate validation** - Validates all UK formats

## Setup (2 minutes)

### 1. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Copy your API key (starts with `sk-`)

### 2. Configure Environment

```bash
# Create .env file
cp .env.example .env

# Add your OpenAI API key
echo "EXPO_PUBLIC_OPENAI_API_KEY=sk-your-key-here" > .env
```

### 3. Run the App

```bash
# Start development server
npm start
```

## How It Works

1. User opens camera scanner
2. User positions camera at license plate
3. User taps capture button
4. Photo is taken with expo-camera
5. Image is sent to OpenAI Vision API
6. Plate number is extracted and validated
7. UK format validation ensures accuracy
8. Plate is formatted with proper spacing
9. Result is passed to place-ad screen

## UK Plate Formats Supported

✅ **Current** (2001+): `AB12 CDE`  
✅ **Prefix** (1983-2001): `A123 BCD`  
✅ **Suffix** (1963-1983): `ABC 123D`  
✅ **Dateless** (pre-1963): `ABC 123`

## Features

- ✅ Simple camera capture
- ✅ OpenAI Vision OCR
- ✅ UK plate validation
- ✅ Automatic formatting
- ✅ Confidence scoring
- ✅ Error handling
- ✅ Manual entry fallback

## Cost

- **OpenAI API**: ~$0.01 per scan (gpt-4o vision)
- Very cost-effective for low-medium volume

## Files

- `services/plateScannerService.ts` - Scanner service with UK validation
- `services/openaiVision.ts` - OpenAI Vision API integration
- `app/(tabs)/camera-scanner.tsx` - Camera UI

## Usage

```typescript
import { scanUKPlate } from '@/services/plateScannerService';

// Scan a captured image
const result = await scanUKPlate(imageUri, openaiApiKey);

if (result.plateNumber) {
  console.log('Plate:', result.plateNumber);
  console.log('Confidence:', result.confidence);
}
```

## Troubleshooting

### "API Key Required" error
- Check `.env` file exists
- Verify `EXPO_PUBLIC_OPENAI_API_KEY` is set
- Restart dev server: `npm start`

### Low accuracy
- Ensure good lighting
- Keep plate centered in frame
- Hold camera steady
- Try from 1-2 meters distance

### "No plate detected"
- Check if plate is clearly visible
- Try different angle
- Ensure white/yellow plate background
- Use manual entry as fallback

## Next Steps

1. ✅ Get OpenAI API key
2. ✅ Add to `.env` file  
3. ✅ Run `npm start`
4. ✅ Test camera scanner
5. ✅ Scan a UK license plate

Done! 🎉
