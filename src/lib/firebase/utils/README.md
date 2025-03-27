# Firebase Utilities

This directory contains shared Firebase utility functions that follow the KISS and DRY principles for the Simple Tracker application.

## Purpose

These utilities provide a consistent way to access Firebase data while maintaining the separation between admin and regular user contexts. They are designed to:

1. **Reduce duplication** between `/api/admin` and `/api/references` implementations
2. **Maintain separation of concerns** between admin and field worker functionality
3. **Preserve existing API structures** while improving maintainability
4. **Use centralized types** from `/src/types/firebase.ts` consistently

## Usage Guidelines

When working with Firebase data in Simple Tracker:

1. **For data access operations** (querying, fetching by ID), use these shared utilities
2. **For role-specific operations** (admin-only features), keep those in their respective API directories
3. **Always use the `isAdmin` parameter** when calling shared utilities from admin contexts

Example:

```typescript
// In admin API
import { queryTrucks } from '@/lib/firebase/utils';

// Notice the isAdmin parameter
const trucks = await queryTrucks({ 
  activeOnly: false, 
  isAdmin: true 
});
```

```typescript
// In references API
import { queryTrucks } from '@/lib/firebase/utils';

// Regular user context
const activeTrucks = await queryTrucks({ 
  activeOnly: true,
  isAdmin: false 
});
```

## Architecture Decision

We maintain separate API directories (`/api/admin` and `/api/references`) because:

1. They serve different user roles with different permissions
2. The Next.js middleware enforces role-based access at the route level
3. They expose different capabilities appropriate to each user type

The shared utilities reduce duplication while respecting this separation.
