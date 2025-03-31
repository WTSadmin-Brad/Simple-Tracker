---
title: Simple Tracker Frontend Architecture
date: 2025-03-27
tags: [frontend, components, ui, architecture, documentation, reference, patterns]
status: official
author: Development Team
---

# Simple Tracker Frontend Architecture

## Table of Contents

1. [Overview](#overview)
2. [Component Architecture](#component-architecture)
3. [UI Primitives](#ui-primitives)
4. [Common Components](#common-components)
5. [Feature Components](#feature-components)
6. [Page Components](#page-components)
7. [State Management](#state-management)
8. [Form Management](#form-management)
9. [Animation Patterns](#animation-patterns)
10. [Responsive Design](#responsive-design)
11. [Best Practices](#best-practices)

## Overview

### Purpose

This document describes the frontend architecture, component patterns, and UI implementation details of the Simple Tracker application. It serves as a guide for developers to understand the frontend organization, component composition patterns, and design system integration.

### Frontend Architecture Principles

Simple Tracker's frontend is built on these core principles:

1. **Component-Driven Design**: UI built from reusable, composable components
2. **Type Safety**: Comprehensive TypeScript interfaces for all components and props
3. **Consistent Patterns**: Standardized patterns for component composition and state management
4. **Accessibility First**: WCAG 2.2 AA compliance built into all components
5. **Performance Optimization**: Efficient rendering and code splitting

### Core Frameworks and Libraries

- **Next.js 15.3.0 (App Router)**: For server/client component separation and routing
- **React 19**: Core UI library with hooks and function components
- **TypeScript 5.8.2**: For type safety and developer experience
- **Tailwind CSS 4.0.13**: For utility-first styling
- **shadcn/ui 0.9.5**: For consistent, accessible UI primitives
- **Framer Motion 12.5.0**: For animations and micro-interactions
- **React Hook Form 7.54.2**: For form state management and validation
- **Zod 3.24.2**: For runtime type validation

## Component Architecture

Simple Tracker uses a layered component architecture that promotes reusability, maintainability, and separation of concerns.

### Component Layer Hierarchy

1. **UI Primitives** (`/src/components/ui/`)
   - Basic building blocks (buttons, inputs, cards)
   - Based on shadcn/ui components with consistent styling
   - Minimal business logic, focused on presentation

2. **Common Components** (`/src/components/common/`)
   - Shared UI patterns used across features
   - Composed from UI primitives with specific styling/behavior
   - Examples: error messages, loading spinners, bottom sheets

3. **Feature Components** (`/src/components/feature/`)
   - Domain-specific components organized by feature area
   - Encapsulate business logic for specific domains
   - Examples: ticket counters, calendar views, wizard steps

4. **Page Components** (`/src/app/*/page.tsx` and `/src/app/*/_components/`)
   - Components specific to a single page or route
   - Combine feature components into full pages
   - Handle page-level data fetching and routing

### Server vs. Client Components

Next.js App Router distinguishes between server and client components:

- **Server Components** (`.tsx`)
  - Render on the server
  - Cannot use hooks or browser APIs
  - Used for static content and data fetching
  - Default unless specified otherwise

- **Client Components** (`.client.tsx`)
  - Run in the browser
  - Can use React hooks and browser APIs
  - Used for interactive components
  - Explicitly marked with `.client.tsx` suffix

```tsx
// Server component (default)
// src/components/feature/tickets/ticket-list.tsx
export default function TicketList({ tickets }) {
  return (
    <ul>
      {tickets.map(ticket => (
        <li key={ticket.id}>{ticket.title}</li>
      ))}
    </ul>
  );
}

// Client component
// src/components/feature/tickets/counter.client.tsx
'use client';

import { useState } from 'react';

export default function Counter({ initialValue = 0 }) {
  const [count, setCount] = useState(initialValue);
  
  return (
    <div>
      <button onClick={() => setCount(count - 1)}>-</button>
      <span>{count}</span>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

### Component Composition Patterns

Simple Tracker follows these component composition patterns:

1. **Composition Over Inheritance**
   - Components are composed from smaller pieces
   - Higher-order components are used sparingly
   - Props and children for configuration

2. **Prop Drilling Minimization**
   - Context or state management for deeply nested data
   - Compound components for related UI elements

3. **Container/Presentation Pattern**
   - Container components handle data and logic
   - Presentation components focus on rendering
   - Clear separation of concerns

```tsx
// Container component (handles data and logic)
function TicketListContainer() {
  const { data, isLoading, error } = useTickets();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <TicketList tickets={data} />;
}

// Presentation component (focuses on rendering)
function TicketList({ tickets }) {
  return (
    <ul>
      {tickets.map(ticket => (
        <li key={ticket.id}>{ticket.title}</li>
      ))}
    </ul>
  );
}
```

## UI Primitives

UI primitives form the foundation of the component library and provide consistent, accessible building blocks for the application.

### Base Components

The application uses shadcn/ui components as its UI primitives, with customizations for the Simple Tracker design system.

#### Button

```tsx
import { Button } from "@/components/ui/button";

// Usage
<Button variant="default">Submit</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="ghost">Subtle Action</Button>
<Button variant="link">Learn more</Button>
```

#### Input

```tsx
import { Input } from "@/components/ui/input";

// Usage
<Input type="text" placeholder="Enter text" />
<Input type="email" placeholder="Enter email" disabled />
```

#### Card

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Usage
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>
```

### Design System Integration

UI primitives implement the design tokens defined in the design system:

- **Colors**: Primary, secondary, accent, and status colors
- **Typography**: Font families, sizes, weights, and line heights
- **Spacing**: Consistent spacing scale
- **Shadows**: Layered shadow system
- **Borders**: Border radius and width
- **Animations**: Duration and easing functions

### Styling Approach

The application uses Tailwind CSS for styling with a consistent approach:

1. **Utility-First**: Tailwind classes for most styling needs
2. **CSS Variables**: For theming and design tokens
3. **Component Variants**: Using class-variance-authority (cva) for variants
4. **Global Styles**: Minimal global styles for base elements
5. **Custom Components**: Composition of utilities into reusable patterns

### Accessibility Considerations

All UI primitives include built-in accessibility features:

1. **Keyboard Navigation**: Tab order and focus management
2. **Screen Reader Support**: ARIA attributes and semantic HTML
3. **Color Contrast**: WCAG AA compliant color combinations
4. **Reduced Motion**: Support for prefers-reduced-motion
5. **Focus Indicators**: Visible focus states for keyboard users

## Common Components

Common components are shared UI patterns built from UI primitives and used across multiple features.

### ErrorMessage

Displays error messages with consistent styling and retry capabilities.

```tsx
import { AlertTriangle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  retry?: () => void;
}

export function ErrorMessage({ message, retry }: ErrorMessageProps) {
  return (
    <div className="rounded-md bg-destructive/15 p-4 text-destructive">
      <div className="flex items-center">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <p>{message}</p>
      </div>
      {retry && (
        <button
          className="mt-2 text-sm underline"
          onClick={retry}
        >
          Try again
        </button>
      )}
    </div>
  );
}
```

### LoadingSpinner

Displays a loading indicator with optional text.

```tsx
interface LoadingSpinnerProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ text, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`animate-spin rounded-full border-4 border-primary border-t-transparent ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}
```

### BottomSheet

Mobile-friendly bottom sheet component for selection interfaces and mobile forms.

```tsx
'use client';

import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  height?: "sm" | "md" | "lg" | "full";
}

export function BottomSheet({
  open,
  onClose,
  children,
  title,
  height = "md",
}: BottomSheetProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const heightClasses = {
    sm: "h-1/3",
    md: "h-1/2",
    lg: "h-2/3",
    full: "h-[85vh]",
  };
  
  if (!open) return null;
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={prefersReducedMotion ? { duration: 0.1 } : {
          type: "spring",
          damping: 25,
          stiffness: 300,
        }}
        className={`fixed bottom-0 left-0 right-0 bg-background rounded-t-lg p-4 pb-8 shadow-lg z-50 overflow-auto ${heightClasses[height]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "bottom-sheet-title" : undefined}
      >
        <div className="flex justify-between items-center mb-4">
          {title && (
            <h2 id="bottom-sheet-title" className="text-lg font-medium">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </>
  );
}
```

### EmptyState

Displays a message when there is no data to show, with optional actions.

```tsx
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-medium">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
```

## Feature Components

Feature components are domain-specific components that encapsulate business logic for specific features.

### Tickets Feature Components

#### Counter

Interactive counter component for ticket categories with color feedback.

```tsx
'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface CounterProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function Counter({
  label,
  value,
  onChange,
  min = 0,
  max = 150,
  step = 1,
}: CounterProps) {
  const prefersReducedMotion = useReducedMotion();
  const [prevValue, setPrevValue] = useState(value);
  
  useEffect(() => {
    // Optional haptic feedback when crossing thresholds
    if ((prevValue < 85 && value >= 85) || 
        (prevValue < 125 && value >= 125) ||
        (prevValue > 0 && value === 0)) {
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
    setPrevValue(value);
  }, [value, prevValue]);
  
  // Get color based on value
  const getColorClass = () => {
    if (value === 0) return "text-[hsl(var(--counter-red))]";
    if (value < 85) return "text-[hsl(var(--counter-yellow))]";
    if (value < 125) return "text-[hsl(var(--counter-green))]";
    return "text-[hsl(var(--counter-gold))]";
  };

  return (
    <div className="text-center">
      <h3 className="text-lg font-medium mb-4">{label}</h3>
      <div className="flex items-center justify-center space-x-4">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
          className="h-12 w-12 rounded-full p-0"
          aria-label={`Decrease ${label}`}
        >
          -
        </Button>
        
        <div className="relative w-16 h-16 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={value}
              initial={prefersReducedMotion ? {} : { y: 10, opacity: 0 }}
              animate={prefersReducedMotion ? {} : { y: 0, opacity: 1 }}
              exit={prefersReducedMotion ? {} : { y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`text-4xl font-bold ${getColorClass()}`}
            >
              {value}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
          className="h-12 w-12 rounded-full p-0"
          aria-label={`Increase ${label}`}
        >
          +
        </Button>
      </div>
      
      {value === max && (
        <p className="text-sm text-muted-foreground mt-2">
          Maximum value reached
        </p>
      )}
    </div>
  );
}
```

### Wizard Components

The ticket submission workflow uses a multi-step wizard pattern with specialized components.

#### WizardContainer

```tsx
'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";

interface WizardContainerProps {
  steps: {
    id: number;
    component: React.ReactNode;
  }[];
  onComplete: (data: any) => void;
  initialStep?: number;
  onCancel?: () => void;
}

export function WizardContainer({
  steps,
  onComplete,
  initialStep = 1,
  onCancel,
}: WizardContainerProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const prefersReducedMotion = useReducedMotion();
  
  const goToNextStep = () => {
    if (currentStep < steps.length) {
      setDirection('forward');
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete({}); // In a real implementation, this would have the wizard data
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setDirection('backward');
      setCurrentStep(prev => prev - 1);
    } else if (onCancel) {
      onCancel();
    }
  };
  
  return (
    <div className="wizard">
      {/* Progress indicator */}
      <div className="wizard-progress mb-8">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`step-indicator ${currentStep === index + 1 ? 'active' : ''} 
                ${currentStep > index + 1 ? 'completed' : ''}`}
            >
              <div className="step-number">{index + 1}</div>
            </div>
          ))}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Step content with animation */}
      <div className="wizard-content">
        {!prefersReducedMotion ? (
          <motion.div
            key={currentStep}
            initial={{ x: direction === 'forward' ? 300 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction === 'forward' ? -300 : 300, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300
            }}
          >
            {steps.find(step => step.id === currentStep)?.component}
          </motion.div>
        ) : (
          <div>
            {steps.find(step => step.id === currentStep)?.component}
          </div>
        )}
      </div>
      
      {/* Navigation buttons */}
      <div className="wizard-navigation mt-8 flex justify-between">
        <button 
          className="btn-previous"
          onClick={goToPreviousStep}
        >
          {currentStep === 1 && onCancel ? 'Cancel' : 'Previous'}
        </button>
        <button 
          className="btn-next"
          onClick={goToNextStep}
        >
          {currentStep === steps.length ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
}
```

## Page Components

Page components are route-specific and combine feature components into full pages. They handle routing, data fetching, and page-level state.

### Page Layout Structure

Page components follow a consistent layout structure:

```tsx
// src/app/tickets/page.tsx
import { Suspense } from 'react';
import { getTickets } from '@/lib/api/ticketApi';
import TicketList from '@/components/feature/tickets/ticket-list.client';
import LoadingSpinner from '@/components/common/loading-spinner';
import PageHeader from '@/components/layout/page-header';

export default async function TicketsPage() {
  // Server-side data fetching
  const initialTickets = await getTickets({});
  
  return (
    <div className="container py-8">
      <PageHeader 
        title="Tickets" 
        actions={<CreateTicketButton />}
      />
      
      <Suspense fallback={<LoadingSpinner text="Loading tickets..." />}>
        {/* Pass initial data to client component */}
        <TicketList initialData={initialTickets.data} />
      </Suspense>
    </div>
  );
}
```

### Data Fetching Patterns

Page components use different data fetching patterns based on requirements:

1. **Server Components**: Direct data fetching in async components
   ```tsx
   // Direct server component data fetching
   export default async function ProfilePage() {
     const user = await getUser();
     return <ProfileDetails user={user} />;
   }
   ```

2. **Client Components**: TanStack Query for client-side data fetching
   ```tsx
   'use client';
   
   // Client-side data fetching with TanStack Query
   export default function TicketListPage() {
     const { data, isLoading } = useTickets();
     
     if (isLoading) return <LoadingSpinner />;
     
     return <TicketList tickets={data} />;
   }
   ```

3. **Hybrid Approach**: Server-side initial data with client-side updates
   ```tsx
   // Server component
   export default async function TicketsPage() {
     const initialData = await getTickets();
     
     return (
       <Suspense fallback={<LoadingSpinner />}>
         <TicketListClient initialData={initialData} />
       </Suspense>
     );
   }
   
   // Client component
   'use client';
   
   function TicketListClient({ initialData }) {
     const { data } = useTickets(undefined, { initialData });
     
     return <TicketList tickets={data} />;
   }
   ```

### Route-Specific Components

Components specific to a single route are colocated with their routes in `_components` directories:

```
/app
  /employee
    /tickets
      /new
        /page.tsx
        /_components
          /wizard-container.client.tsx
          /basic-info-step.client.tsx
          /categories-step.client.tsx
          /image-upload-step.client.tsx
          /confirmation-step.client.tsx
```

This organization keeps related components together and improves code maintainability.

## State Management

Simple Tracker uses a hybrid state management approach with clear separation between different types of state.

### State Types

1. **UI State** (Zustand)
   - Temporary UI states (open/closed dialogs, active tabs)
   - User preferences
   - Multi-step form state (wizard)

2. **Server State** (TanStack Query)
   - Data from API/Firebase
   - Caching and revalidation
   - Loading and error states

3. **Form State** (React Hook Form)
   - Form values
   - Validation state
   - Submission state

4. **Local Component State** (React's useState)
   - Component-specific temporary state
   - Animation states
   - Toggle states

### Zustand for Client State

```tsx
// src/stores/wizardStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WizardState {
  // Step 1: Basic Info
  date: string | null;
  truckId: string | null;
  jobsiteId: string | null;
  
  // Step 2: Categories
  categories: {
    hangers: number;
    leaner6To12: number;
    leaner13To24: number;
    leaner25To36: number;
    leaner37To48: number;
    leaner49Plus: number;
  };
  
  // Step 3: Images
  images: string[];
  
  // Validation flags
  stepValidation: {
    step1Valid: boolean;
    step2Valid: boolean;
    step3Valid: boolean;
  };
  
  // Actions
  setBasicInfo: (data: { date: string; truckId: string; jobsiteId: string }) => void;
  setCategories: (categories: Record<string, number>) => void;
  setImages: (images: string[]) => void;
  resetWizard: () => void;
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      // Initial state
      date: null,
      truckId: null,
      jobsiteId: null,
      
      categories: {
        hangers: 0,
        leaner6To12: 0,
        leaner13To24: 0,
        leaner25To36: 0,
        leaner37To48: 0,
        leaner49Plus: 0,
      },
      
      images: [],
      
      stepValidation: {
        step1Valid: false,
        step2Valid: false,
        step3Valid: false,
      },
      
      // Actions
      setBasicInfo: (data) => set({
        date: data.date,
        truckId: data.truckId,
        jobsiteId: data.jobsiteId,
        stepValidation: {
          ...((prevState) => prevState.stepValidation),
          step1Valid: Boolean(data.date && data.truckId && data.jobsiteId),
        },
      }),
      
      setCategories: (categories) => set((state) => {
        const hasValues = Object.values(categories).some(value => value > 0);
        
        return {
          categories,
          stepValidation: {
            ...state.stepValidation,
            step2Valid: hasValues,
          },
        };
      }),
      
      setImages: (images) => set((state) => ({
        images,
        stepValidation: {
          ...state.stepValidation,
          step3Valid: images.length > 0,
        },
      })),
      
      resetWizard: () => set({
        date: null,
        truckId: null,
        jobsiteId: null,
        categories: {
          hangers: 0,
          leaner6To12: 0,
          leaner13To24: 0,
          leaner25To36: 0,
          leaner37To48: 0,
          leaner49Plus: 0,
        },
        images: [],
        stepValidation: {
          step1Valid: false,
          step2Valid: false,
          step3Valid: false,
        },
      }),
    }),
    {
      name: 'wizard-storage',
      partialize: (state) => ({
        date: state.date,
        truckId: state.truckId,
        jobsiteId: state.jobsiteId,
        categories: state.categories,
        // Don't persist images or validation state
      }),
    }
  )
);
```

### TanStack Query Integration

TanStack Query is used for server state management with domain-specific query hooks:

```tsx
// src/hooks/queries/useTicketQueries.ts
export function useTicketQueries() {
  /**
   * Hook for fetching tickets with optional filters
   */
  const useTickets = (filters = {}) => {
    return useQuery({
      queryKey: queryKeys.tickets.list(filters),
      queryFn: () => getTickets(filters),
      select: (response) => response.success ? response.tickets : [],
    });
  };
  
  /**
   * Hook for fetching a single ticket by ID
   */
  const useTicket = (id: string) => {
    return useQuery({
      queryKey: queryKeys.tickets.detail(id),
      queryFn: () => getTicketById(id),
      select: (response) => response.success ? response.ticket : null,
      enabled: Boolean(id),
    });
  };
  
  return { useTickets, useTicket };
}
```

### Business Logic Hooks

Business logic hooks combine multiple state sources to provide a unified interface:

```tsx
// src/hooks/useTicketSubmission.ts
export function useTicketSubmission() {
  const { useSubmitTicket } = useTicketMutations();
  const { submitTicket, isPending, error, reset } = useSubmitTicket();
  
  const wizardStore = useWizardStore();
  const {
    date, truckId, jobsiteId,
    categories,
    images,
    stepValidation,
    resetWizard,
  } = wizardStore;
  
  const isSubmittable = 
    stepValidation.step1Valid && 
    stepValidation.step2Valid && 
    stepValidation.step3Valid;
  
  const handleSubmit = async () => {
    if (!isSubmittable) return false;
    
    const data = {
      date,
      truckId,
      jobsiteId,
      categories,
      images,
    };
    
    const result = await submitTicket(data);
    
    if (result.success) {
      resetWizard();
      return true;
    }
    
    return false;
  };
  
  return {
    // Wizard state
    date,
    truckId,
    jobsiteId,
    categories,
    images,
    stepValidation,
    
    // Submission state
    isSubmitting: isPending,
    submissionError: error,
    isSubmittable,
    
    // Actions
    submitTicket: handleSubmit,
    resetSubmission: reset,
  };
}
```

## Form Management

Simple Tracker uses React Hook Form with Zod for form state management and validation.

### Form Pattern with React Hook Form and Zod

```tsx
'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Define schema with Zod
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phoneNumber: z.string().regex(/^\d{10}$/, {
    message: "Phone number must be 10 digits.",
  }).optional(),
});

// Infer type from schema
type FormValues = z.infer<typeof formSchema>;

export function ProfileForm() {
  // Initialize form with React Hook Form and Zod resolver
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      phoneNumber: "",
    },
  });

  // Form submission handler
  function onSubmit(values: FormValues) {
    console.log(values);
    // Submit form data...
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" {...field} />
              </FormControl>
              <FormDescription>
                This is your public username.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (optional)</FormLabel>
              <FormControl>
                <Input placeholder="1234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">Update Profile</Button>
      </form>
    </Form>
  );
}
```

### Form Validation Patterns

The application follows these validation patterns:

1. **Schema-Based Validation**: Zod schemas define validation rules
2. **Real-Time Validation**: Validate as users type
3. **Submission Validation**: Final validation before submission
4. **Field-Level Messages**: Specific error messages per field
5. **Form-Level Messages**: General error messages for the entire form

```tsx
// Complex validation example
const ticketSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Please select a valid date.",
  }),
  truckId: z.string().min(1, {
    message: "Please select a truck.",
  }),
  jobsiteId: z.string().min(1, {
    message: "Please select a jobsite.",
  }),
  categories: z.object({
    hangers: z.number().min(0).max(150),
    leaner6To12: z.number().min(0).max(150),
    leaner13To24: z.number().min(0).max(150),
    leaner25To36: z.number().min(0).max(150),
    leaner37To48: z.number().min(0).max(150),
    leaner49Plus: z.number().min(0).max(150),
  }).refine(data => {
    // At least one category must have a value
    return Object.values(data).some(value => value > 0);
  }, {
    message: "At least one ticket category must have a value.",
    path: [], // This shows the error at the form level
  }),
  images: z.array(z.string()).min(1, {
    message: "Please upload at least one image.",
  }),
});
```

## Animation Patterns

Simple Tracker uses Framer Motion for animations with consistent patterns for user feedback and transitions.

### Animation Principles

1. **Purposeful Motion**: Animations guide users and provide feedback
2. **Consistent Timing**: Standard durations for different animation types
3. **Physics-Based Motion**: Natural-feeling animations with spring physics
4. **Accessibility**: Respect user preferences for reduced motion
5. **Performance**: Optimize animations for smooth performance

### Common Animation Patterns

#### Page Transitions

```tsx
'use client';

import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotion();
  
  if (prefersReducedMotion) {
    return <>{children}</>;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.3
      }}
    >
      {children}
    </motion.div>
  );
}
```

#### List Item Animations

```tsx
'use client';

import { motion, AnimatePresence } from "framer-motion";

interface AnimatedListProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
}

export function AnimatedList({ items, renderItem }: AnimatedListProps) {
  return (
    <ul className="space-y-2">
      <AnimatePresence initial={false}>
        {items.map((item, index) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            {renderItem(item, index)}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
```

#### Micro-Interactions

```tsx
'use client';

import { useState } from "react";
import { motion } from "framer-motion";

interface AnimatedButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export function AnimatedButton({ onClick, children }: AnimatedButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={isPressed ? { scale: 0.9 } : { scale: 1 }}
      onClick={() => {
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 150);
        onClick();
      }}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
    >
      {children}
    </motion.button>
  );
}
```

### Reduced Motion Support

All animations respect user preferences for reduced motion:

```tsx
import { useReducedMotion } from "framer-motion";

// Component that uses animation
export function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();
  
  const animationProps = prefersReducedMotion
    ? {}  // No animation for users who prefer reduced motion
    : {   // Standard animation for other users
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0 },
        transition: { duration: 0.3 }
      };
  
  return (
    <motion.div {...animationProps}>
      {/* Component content */}
    </motion.div>
  );
}
```

## Responsive Design

Simple Tracker follows a mobile-first approach to responsive design with consistent patterns for adapting to different screen sizes.

### Responsive Patterns

#### Mobile-First Design

All components are designed for mobile devices first, then enhanced for larger screens:

```tsx
// Mobile-first responsive layout
export function TicketGrid({ tickets }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
```

#### Responsive Navigation

The application uses different navigation patterns based on screen size:

```tsx
'use client';

import { useMediaQuery } from "@/hooks/useMediaQuery";
import DesktopNavigation from "./desktop-navigation";
import MobileNavigation from "./mobile-navigation";

export function ResponsiveNavigation() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  return isDesktop ? <DesktopNavigation /> : <MobileNavigation />;
}
```

#### Adaptive Layouts

Layouts adapt to available screen space with intelligent reflow:

```tsx
export function AdaptiveLayout({ sidebar, main }) {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-64 mb-4 md:mb-0 md:mr-4">
        {sidebar}
      </div>
      <div className="flex-1">
        {main}
      </div>
    </div>
  );
}
```

#### Touch-Optimized Controls

Interactive elements are optimized for touch on mobile devices:

```tsx
export function TouchFriendlyButton({ children, onClick }) {
  return (
    <button
      className="p-4 min-h-[44px] min-w-[44px] touch-target"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### Media Query Hooks

Custom hooks make it easy to respond to different screen sizes:

```tsx
'use client';

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);
    
    const handleChange = (event: MediaQueryListEvent): void => {
      setMatches(event.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);
  
  return matches;
}

// Usage example
function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

## Best Practices

### Component Organization

1. **Single Responsibility Principle**
   - Each component should have a clear, focused purpose
   - Break down complex components into smaller pieces

2. **Consistent Naming Conventions**
   - PascalCase for component names (`Button`, `TicketCard`)
   - camelCase for props and variables
   - kebab-case for CSS classes
   - Descriptive, intention-revealing names

3. **Clear Component Boundaries**
   - Well-defined props interface
   - Explicit typing with TypeScript
   - Consistent event handling patterns

4. **Documentation**
   - JSDoc comments for components and functions
   - Prop interface documentation
   - Usage examples where appropriate

### Performance Optimization

1. **Lazy Loading**
   - Defer loading of non-critical components
   - Code splitting with dynamic imports
   - Use Suspense for asynchronous components

2. **Memoization**
   - Use React.memo for expensive components
   - Use useMemo for expensive calculations
   - Use useCallback for event handlers passed as props

3. **Virtualization**
   - Use virtualized lists for long collections
   - Only render what's visible in the viewport
   - Defer rendering of off-screen content

4. **Image Optimization**
   - Use Next.js Image component
   - Properly size and compress images
   - Use responsive image techniques

### Accessibility

1. **Semantic HTML**
   - Use appropriate HTML elements
   - Maintain proper heading hierarchy
   - Use landmark regions (main, nav, header, footer)

2. **Keyboard Navigation**
   - Ensure all interactive elements are keyboard accessible
   - Maintain logical tab order
   - Provide visible focus indicators

3. **Screen Reader Support**
   - Add aria-label to elements without visible text
   - Use aria-live regions for dynamic content
   - Test with screen readers

4. **Color Contrast**
   - Maintain WCAG AA contrast ratios
   - Don't rely solely on color to convey information
   - Provide text alternatives for visual information

5. **Reduced Motion**
   - Respect user preferences for reduced motion
   - Provide alternatives to animation-dependent interfaces
   - Test with prefers-reduced-motion: reduce
