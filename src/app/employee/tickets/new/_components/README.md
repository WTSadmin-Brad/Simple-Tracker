# Ticket Submission Wizard Components

## Overview

This directory contains the components for the ticket submission wizard. These components are route-specific and are used only within the `/employee/tickets/new` route.

## Component Organization

In accordance with the Simple Tracker component organization strategy:

1. These components are **route-specific** and are appropriately located in the route's `_components` directory
2. They use the `.client.tsx` suffix to indicate that they're client components with interactivity
3. They follow the kebab-case naming convention for files and PascalCase for component names
4. They use named exports for consistent access patterns

## Components

### Main Container

- `wizard-container.client.tsx`: The main wizard container that manages the overall state and step flow

### Wizard Flow Components

- `wizard-progress.client.tsx`: Progress indicator for the wizard steps
- `wizard-navigation.client.tsx`: Navigation controls for moving between steps
- `session-recovery-prompt.client.tsx`: Prompt for recovering abandoned sessions

### Wizard Step Components

- `basic-info-step.client.tsx`: First step for collecting date, truck, and jobsite information
- `categories-step.client.tsx`: Second step for collecting material category counts
- `image-upload-step.client.tsx`: Third step for uploading and managing ticket images
- `confirmation-step.client.tsx`: Final step for reviewing and submitting the ticket

## Architecture Notes

1. **State Management**: All components use the central `wizardStore` for shared state
2. **API Integration**: API calls are managed through the `useWizardApi` hook
3. **Animations**: Smooth transitions between steps are implemented with Framer Motion
4. **Accessibility**: Components include reduced motion support for users with motion sensitivity

## Usage

The wizard container is imported directly by the `page.tsx` file in this route:

```tsx
import { WizardContainer } from './_components/wizard-container.client';

export default function NewTicketPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">New Ticket Submission</h1>
      <WizardContainer />
    </div>
  );
}
```
