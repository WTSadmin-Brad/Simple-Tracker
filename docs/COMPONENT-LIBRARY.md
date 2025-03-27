# Simple Tracker Component Library

## Table of Contents

1. [Overview](#overview)
2. [Component Architecture](#component-architecture)
3. [UI Primitives](#ui-primitives)
4. [Common Components](#common-components)
5. [Feature Components](#feature-components)
6. [Form Components](#form-components)
7. [Layout Components](#layout-components)
8. [Wizard Components](#wizard-components)
9. [Usage Guidelines](#usage-guidelines)
10. [Component Development](#component-development)

## Overview

The Simple Tracker component library follows a layered architecture that promotes reusability, maintainability, and consistency across the application. This document provides a comprehensive guide to the available components and their usage patterns.

## Component Architecture

The component architecture follows a layered approach:

```
UI Primitives → Common Components → Feature Components → Page Components
```

### Layer 1: UI Primitives

Basic building blocks with minimal business logic, primarily based on shadcn/ui components.

### Layer 2: Common Components

Shared UI patterns used across multiple features, composed from UI primitives.

### Layer 3: Feature Components

Domain-specific components organized by feature area, encapsulating business logic.

### Layer 4: Route-Specific Components

Components used only within a specific route, colocated with their routes.

### Client vs. Server Components

- **Server Components** (`.tsx`): Render on the server, cannot use hooks or browser APIs
- **Client Components** (`.client.tsx`): Run in the browser, can use React hooks and browser APIs

## UI Primitives

UI primitives are the foundational building blocks of the application, based on shadcn/ui components with consistent styling.

### Button

```tsx
// Usage example
import { Button } from "@/components/ui/button";

function MyComponent() {
  return (
    <>
      <Button variant="default">Default Button</Button>
      <Button variant="destructive">Destructive Button</Button>
      <Button variant="outline">Outline Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Button variant="ghost">Ghost Button</Button>
      <Button variant="link">Link Button</Button>
    </>
  );
}
```

**Props**:
- `variant`: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
- `size`: "default" | "sm" | "lg" | "icon"
- `asChild`: boolean - When true, the component will render as its child
- All standard button attributes

### Input

```tsx
// Usage example
import { Input } from "@/components/ui/input";

function MyComponent() {
  return (
    <>
      <Input type="text" placeholder="Enter text" />
      <Input type="email" placeholder="Enter email" disabled />
    </>
  );
}
```

**Props**:
- All standard input attributes

### Card

```tsx
// Usage example
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function MyComponent() {
  return (
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
  );
}
```

### Dialog

```tsx
// Usage example
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function MyComponent() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog Description</DialogDescription>
        </DialogHeader>
        <div>Dialog Content</div>
        <DialogFooter>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Select

```tsx
// Usage example
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function MyComponent() {
  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

### Other UI Primitives

The Simple Tracker application includes the following additional UI primitives:

- **Accordion**: Expandable content sections
- **Alert**: Contextual feedback messages
- **Avatar**: User profile images
- **Badge**: Small status descriptors
- **Checkbox**: Selection controls
- **Dropdown Menu**: Contextual menus
- **Label**: Form input labels
- **Radio Group**: Exclusive selection controls
- **Tabs**: Content organization with tabs
- **Textarea**: Multi-line text input
- **Toast**: Temporary notifications
- **Toggle**: On/off controls
- **Tooltip**: Contextual information

## Common Components

Common components are shared UI patterns used across multiple features, composed from UI primitives.

### ErrorMessage

Displays error messages with consistent styling.

```tsx
// Usage example
import { ErrorMessage } from "@/components/common/error-message";

function MyComponent() {
  return <ErrorMessage message="Something went wrong" />;
}
```

**Props**:
- `message`: string - The error message to display
- `retry?`: () => void - Optional retry function

### LoadingSpinner

Displays a loading spinner with optional text.

```tsx
// Usage example
import { LoadingSpinner } from "@/components/common/loading-spinner";

function MyComponent() {
  return <LoadingSpinner text="Loading data..." />;
}
```

**Props**:
- `text?`: string - Optional loading text
- `size?`: "sm" | "md" | "lg" - Size of the spinner (default: "md")

### BottomSheet

Mobile-friendly bottom sheet component.

```tsx
// Usage example
import { BottomSheet } from "@/components/common/bottom-sheet.client";
import { useState } from "react";

function MyComponent() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setOpen(true)}>Open Sheet</button>
      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div>Bottom Sheet Content</div>
      </BottomSheet>
    </>
  );
}
```

**Props**:
- `open`: boolean - Whether the sheet is open
- `onClose`: () => void - Function to call when the sheet is closed
- `children`: React.ReactNode - Content of the sheet
- `title?`: string - Optional title for the sheet
- `height?`: "sm" | "md" | "lg" | "full" - Height of the sheet (default: "md")

### EmptyState

Displays a message when there is no data to show.

```tsx
// Usage example
import { EmptyState } from "@/components/common/empty-state";

function MyComponent() {
  return (
    <EmptyState
      title="No tickets found"
      description="Try adjusting your filters or create a new ticket."
      action={{
        label: "Create Ticket",
        onClick: () => navigate("/tickets/new"),
      }}
    />
  );
}
```

**Props**:
- `title`: string - The title of the empty state
- `description?`: string - Optional description
- `icon?`: React.ReactNode - Optional icon
- `action?`: { label: string; onClick: () => void } - Optional action button

### Other Common Components

The Simple Tracker application includes the following additional common components:

- **ActionBar**: Bottom-fixed action buttons
- **ConfirmDialog**: Confirmation dialog with actions
- **DatePicker**: Date selection component
- **FileUpload**: File upload with preview
- **PageHeader**: Consistent page headers
- **SearchBar**: Search input with filters
- **StatusBadge**: Status indicators with consistent colors
- **SuccessBanner**: Success message banners

## Feature Components

Feature components are domain-specific components organized by feature area, encapsulating business logic.

### Tickets Feature Components

#### Counter

Interactive counter component for ticket categories.

```tsx
// Usage example
import { Counter } from "@/components/feature/tickets/counter.client";

function MyComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <Counter
      label="Hangers"
      value={count}
      onChange={setCount}
      min={0}
      max={150}
    />
  );
}
```

**Props**:
- `label`: string - The label for the counter
- `value`: number - The current value
- `onChange`: (value: number) => void - Function to call when the value changes
- `min?`: number - Minimum value (default: 0)
- `max?`: number - Maximum value (default: 150)
- `step?`: number - Step value (default: 1)

#### TicketCard

Displays a summary of a ticket.

```tsx
// Usage example
import { TicketCard } from "@/components/feature/tickets/ticket-card";

function MyComponent() {
  return (
    <TicketCard
      ticket={ticket}
      onClick={() => navigate(`/tickets/${ticket.id}`)}
    />
  );
}
```

**Props**:
- `ticket`: Ticket - The ticket data
- `onClick?`: () => void - Function to call when the card is clicked
- `actions?`: React.ReactNode - Optional actions to display

### Calendar Feature Components

#### MonthView

Displays a month view calendar.

```tsx
// Usage example
import { MonthView } from "@/components/feature/calendar/month-view.client";

function MyComponent() {
  return (
    <MonthView
      events={events}
      onEventClick={(event) => handleEventClick(event)}
      onDayClick={(date) => handleDayClick(date)}
    />
  );
}
```

**Props**:
- `events`: CalendarEvent[] - The events to display
- `onEventClick?`: (event: CalendarEvent) => void - Function to call when an event is clicked
- `onDayClick?`: (date: Date) => void - Function to call when a day is clicked
- `initialDate?`: Date - The initial date to display (default: today)

#### DayView

Displays a day view calendar.

```tsx
// Usage example
import { DayView } from "@/components/feature/calendar/day-view.client";

function MyComponent() {
  return (
    <DayView
      events={events}
      onEventClick={(event) => handleEventClick(event)}
      date={new Date()}
    />
  );
}
```

**Props**:
- `events`: CalendarEvent[] - The events to display
- `onEventClick?`: (event: CalendarEvent) => void - Function to call when an event is clicked
- `date`: Date - The date to display
- `onAddEvent?`: (time: Date) => void - Function to call when adding an event

### Admin Feature Components

#### DataTable

Reusable data table with sorting, filtering, and pagination.

```tsx
// Usage example
import { DataTable } from "@/components/feature/admin/data-table.client";

function MyComponent() {
  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={(row) => handleRowClick(row)}
      pagination={{
        pageIndex: 0,
        pageSize: 10,
        pageCount: 5,
        onPageChange: (page) => setPage(page),
      }}
    />
  );
}
```

**Props**:
- `columns`: Column[] - The columns configuration
- `data`: any[] - The data to display
- `onRowClick?`: (row: any) => void - Function to call when a row is clicked
- `pagination?`: PaginationProps - Optional pagination configuration
- `filters?`: FilterProps[] - Optional filters configuration

## Form Components

Form components are specialized components for form handling and data input.

### FormField

Wrapper for form fields with consistent styling and error handling.

```tsx
// Usage example
import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";

function MyComponent() {
  return (
    <FormField
      label="Email"
      error={errors.email?.message}
      required
    >
      <Input
        type="email"
        {...register("email")}
        placeholder="Enter your email"
      />
    </FormField>
  );
}
```

**Props**:
- `label`: string - The field label
- `error?`: string - Optional error message
- `required?`: boolean - Whether the field is required
- `description?`: string - Optional field description
- `children`: React.ReactNode - The form control

### FormSelect

Select component with form integration.

```tsx
// Usage example
import { FormSelect } from "@/components/forms/form-select.client";

function MyComponent() {
  return (
    <FormSelect
      label="Truck"
      options={trucks.map(truck => ({
        label: truck.name,
        value: truck.id,
      }))}
      value={selectedTruck}
      onChange={setSelectedTruck}
      error={errors.truck?.message}
      required
    />
  );
}
```

**Props**:
- `label`: string - The field label
- `options`: { label: string; value: string }[] - The select options
- `value`: string - The selected value
- `onChange`: (value: string) => void - Function to call when the value changes
- `error?`: string - Optional error message
- `required?`: boolean - Whether the field is required
- `placeholder?`: string - Optional placeholder text

### FormDatePicker

Date picker component with form integration.

```tsx
// Usage example
import { FormDatePicker } from "@/components/forms/form-date-picker.client";

function MyComponent() {
  return (
    <FormDatePicker
      label="Date"
      value={date}
      onChange={setDate}
      error={errors.date?.message}
      required
      minDate={new Date()}
    />
  );
}
```

**Props**:
- `label`: string - The field label
- `value`: Date | null - The selected date
- `onChange`: (date: Date | null) => void - Function to call when the date changes
- `error?`: string - Optional error message
- `required?`: boolean - Whether the field is required
- `minDate?`: Date - Optional minimum date
- `maxDate?`: Date - Optional maximum date

## Layout Components

Layout components define the structure and organization of the application.

### PageLayout

Base layout for all pages.

```tsx
// Usage example
import { PageLayout } from "@/components/layout/page-layout";

function MyPage() {
  return (
    <PageLayout
      title="Tickets"
      actions={<Button>Create Ticket</Button>}
    >
      <div>Page content</div>
    </PageLayout>
  );
}
```

**Props**:
- `title`: string - The page title
- `actions?`: React.ReactNode - Optional actions to display in the header
- `children`: React.ReactNode - The page content
- `back?`: { href: string; label: string } - Optional back link

### Sidebar

Navigation sidebar component.

```tsx
// Usage example
import { Sidebar } from "@/components/layout/sidebar.client";

function MyComponent() {
  return (
    <Sidebar
      items={[
        { label: "Dashboard", href: "/", icon: HomeIcon },
        { label: "Tickets", href: "/tickets", icon: TicketIcon },
        { label: "Calendar", href: "/calendar", icon: CalendarIcon },
      ]}
    />
  );
}
```

**Props**:
- `items`: SidebarItem[] - The navigation items
- `collapsed?`: boolean - Whether the sidebar is collapsed
- `onToggleCollapse?`: () => void - Function to call when toggling collapse

### MobileNavbar

Bottom navigation for mobile devices.

```tsx
// Usage example
import { MobileNavbar } from "@/components/layout/mobile-navbar.client";

function MyComponent() {
  return (
    <MobileNavbar
      items={[
        { label: "Home", href: "/", icon: HomeIcon },
        { label: "Tickets", href: "/tickets", icon: TicketIcon },
        { label: "Calendar", href: "/calendar", icon: CalendarIcon },
        { label: "Profile", href: "/profile", icon: UserIcon },
      ]}
    />
  );
}
```

**Props**:
- `items`: NavItem[] - The navigation items

## Wizard Components

The ticket submission wizard follows a compound component pattern.

### WizardContainer

Container component for the wizard.

```tsx
// Usage example
import { WizardContainer } from "@/components/feature/tickets/wizard/wizard-container.client";
import { BasicInfoStep } from "./_components/basic-info-step.client";
import { CategoriesStep } from "./_components/categories-step.client";
import { ImageUploadStep } from "./_components/image-upload-step.client";
import { ConfirmationStep } from "./_components/confirmation-step.client";

function TicketWizard() {
  return (
    <WizardContainer
      steps={[
        { id: 1, component: <BasicInfoStep /> },
        { id: 2, component: <CategoriesStep /> },
        { id: 3, component: <ImageUploadStep /> },
        { id: 4, component: <ConfirmationStep /> },
      ]}
      onComplete={handleComplete}
    />
  );
}
```

**Props**:
- `steps`: { id: number; component: React.ReactNode }[] - The wizard steps
- `onComplete`: (data: any) => void - Function to call when the wizard is completed
- `initialStep?`: number - The initial step (default: 1)
- `onCancel?`: () => void - Function to call when the wizard is cancelled

### WizardNavigation

Navigation component for the wizard.

```tsx
// Usage example
import { WizardNavigation } from "@/components/feature/tickets/wizard/wizard-navigation.client";

function MyComponent() {
  return (
    <WizardNavigation
      currentStep={currentStep}
      totalSteps={4}
      onNext={handleNext}
      onPrevious={handlePrevious}
      isNextDisabled={!isStepValid}
    />
  );
}
```

**Props**:
- `currentStep`: number - The current step
- `totalSteps`: number - The total number of steps
- `onNext`: () => void - Function to call when moving to the next step
- `onPrevious`: () => void - Function to call when moving to the previous step
- `isNextDisabled?`: boolean - Whether the next button is disabled
- `nextLabel?`: string - Custom label for the next button
- `previousLabel?`: string - Custom label for the previous button

### WizardProgress

Progress indicator for the wizard.

```tsx
// Usage example
import { WizardProgress } from "@/components/feature/tickets/wizard/wizard-progress.client";

function MyComponent() {
  return (
    <WizardProgress
      currentStep={currentStep}
      steps={[
        { id: 1, label: "Basic Info" },
        { id: 2, label: "Categories" },
        { id: 3, label: "Images" },
        { id: 4, label: "Confirmation" },
      ]}
    />
  );
}
```

**Props**:
- `currentStep`: number - The current step
- `steps`: { id: number; label: string }[] - The wizard steps

## Usage Guidelines

### Component Selection

Follow these guidelines when selecting components:

1. **Start with UI Primitives**: Use UI primitives for basic UI elements
2. **Use Common Components**: Use common components for shared UI patterns
3. **Use Feature Components**: Use feature components for domain-specific functionality
4. **Create Route-Specific Components**: Create route-specific components for functionality used only within a specific route

### Component Composition

1. **Composition Over Inheritance**: Compose components from smaller pieces
2. **Single Responsibility**: Each component should do one thing well
3. **Prop Drilling Avoidance**: Use context or state management for deeply nested data
4. **Controlled vs. Uncontrolled**: Prefer controlled components for form elements

### Component Placement Decision Tree

1. **Is it a UI primitive with no business logic?**
   - Yes → Place in `/src/components/ui/`

2. **Is it a common pattern used across features?**
   - Yes → Place in `/src/components/common/`

3. **Is it specific to a feature but used in multiple routes?**
   - Yes → Place in `/src/components/feature/[feature-name]/`

4. **Is it only used within a specific route?**
   - Yes → Place in `/src/app/[route-path]/_components/`

5. **Does it require client-side interactivity?**
   - Yes → Use `.client.tsx` suffix
   - No → Use `.tsx` suffix (Server Component)

## Component Development

### Creating New Components

1. **Identify the Component Type**: Determine whether the component is a UI primitive, common component, feature component, or route-specific component
2. **Create the Component File**: Create a new file in the appropriate directory with the appropriate naming convention
3. **Define the Component Interface**: Define the component props using TypeScript
4. **Implement the Component**: Implement the component functionality
5. **Document the Component**: Add JSDoc comments to document the component
6. **Test the Component**: Add tests for the component

### Component Naming Conventions

1. **PascalCase** for component names
2. **kebab-case** for file names
3. **camelCase** for variables, functions, and props
4. `.client.tsx` suffix for Client Components
5. `.tsx` suffix for Server Components (default)

### Component Documentation

Each component should include:

1. **JSDoc Comments**: Document the component purpose and usage
2. **Props Documentation**: Document each prop with type information
3. **Usage Examples**: Provide examples of how to use the component
4. **Edge Cases**: Document any edge cases or limitations

Example:

```tsx
/**
 * Counter component for incrementing and decrementing values.
 * Used primarily in the ticket submission wizard for category counts.
 *
 * @example
 * ```tsx
 * <Counter
 *   label="Hangers"
 *   value={count}
 *   onChange={setCount}
 *   min={0}
 *   max={150}
 * />
 * ```
 */
export function Counter({
  label,
  value,
  onChange,
  min = 0,
  max = 150,
  step = 1,
}: CounterProps) {
  // Component implementation
}

export interface CounterProps {
  /** The label for the counter */
  label: string;
  /** The current value */
  value: number;
  /** Function to call when the value changes */
  onChange: (value: number) => void;
  /** Minimum value (default: 0) */
  min?: number;
  /** Maximum value (default: 150) */
  max?: number;
  /** Step value (default: 1) */
  step?: number;
}