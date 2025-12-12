# AI Compliance Scanner Demo

## Overview

This is a lightweight web application demonstrating the UX flow for an AI compliance scanner. The app showcases a two-screen workflow: a model intake form where users submit AI model details, and a findings screen that displays deterministic compliance assessment results against EU AI Act regulations.

The app now implements a **rules-based compliance engine** with 6 EU AI Act-inspired rules. Findings are computed deterministically based on the model profile, not hardcoded mock data. Explainability questions are generated dynamically from triggered rules.

**Important**: This is a demo/prototype for demonstration purposes only - not legal advice.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: React useState for local component state; form state lifted to App.tsx and passed as props
- **UI Components**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS styling
- **Form Handling**: React Hook Form with Zod schema validation
- **Data Fetching**: TanStack Query (React Query) configured but minimally used since data is computed client-side

### Key Application Flow
1. **Model Intake Screen** (`/`): Collects model name, provider, use case, and user type via a validated form
2. **Findings Screen** (`/findings`): Displays computed compliance findings and dynamic explainability Q&A
3. State flows from intake form → App.tsx (stores ModelProfile) → auditModel() → Findings page

### Compliance Engine Architecture
- **Rules Definition** (`client/src/lib/rules.ts`): 6 EU AI Act-inspired rules with:
  - `id`: Unique identifier (e.g., `rule-high-risk-provider`)
  - `description`: Human-readable rule explanation
  - `condition`: Pure function that evaluates against ModelProfile
  - `riskContribution`: `high`, `limited`, or `minimal`
  - `articles`: Related EU AI Act articles
  - `explanation`: Detailed reasoning for explainability panel

- **Audit Function** (`client/src/lib/audit.ts`): Pure `auditModel()` function that:
  - Evaluates all rules against the model profile
  - Collects triggered rules
  - Computes risk classification (highest triggered risk level)
  - Calculates confidence score based on rule matches
  - Returns `ComplianceFindings` with `triggeredRules` array

- **Question Generation**: `generateQuestionsFromRules()` creates 1:1 mapping from triggered rules to explainability questions

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Purpose**: Minimal server setup for serving static files; no API endpoints currently used for app logic
- **Storage**: In-memory storage class with user CRUD operations (prepared but unused)
- **Database Schema**: PostgreSQL schema defined with Drizzle ORM (users table only, not used by app features)

### Data Flow Pattern
- Findings are **computed deterministically** via `auditModel()` in `client/src/lib/audit.ts`
- Rules are defined in `client/src/lib/rules.ts` with condition functions
- Explainability Q&A generated from triggered rules - each rule maps to one question
- No external API calls; all logic runs client-side

### Design System
- Typography: Inter/SF Pro Display for body, JetBrains Mono for technical text
- Color tokens defined via CSS custom properties supporting light/dark mode
- Component styling follows enterprise UI patterns (Linear, Stripe Dashboard inspired)

## Recent Changes

### December 2024 - Rules Engine Implementation
- Added `client/src/lib/rules.ts` with 6 EU AI Act-inspired compliance rules
- Added `client/src/lib/audit.ts` with pure `auditModel()` function
- Extended `ComplianceFindings` type to include `triggeredRules` array
- Replaced mock findings with computed findings in `findings.tsx`
- Updated explainability panel to generate questions from triggered rules
- Added prototype disclaimer alongside existing demo disclaimer

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
