# AI Compliance Scanner Demo

## Overview

This is a lightweight mock web application demonstrating the UX flow for an AI compliance scanner. The app showcases a two-screen workflow: a model intake form where users submit AI model details, and a findings screen that displays mock compliance assessment results against EU AI Act regulations.

This is a **demo-only mock** - there is no real compliance engine, AI logic, or external API integrations. All compliance findings and explainability answers are hardcoded mock data.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: React useState for local component state; form state lifted to App.tsx and passed as props
- **UI Components**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS styling
- **Form Handling**: React Hook Form with Zod schema validation
- **Data Fetching**: TanStack Query (React Query) configured but minimally used since data is mocked

### Key Application Flow
1. **Model Intake Screen** (`/`): Collects model name, provider, use case, and user type via a validated form
2. **Findings Screen** (`/findings`): Displays hardcoded compliance findings and explainability Q&A
3. State flows from intake form → App.tsx (stores ModelProfile) → Findings page (receives as prop)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Purpose**: Minimal server setup for serving static files; no API endpoints currently used for app logic
- **Storage**: In-memory storage class with user CRUD operations (prepared but unused)
- **Database Schema**: PostgreSQL schema defined with Drizzle ORM (users table only, not used by app features)

### Data Flow Pattern
- Findings are **fully mocked** - `MOCK_FINDINGS` and `MOCK_QUESTIONS` constants in `client/src/lib/types.ts`
- No risk engine or audit function exists; "Run Compliance Scan" button simply navigates to findings page
- Explainability answers are static strings with hardcoded citations, not dynamically generated

### Design System
- Typography: Inter/SF Pro Display for body, JetBrains Mono for technical text
- Color tokens defined via CSS custom properties supporting light/dark mode
- Component styling follows enterprise UI patterns (Linear, Stripe Dashboard inspired)

## External Dependencies

### Database
- **Drizzle ORM** with PostgreSQL dialect configured
- Schema in `shared/schema.ts` defines a users table (not actively used by current features)
- Database URL expected via `DATABASE_URL` environment variable

### UI Framework Dependencies
- **Radix UI**: Full suite of accessible primitive components (dialog, select, accordion, etc.)
- **Tailwind CSS**: Utility-first styling with custom theme configuration
- **class-variance-authority**: Component variant management for shadcn/ui

### Build & Development
- **Vite**: Frontend bundling with React plugin and HMR
- **esbuild**: Server-side bundling for production
- **Replit plugins**: Development banner and cartographer for Replit environment

### Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation for form inputs and type safety
- **@hookform/resolvers**: Zod integration with React Hook Form