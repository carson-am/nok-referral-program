# Landing Page Refinements Plan

## Overview
Refinements to the landing/login page (`src/app/(auth)/page.tsx`) to improve alignment, text formatting, and input field presentation.

## Changes Required

### 1. Left Column Alignment
**Current State:**
- Logo uses `items-start` alignment (left-aligned)
- Headline and sub-headline are in a nested div with `space-y-4`
- Logo and text are not center-aligned relative to each other

**Target State:**
- Logo, headline, and sub-headline should be center-aligned relative to each other
- Logo should sit directly above the headline
- Maintain clean, professional spacing

**Implementation:**
- Change `NokLogo` component from `items-start` to `items-center`
- Update the left column container to use `items-center` or `text-center` for center alignment
- Ensure the logo container and text container are both centered
- Maintain existing `space-y-6` spacing between logo and text section
- Keep `space-y-4` within the text section for headline/sub-headline spacing

**Files to Modify:**
- `src/app/(auth)/page.tsx` (lines 11-20 for NokLogo, lines 32-43 for left column layout)

### 2. Card Text Correction
**Current State:**
- Card description: "Provide your credentials to access the Nok Referral Partner dashboard"
- Missing period at the end

**Target State:**
- Add period: "Provide your credentials to access the Nok Referral Partner dashboard."

**Implementation:**
- Add period to the end of the CardDescription text

**Files to Modify:**
- `src/app/(auth)/page.tsx` (line 50)

### 3. Input Field Placeholders
**Current State:**
- Email input has placeholder: `"you@company.com"`
- Password input has placeholder: `"••••••••"`

**Target State:**
- Both inputs should have empty placeholders (no placeholder text)
- Fields appear completely empty until user types

**Implementation:**
- Remove `placeholder` prop from Email input (line 66)
- Remove `placeholder` prop from Password input (line 76)
- Keep all other input attributes (type, autoComplete, required, etc.)

**Files to Modify:**
- `src/app/(auth)/page.tsx` (lines 63-69 for Email input, lines 73-79 for Password input)

## Implementation Details

### Left Column Structure
```tsx
<div className="flex flex-col items-center space-y-6">
  <NokLogo /> {/* Now center-aligned */}
  <div className="space-y-4 text-center">
    <h1>...</h1>
    <p>...</p>
  </div>
</div>
```

### NokLogo Component
```tsx
<div className="flex flex-col items-center"> {/* Changed from items-start */}
  <span>nok</span>
  <span>RECOMMERCE</span>
</div>
```

## Testing Checklist
- [ ] Logo is center-aligned above headline
- [ ] Headline and sub-headline are center-aligned
- [ ] Spacing between logo and text remains clean and professional
- [ ] Card description ends with a period
- [ ] Email input field has no placeholder text
- [ ] Password input field has no placeholder text
- [ ] Form still functions correctly (validation, submission)
- [ ] Layout remains responsive on mobile/tablet/desktop
- [ ] Visual hierarchy and "airy" aesthetic is maintained

## Notes
- All changes are cosmetic/layout refinements
- No functional changes to form behavior
- Maintains existing dark theme and styling
- Preserves accessibility (labels remain, autoComplete attributes remain)
