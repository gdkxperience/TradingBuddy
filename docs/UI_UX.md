# User Interface & User Experience Specification

## Layout

### Structure
- **Header:** Application title and icon
- **Mode Selector:** Toggle between Forward and Reverse calculation
- **Two-column grid layout (responsive):**
  - Left: Input parameters card
  - Right: Calculation results card

### Responsive Design
- **Desktop:** Two-column layout
- **Tablet/Mobile:** Single column stack
- Breakpoint: `md` (768px) in Tailwind

## Components

### Input Components

**Text Inputs:**
- Numeric inputs for values (Account Size, Prices, etc.)
- Placeholder text with example values
- Labels with helpful descriptions
- Step attributes for decimal inputs (0.01 for prices)

**Select Dropdown:**
- Trade Type selection (Long/Short)
- Clear labels indicating margin requirements

**Labels:**
- Descriptive text above inputs
- Helpful hints below inputs
- Optional field indicators

### Output Components

**Result Cards:**
- Card-based result display
- Clear typography hierarchy
- Highlighted primary result (Trade Value / Max Shares)
- Consistent spacing and padding

**Color-coded Indicators:**
- **Green:** Safe/affordable trades
- **Red:** Cannot afford (forward mode)
- **Yellow:** High risk (reverse mode)
- Icons for visual clarity (CheckCircle2, AlertCircle)

**Empty States:**
- Neutral icon (TrendingUp)
- Helpful message
- Centered layout

## Visual Design

### Color Scheme

#### Light Mode
- **Background:** Slate gradient (slate-50 to slate-100)
- **Cards:** White background
- **Primary:** Dark slate
- **Success:** Green-50/Green-500
- **Warning:** Yellow-50/Yellow-500
- **Error:** Red-50/Red-500
- **Muted:** Gray tones for secondary text

#### Dark Mode
- **Background:** Slate gradient (slate-900 to slate-800)
- **Cards:** Dark slate background
- **Primary:** Light slate
- **Success:** Green-950/Green-400
- **Warning:** Yellow-950/Yellow-400
- **Error:** Red-950/Red-400
- **Muted:** Light gray tones for secondary text

### Typography

**Hierarchy:**
- **H1:** 4xl, bold (Page title)
- **H2:** 2xl, semibold (Card titles)
- **Body:** sm/base (Content)
- **Small:** xs (Hints and descriptions)

**Font:** System font stack (default)

### Spacing

**Consistent spacing scale:**
- Small gaps: 2 (0.5rem)
- Medium gaps: 4 (1rem)
- Large gaps: 6 (1.5rem)
- Card padding: 6 (1.5rem)

### Icons

**Icon Library:** Lucide React

**Icons Used:**
- Calculator (Main app icon)
- TrendingUp (Empty state)
- AlertCircle (Warnings/Errors)
- CheckCircle2 (Success states)

## User Experience

### Interaction Patterns

**Real-time Updates:**
- Calculations update immediately on input change
- No submit button required
- Instant feedback

**Visual Feedback:**
- Color-coded results
- Clear success/warning/error states
- Icons reinforce messages

**Accessibility:**
- Semantic HTML
- Proper label associations
- Keyboard navigation support
- Screen reader friendly

### User Flow

1. **Landing:** User sees mode selector
2. **Mode Selection:** Click Forward or Reverse button
3. **Input:** Fill in required fields
4. **Calculation:** Results appear automatically
5. **Review:** User reviews results and adjusts if needed

### Error States

**Empty State:**
- Neutral icon
- Helpful message: "Fill in all fields to see calculations"
- No error styling

**Invalid Input:**
- Results simply not shown
- No error messages displayed
- User can continue typing

### Success States

**Affordable Trade:**
- Green background
- CheckCircle2 icon
- Positive message

**High Risk:**
- Yellow/Red background
- AlertCircle icon
- Warning message

---

**Last Updated:** 2025-01-27
