# Simple Tracker

Simple Tracker is a mobile-first Progressive Web Application (PWA) designed for field workers to log workdays and submit tickets with images. It features a 4-step wizard for ticket submission with rich micro-interactions and animations.

## Project Overview

Simple Tracker provides field workers with a streamlined interface to:
- Log daily work activities
- Submit tickets with category counts
- Upload and manage images
- View historical data
- Export data in various formats

The application is built with a focus on mobile usability, offline capabilities, and data integrity.

## Technology Stack

- **Frontend**: Next.js 15.3.0 (App Router), React 19 with TypeScript 5.8.2
- **UI**: Tailwind CSS 4.0.13 with shadcn/ui 0.9.5, Framer Motion 12.5.0
- **State Management**: Zustand 5.0.3, React Query 5.67.3
- **Forms**: React Hook Form 7.54.2 + Zod 3.24.2
- **Backend**: Firebase (Firestore + Storage)

## Core Features

### Ticket Submission Wizard

A 4-step wizard guides users through the ticket submission process:
1. **Basic Info**: Date, truck, jobsite selection
2. **Categories**: 6 counters with specific count ranges and color transitions
3. **Image Upload**: Up to 10 images with previews
4. **Confirmation**: Review and submit

### Workday Logging

- Daily workday tracking with jobsite assignment
- Start/end time logging
- Break management
- Notes and additional information

### Admin Dashboard

- Ticket and workday management
- User administration
- Export functionality for tickets and workdays
- Archive management for historical data

### Export Functionality

The application supports exporting data in multiple formats:
- **CSV**: Simple comma-separated values
- **Excel**: Rich spreadsheets with multiple sheets and formatting
- **JSON**: Complete data export in JSON format

Export types include:
- **Tickets**: Export ticket data with category counts
- **Workdays**: Export workday data with optional summaries

### Archive Management

Simple Tracker includes a robust archiving system for:
- Archiving historical data to optimize database performance
- Maintaining searchable archive indexes
- Efficiently storing and retrieving archived images
- Restoring archived data when needed

## Documentation

For detailed documentation, see:
- [Project Overview](PROJECT-OVERVIEW.md)
- [Architecture & Design Patterns](ARCHITECTURE-DESIGN-PATTERNS.md)
- [API Integration](API-INTEGRATION.md)
- [Data Models & Schema](Data_Models_Schema.md)
- [Development Guidelines](DEV-GUIDELINES.md)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
