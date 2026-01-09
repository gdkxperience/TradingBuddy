# Technical Specification

## Technology Stack

### Frontend Framework
- **React:** 18.2.0
- **TypeScript:** 5.2.2
- **Vite:** 5.0.8 (Build tool and dev server)

### UI Framework
- **Tailwind CSS:** 3.4.0 (Styling)
- **shadcn/ui:** Component library
- **Lucide React:** 0.344.0 (Icons)

### Core Dependencies
- **class-variance-authority:** 0.7.0
- **clsx:** 2.1.0
- **tailwind-merge:** 2.2.0
- **@radix-ui/react-label:** 2.0.2
- **@radix-ui/react-slot:** 1.0.2

### Development Tools
- **ESLint:** Code linting
- **TypeScript:** Type checking
- **PostCSS & Autoprefixer:** CSS processing

## Project Structure

```
Trading_Buddy/
├── src/
│   ├── components/
│   │   └── ui/          # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       └── select.tsx
│   ├── lib/
│   │   └── utils.ts      # Utility functions (cn helper)
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles and Tailwind imports
├── docs/                 # Documentation
├── public/               # Static assets
├── dist/                 # Build output (generated)
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
├── vercel.json           # Vercel deployment configuration
└── README.md             # Project documentation
```

## Build Configuration

### TypeScript Configuration

**File:** `tsconfig.json`

- Target: ES2020
- Module: ESNext
- JSX: react-jsx
- Path aliases: `@/*` → `./src/*`
- Strict mode enabled
- Module resolution: bundler

### Vite Configuration

**File:** `vite.config.ts`

- React plugin enabled
- Path alias resolution for `@/` imports
- Production optimizations enabled
- ESM module format

### Tailwind Configuration

**File:** `tailwind.config.js`

- Custom color scheme (shadcn/ui theme)
- Dark mode support (class-based)
- Responsive breakpoints
- Custom animations
- Content paths configured

## Development Setup

### Prerequisites
- Node.js 18.x or higher
- npm, yarn, or pnpm

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Starts development server at `http://localhost:5173`

### Build

```bash
npm run build
```

Outputs to `dist/` directory

### Linting

```bash
npm run lint
```

## Performance Requirements

### Build Performance
- Build time: < 5 seconds
- Bundle size: Optimized with Vite
- Code splitting: Automatic with Vite

### Runtime Performance
- Initial load: < 2 seconds
- Calculation updates: Real-time (on input change)
- No noticeable lag for calculations

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features required
- Responsive design for mobile devices

## Code Organization

### Component Structure
- UI components in `src/components/ui/`
- Main application logic in `src/App.tsx`
- Utility functions in `src/lib/utils.ts`
- Global styles in `src/index.css`

### Type Definitions
- TypeScript interfaces defined inline
- TradeType: `'long' | 'short'`
- CalculationResult interface for return types

### State Management
- React hooks (useState) for local state
- No external state management library required
- Real-time calculations on input change

---

**Last Updated:** 2025-01-27
