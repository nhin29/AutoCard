# UK License Plate Scanner - Examples

## Current UK Format (2001+)

### Example 1: `BD51 SMR`
```
┌─────────────────────┐
│ BD51 SMR            │
└─────────────────────┘

BD = Birmingham area
51 = September 2001 - February 2002
SMR = Serial number
```

### Example 2: `LK53 ABY` (with EU strip)
```
┌────────────────────────┐
│ 🇪🇺 │ LK53 ABY         │
│ GB │                  │
└────────────────────────┘

LK = London area (L) + sub-region (K)
53 = March 2003 - August 2003
ABY = Serial number

Note: Scanner extracts only "LK53ABY", ignoring EU strip
```

## How Scanner Handles Different Variations

### ✅ Standard Plate (Yellow/White background)
```
Input Image:  BD51 SMR
Scanner Output: BD51 SMR
Confidence: HIGH
```

### ✅ Plate with EU Blue Strip
```
Input Image:  [EU] GB | LK53 ABY
Scanner Output: LK53 ABY
Confidence: HIGH
Note: Automatically ignores "GB" and EU symbols
```

### ✅ Plate without spaces
```
Input Image:  BD51SMR
Scanner Output: BD51 SMR
Confidence: HIGH
Note: Automatically adds space formatting
```

### ✅ Front Plate (Yellow)
```
Input Image:  Yellow plate with BD51 SMR
Scanner Output: BD51 SMR
Confidence: HIGH
```

### ✅ Rear Plate (White)
```
Input Image:  White plate with LK53 ABY
Scanner Output: LK53 ABY
Confidence: HIGH
```

## Age Identifier Guide

The 2-digit age identifier indicates registration period:

### Format: March to August
- `01` = March 2001 - August 2001
- `02` = March 2002 - August 2002
- `51` = September 2001 - February 2002
- `53` = September 2003 - February 2004
- `23` = March 2023 - August 2023

### Format: September to February
- `51` = September 2001 - February 2002
- `53` = September 2003 - February 2004
- `73` = September 2023 - February 2024

### Calculation:
- **01-50**: Year = 2000 + number (e.g., 23 = 2023)
- **51-99**: Year = 2000 + (number - 50) (e.g., 73 = 2023)

## Regional Area Codes (First Letter)

Examples of first letter region codes:
- **A** = Anglia
- **B** = Birmingham
- **C** = Cymru (Wales)
- **D** = Deeside to Shrewsbury
- **E** = Essex
- **L** = London
- **M** = Manchester
- **S** = Scotland
- **Y** = Yorkshire

## Scanner Validation Rules

### ✅ Valid Plates
- `BD51SMR` → Formatted to `BD51 SMR`
- `LK53ABY` → Formatted to `LK53 ABY`
- `AA99ZZZ` → Formatted to `AA99 ZZZ`

### ❌ Invalid Plates
- `B51SMR` → Only 1 letter (needs 2)
- `BD5SMR` → Only 1 number (needs 2)
- `BD51SM` → Only 2 letters at end (needs 3)
- `12AB34C` → Wrong pattern
- `GBBD51SMR` → Contains GB prefix

### Scanner Behavior:
1. Extracts text from image
2. Removes "GB", "UK", spaces, and special characters
3. Validates pattern: `AA##AAA`
4. Formats with space: `AA## AAA`
5. Returns confidence level

## Testing Tips

### For Best Results:
- ✅ Good lighting (daylight or bright indoor)
- ✅ Camera 1-2 meters from plate
- ✅ Plate centered in frame
- ✅ Hold camera steady
- ✅ Avoid glare/reflections

### Common Issues:
- ❌ Too dark → Low confidence
- ❌ Too far → Can't read characters
- ❌ Angle too steep → OCR errors
- ❌ Dirty/damaged plate → Recognition fails

## Examples for Testing

Try scanning these example patterns:
1. `BD51 SMR` - Classic format
2. `LK53 ABY` - With EU strip
3. `AA12 BCD` - Standard current format
4. `XX99 YYY` - Maximum valid format
