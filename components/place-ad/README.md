# Place Ad Components

This directory contains modular components for the Place Ad screen, breaking down the large monolithic file into smaller, maintainable components.

## Component Structure

### Shared Components
- **DropdownModal** - Reusable dropdown modal for selecting options
- **ImagePickerModal** - Bottom sheet modal for selecting image source (camera, library, files)
- **FormInput** - Reusable form input with label and description
- **shared-styles.ts** - Shared StyleSheet definitions
- **types.ts** - Shared TypeScript interfaces

### Main Components
- **PlaceAdHeader** - Header with back button, title, and reset button
- **CategorySelector** - Category selection dropdown
- **ContactFields** - Phone number and location inputs
- **PriceInput** - Price input with currency selector
- **DescriptionInput** - Multi-line description textarea
- **SubscriptionBanner** - Subscription and billing information
- **PlaceAdActions** - Action buttons (Publish, Preview, Save Draft)

### Complex Components (To Be Created)
- **ImageUploader** - Image upload, editing, and management
- **StoryUploader** - Story upload and management
- **VehicleFields** - Dynamic vehicle-related fields (license, status, ad type, mileage, MOT/NCT, van fields)

## Usage Example

```tsx
import { PlaceAdHeader } from '@/components/place-ad/PlaceAdHeader';
import { CategorySelector } from '@/components/place-ad/CategorySelector';
import { ContactFields } from '@/components/place-ad/ContactFields';
import { PriceInput } from '@/components/place-ad/PriceInput';
import { DescriptionInput } from '@/components/place-ad/DescriptionInput';
import { SubscriptionBanner } from '@/components/place-ad/SubscriptionBanner';
import { PlaceAdActions } from '@/components/place-ad/PlaceAdActions';

// Use in your main component
<PlaceAdHeader onBack={handleBack} onReset={handleReset} />
<CategorySelector {...categoryProps} />
<ContactFields {...contactProps} />
<PriceInput {...priceProps} />
<DescriptionInput {...descriptionProps} />
<SubscriptionBanner onUpgradePlan={handleUpgrade} />
<PlaceAdActions onPublish={handlePublish} />
```

## Benefits

1. **Maintainability** - Smaller, focused components are easier to understand and modify
2. **Reusability** - Components can be reused in other parts of the app
3. **Testability** - Smaller components are easier to test
4. **Performance** - Better code splitting and optimization opportunities
5. **Collaboration** - Multiple developers can work on different components simultaneously
