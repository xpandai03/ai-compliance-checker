# Design Guidelines: AI Compliance Scanner Demo

## Design Approach
**System-Based Approach** using modern enterprise UI patterns inspired by Linear, Stripe Dashboard, and Material Design's information architecture. This compliance tool prioritizes clarity, trust, and professional presentation over visual flair.

## Typography Hierarchy

**Primary Font**: Inter or SF Pro Display (via Google Fonts CDN)
**Monospace Font**: JetBrains Mono for technical identifiers

- **Page Titles**: text-3xl font-semibold tracking-tight
- **Section Headers**: text-xl font-semibold 
- **Card Titles**: text-lg font-medium
- **Body Text**: text-base font-normal
- **Labels**: text-sm font-medium uppercase tracking-wide
- **Data Values**: text-lg font-semibold
- **Chat Messages**: text-sm font-normal
- **Disclaimers**: text-xs

## Layout System

**Spacing Units**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Common component padding: p-6 or p-8
- Section spacing: space-y-6 or space-y-8
- Card gaps: gap-4 or gap-6
- Form field spacing: space-y-4

**Container Strategy**:
- Max width: max-w-4xl for forms, max-w-6xl for findings screen
- Centered layouts: mx-auto
- Consistent page padding: px-6 py-12

## Screen-Specific Layouts

### Model Intake Screen
- Single-column centered form (max-w-2xl)
- Vertical card layout with generous padding (p-8)
- Form fields stacked with consistent spacing (space-y-6)
- Full-width input fields
- Prominent submit button (w-full on mobile, w-auto px-12 on desktop)
- Minimal page header with app title

### Findings Screen
- Two-panel vertical layout
- **Top Panel**: Findings (authoritative) - bordered card with alert-style treatment
- **Bottom Panel**: Explainability section - separate card with distinct visual weight
- Clear visual separation between panels (mb-8)

## Component Library

### Form Components
- **Input Fields**: 
  - Bordered with focus ring treatment
  - Label above field (font-medium text-sm mb-2)
  - Height: h-11
  - Padding: px-4
  - Full width by default

- **Dropdowns/Select**:
  - Same styling as text inputs
  - Chevron icon on right
  - Matches input height

- **Primary Button**:
  - Height: h-11 or h-12
  - Padding: px-8
  - Font: font-semibold text-base
  - Full rounded corners
  - Include subtle shadow

### Findings Panel Components

- **Status Badge**: 
  - Inline badge with border
  - Padding: px-3 py-1
  - Text: text-xs font-semibold uppercase tracking-wide

- **Metric Display**:
  - Label: uppercase text-xs font-medium
  - Value: text-2xl or text-3xl font-bold
  - Stacked vertical layout

- **Data Grid**:
  - Two-column layout on desktop (grid-cols-2)
  - Single column on mobile
  - Gap: gap-6
  - Each item: label above value

- **Article List**:
  - Comma-separated inline display or
  - Badge-style pills (px-3 py-1.5 rounded-full text-sm)

- **Disclaimer Box**:
  - Border with subtle background treatment
  - Padding: p-4
  - Italic text
  - Icon: Info circle

### Explainability Panel Components

- **Section Header**:
  - Include subtitle/description
  - Border bottom for separation
  - Padding: pb-4 mb-6

- **Question Buttons**:
  - Left-aligned text buttons
  - Full width on mobile
  - Border treatment
  - Padding: px-4 py-3
  - Icon: Arrow or chevron right
  - Stack vertically: space-y-2

- **Chat Display**:
  - Message bubbles with distinct styling for Q vs A
  - Question: User-aligned (minimal styling)
  - Answer: System-aligned with border/background
  - Padding: p-4
  - Space between messages: space-y-4
  - Citations in smaller text (text-xs) with link styling

## Navigation & Flow

- **Back Navigation**: Include "← Back to Intake" link on findings screen
- **No Complex Navigation**: Single flow from intake → findings
- **App Header**: Simple text-based header with app name (text-2xl font-bold)

## Visual Hierarchy Principles

1. **Findings Authority**: Make findings panel visually prominent with border treatment and alert-style design
2. **Explainability Subordinate**: Chat section clearly secondary with lighter visual weight
3. **Data Scanning**: Easy-to-scan metrics with clear labels and large values
4. **Professional Trust**: Clean borders, ample whitespace, structured grids convey reliability

## Responsive Behavior

- **Mobile (<768px)**: 
  - Full-width components
  - Stacked layouts
  - Increased touch targets (h-12)
  
- **Desktop (≥768px)**:
  - Centered max-width containers
  - Two-column data grids
  - Inline button layouts

## Accessibility

- Consistent focus states on all interactive elements (ring-2 ring-offset-2)
- Clear label associations for form fields
- Semantic HTML (form, button, input elements)
- Sufficient contrast for text and interactive elements
- Keyboard navigation support

## Animations
**Minimal**: Page transitions only. No scroll animations, no hover effects beyond standard button states. Maintain professional, static presentation suitable for enterprise demo.

## Images
**No hero images or decorative imagery**. This is a data-focused compliance tool where visual clarity and information hierarchy take precedence over aesthetic imagery.