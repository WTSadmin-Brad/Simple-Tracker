# Product Requirements Document (PRD)

## Overview

This document outlines the requirements for the Workday & Ticket Tracking PWA, a mobile-first application designed for field workers to log workdays and submit tickets with images. It defines the app's core features, target audience, technical architecture, and success metrics.

## Table of Contents

- [App Overview](#app-overview)
- [Target Audience](#target-audience)
- [Key Features](#key-features)
  - [Employee Features](#employee-features)
  - [Admin Features](#admin-features)
- [Core Technologies](#core-technologies)
- [Success Metrics](#success-metrics)
- [Assumptions & Risks](#assumptions--risks)
- [Related Resources](#related-resources)
- [Document Information](#document-information)

## App Overview

**Name**: Simple Tracker  
**Description**: A mobile-first Progressive Web App (PWA) built with Next.js for employees to log workdays, submit tickets, and upload images. Admins manage data and export reports via a secure dashboard.  
**Tagline**: "Streamline Fieldwork Logging."  

## Target Audience

- **Primary Users**:  
  - **Employees**: 30 field workers using mobile devices to log daily work and tickets.  
  - **Admins**: 1–2 internal managers overseeing data accuracy and generating reports.  

## Key Features

### Employee Features

1. **Workday Logging**:  
   
   - Calendar interface to mark days as **full/half/off**.  
   - Editable entries for **7 days post-submission**.  

2. **Ticket Submission Wizard**:  
   
   - **4-step guided wizard** for simplified ticket submission:
     1. **Basic Info**: Date, truck, and jobsite selection with intuitive bottom sheets.
     2. **Ticket Categories**: 6 predefined categories (Hangers, Leaners by size) with interactive counter UI (0-150) and swipe navigation.
     3. **Image Upload**: Support for up to 10 high-resolution images (10MB each) with preview and summarized ticket data.
     4. **Confirmation**: Submission confirmation with visual feedback.
   - **Rich micro-interactions** providing immediate user feedback:
     - Color-coded counters: Red (0), Yellow (1-84), Green (85-124), Gold (125-150).
     - Physics-based animations for natural-feeling transitions.
     - Haptic feedback for important actions (customizable).
   - **Session recovery** for in-progress submissions.

3. **Mobile-First Design**:  
   
   - Optimized for small screens with touch-friendly components.
   - Swipe-based navigation between ticket categories.
   - Responsive animations that respect user motion preferences.

### Admin Features

1. **Dashboard**:  
   
   - Filter data by **date range**, **truck number**, **jobsite**, or **employee**.  
   - View and manage in-progress ticket submissions.
   - Edit or delete entries.  

2. **Data Export**:  
   
   - Export workday/ticket logs to Excel.  
   - Download original ticket images and thumbnails.  

## Core Technologies

| **Area**           | **Tools**                                                                 |
| ------------------ | ------------------------------------------------------------------------- |
| **Framework**      | Next.js (~14.2, App Router), React (18.2)                                 |
| **Language**       | TypeScript (~5.1)                                                         |
| **UI/Styling**     | Tailwind CSS (~3.3), shadcn/ui (Radix UI), Framer Motion (Animations)     |
| **State Management** | Zustand (~4.3, Client), TanStack Query (~5.69, Server)                    |
| **Forms**          | React Hook Form (~7.45), Zod (~3.21, Validation)                          |
| **Backend**        | Next.js API Routes w/ Firebase Admin SDK (~13.2) (Firestore, Storage)     |
| **Authentication** | Custom Flow w/ Firebase Admin SDK (~13.2) & Client SDK (~10.7)            |

## Success Metrics

- **User Adoption**: 100% employee onboarding within 1 month.  
- **Efficiency**: Reduce daily logging time by 50% compared to manual methods.
- **User Experience**: Achieve 90%+ satisfaction rating on ticket submission process.
- **Completion Rate**: 95%+ successful ticket submissions (reduction in abandoned submissions).

## Assumptions & Risks

- **Assumptions**:  
  - Employees submit data post-shift (no offline mode required).  
  - Admins manually create and manage accounts.
  - Users prefer guided, step-by-step submission over single-page forms.
  - Mobile interactions benefit from haptic and visual feedback.
- **Risks**:  
  - Firebase Storage costs scaling with larger 10MB image uploads.
  - Performance on lower-end devices during animations.
  - **Mitigation**: 
    - Set monthly storage quotas and implement data archiving after 2 weeks.
    - Implement animation intensity controls based on device performance.
    - Respect user preferences for reduced motion.

## Related Resources

- [Tech Specs](./Tech%20Specs.md) - Detailed technical specifications
- [Ticket Submission Page](./Ticket%20Submission%20Page.md) - Detailed ticket submission design
- [Frontend Architecture Overview](./frontend-architecture-overview.md) - Frontend architecture
- [API Reference Documentation](./api-reference.md) - API endpoints specification
- [Animation & Interaction System](./animation-interaction-system.md) - Animation implementation details
- [Data Models & Schema Documentation](./data-models-schema.md) - Database schema details
- [Security Implementation](./security-implementation.md) - Security implementation

## Document Information

**Last Updated:** 2025-04-12
**Author/Maintainer:** Development Team  
**Status:** Updated - Enhanced ticket submission with wizard and micro-interactions
