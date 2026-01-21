# UK License Plate Format

## Current Format (September 2001 - Present)

### Pattern: `BD51 SMR`

```
┌─────────────────────────────────────────────────┐
│  BD  │  51  │  SMR  │                          │
│ Area │ Age  │Random │                          │
│ Code │  ID  │Letters│                          │
└─────────────────────────────────────────────────┘
```

### Components:

1. **Area Code** (2 letters)
   - First 2 letters identify the region
   - Example: `BD` = Birmingham

2. **Age Identifier** (2 numbers)
   - Indicates the 6-month period when the vehicle was registered
   - Example: `51` = September 2001 - February 2002
   - Numbers 01-50: March to August
   - Numbers 51-99: September to February

3. **Random Letters** (3 letters)
   - Unique identifier for the vehicle
   - Example: `SMR`

### Format:
- **Total**: 7 characters
- **Pattern**: `AA##AAA` (A = letter, # = number)
- **With space**: `AA## AAA`
- **Example**: `BD51 SMR`

## Scanner Implementation

The scanner validates this format:
- ✅ Exactly 2 letters (area code)
- ✅ Exactly 2 numbers (age identifier)
- ✅ Exactly 3 letters (random)
- ✅ Total 7 characters
- ✅ Auto-formats with space: `BD51SMR` → `BD51 SMR`

## Other UK Formats Supported

### Prefix Format (1983-2001)
- Pattern: `A123 BCD`
- Example: `H456 SMR`

### Suffix Format (1963-1983)
- Pattern: `ABC 123D`
- Example: `SMR 123D`

### Dateless Format (pre-1963)
- Pattern: `ABC 123`
- Example: `SMR 123`

## Distinguishing Signs (Optional)

### EU Blue Strip (Optional)
Some plates may have a blue strip on the left with:
- 🇪🇺 EU circle of stars
- `GB` country code
- This is optional and not part of the registration number

### Example with EU Strip: `LK53 ABY`

```
┌────────────────────────────────────────┐
│ 🇪🇺 │ LK53 ABY                        │
│ GB │                                  │
└────────────────────────────────────────┘
```

### Breakdown of `LK53 ABY`:
- **L** = First letter (Region: London area)
- **K** = Second letter (Sub-region within London)
- **53** = Age identifier (March 2003 - August 2003)
- **ABY** = Serial number (random letters)

## Important Notes

- **Front plates**: Yellow background, black text
- **Rear plates**: White background, black text
- **Blue strip**: Optional, contains EU flag and GB code
- **Registration only**: `LK53 ABY` (ignore blue strip for scanning)
- All uppercase letters
- No special characters in the main registration
- Total 7 characters: 2 letters + 2 numbers + 3 letters
