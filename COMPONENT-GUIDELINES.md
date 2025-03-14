# Simple Tracker Component Guidelines

## Core Principles

This document outlines the guidelines and best practices for component development in the Simple Tracker application. Following these principles will ensure consistency, maintainability, and a high-quality user experience.

## Component Architecture

We follow a layered component architecture:

```
UI Primitives → Common Elements → Feature Components → Page Components
```

### Layer 1: UI Primitives (`/src/components/ui/`)

- **Purpose**: Basic building blocks with no business logic
- **Examples**: Buttons, inputs, cards, dialogs
- **Implementation**: Based on shadcn/ui with design tokens
- **Naming**: `button.tsx`, `card.tsx`, `dialog.client.tsx`

### Layer 2: Common Elements (`/src/components/common/`)

- **Purpose**: Shared UI patterns used across features
- **Examples**: Error messages, loading spinners, success banners
- **Implementation**: Composed from UI primitives
- **Naming**: `error-message.tsx`, `loading-spinner.tsx`

### Layer 3: Feature Components (`/src/components/feature/`)

- **Purpose**: Components specific to a feature domain
- **Examples**: Ticket counters, calendar views
- **Implementation**: Organized by feature domain
- **Naming**: `tickets/Counter.client.tsx`, `calendar/MonthView.tsx`

### Layer 4: Route-Specific Components (`/src/app/*/_components/`)

- **Purpose**: Components used only within a specific route
- **Examples**: Page-specific layouts, route-specific forms
- **Implementation**: Colocated with their route
- **Naming**: `app/employee/calendar/_components/CalendarView.tsx`

## Client vs. Server Component Guidelines

### Server Components (`.tsx`)

- Use for components that:
  - Don't need interactivity
  - Primarily fetch and display data
  - Don't use browser APIs or React hooks
  - Benefit from server-side rendering

- Best practices:
  - Fetch data directly in the component
  - Keep logic simple and focused on data transformation
  - Avoid passing event handlers as props
  - Use for static content and layouts

### Client Components (`.client.tsx`)

- Use for components that:
  - Require interactivity
  - Use React hooks
  - Need access to browser APIs
  - Manage local state

- Best practices:
  - Add the `.client.tsx` suffix to filename
  - Use the `'use client'` directive at the top
  - Keep client components as small as possible
  - Minimize the number of client components

## Code Style and Clarity

- **Favor clear, readable code over clever optimizations**
  - Write code that is easy to understand and maintain
  - Avoid premature optimization
  - Use descriptive variable and function names

- **Use descriptive names that explain purpose**
  - Component names should reflect their functionality
  - Prop names should be clear and descriptive
  - Avoid abbreviations unless they are widely understood

- **Break complex operations into smaller, understandable steps**
  - Extract complex logic into helper functions
  - Keep component methods focused on a single task
  - Use comments to explain complex logic

- **Keep indentation and formatting consistent**
  - Follow the project's formatting rules
  - Use consistent spacing and indentation
  - Organize imports in a consistent manner

## Component Design Patterns

### Composition Over Inheritance

- Prefer component composition over inheritance
- Use children props to create flexible components
- Create specialized components by composing simpler ones

### Controlled vs. Uncontrolled Components

- Prefer controlled components for form elements
- Use uncontrolled components only for simple, isolated inputs
- Document clearly whether a component is controlled or uncontrolled

### Compound Components

- Use compound components for complex UI patterns
- Example: The Wizard pattern with container and step components
- Maintain clear relationships between parent and child components

### Props API Design

- Keep props API simple and focused
- Use sensible defaults for optional props
- Document prop types and requirements thoroughly
- Consider using prop destructuring for clarity

## State Management

### Component State

- Use `useState` for simple, component-specific state
- Use `useReducer` for complex state logic
- Keep state as close as possible to where it's used

### Global State

- Use Zustand for app-wide state management
- Create focused stores for specific domains
- Implement proper persistence with localStorage
- Document store structure and update patterns

### Form State

- Use React Hook Form for form state management
- Implement Zod schemas for validation
- Keep validation logic separate from UI components
- Handle form submission and errors consistently

## Animation Guidelines

- Use Framer Motion for all animations
- Implement proper reduced motion support
- Use spring physics for natural motion
- Keep animations subtle and purposeful
- Ensure animations enhance rather than hinder UX

## Error Handling

- Validate inputs early
- Provide clear error messages
- Implement proper error boundaries
- Handle API errors gracefully
- Display user-friendly error states

## Accessibility

- Ensure all interactive elements are keyboard accessible
- Add proper ARIA attributes where needed
- Support screen readers with appropriate labels
- Implement focus management for modals and dialogs
- Test with keyboard-only navigation

## Mobile Optimization

- Design for mobile-first
- Ensure touch targets are at least 44×44px
- Implement swipe gestures where appropriate
- Use bottom sheets for selection interfaces
- Test on various screen sizes and orientations

## Documentation

- Add JSDoc comments for component props
- Document component purpose and usage
- Explain complex logic and edge cases
- Keep documentation close to the code
- Update docs when making significant changes

## Testing Considerations

- Write tests for complex business logic
- Test component behavior, not implementation details
- Verify accessibility requirements
- Test with different prop combinations
- Ensure proper error handling

## Wizard Component Structure

The ticket submission wizard follows a compound component pattern:

1. **Container**: `WizardContainer.client.tsx` - Manages overall state and flow
2. **Navigation**: `WizardNavigation.client.tsx` - Handles step transitions
3. **Progress**: `WizardProgress.client.tsx` - Shows completion status
4. **Steps**: Individual step components for each wizard stage:
   - `BasicInfoStep.client.tsx`
   - `CategoriesStep.client.tsx`
   - `ImageUploadStep.client.tsx`
   - `ConfirmationStep.client.tsx`

## Naming Conventions

1. **PascalCase** for component names
2. **kebab-case** for file names (except components)
3. **camelCase** for variables, functions, and props
4. `.client.tsx` suffix for Client Components
5. `.tsx` suffix for Server Components (default)
6. `_components` directory for route-specific components

By following these guidelines, we'll create a consistent, maintainable, and high-quality component library for the Simple Tracker application.
