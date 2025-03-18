# Wizard Component Duplication Resolution Plan

## Overview

This document outlines the plan to resolve component duplication between wizard components in two locations:
1. Feature components: `/src/components/feature/tickets/wizard/`
2. Route components: `/src/app/employee/tickets/new/_components/`

After analyzing the components, we found that while they serve similar purposes, they have significant implementation differences. The route components are generally more complete and feature-rich than their feature component counterparts.

## Decision Matrix

| Component | Identical? | Differences | Recommended Action |
|-----------|------------|-------------|-------------------|
| BasicInfoStep | No | • Route component uses simpler form handling<br>• Feature component uses React Hook Form with Zod<br>• Different UI styling and layout<br>• Feature component uses form module, route component uses direct state<br>• Route component has mock data while feature has API integration | Extract common logic into a base component |
| CategoriesStep | No | • Feature component is a placeholder with minimal implementation<br>• Route component is fully implemented with counters and navigation | Keep route component version and update feature component |
| ConfirmationStep | TBD | Not fully analyzed | Likely keep route component version |
| ImageUploadStep | TBD | Not fully analyzed | Likely keep route component version |
| WizardContainer | No | • Different import/export styles<br>• Route component has more comprehensive error handling<br>• Route component has loading states<br>• Route component has more complete API integration<br>• Different animation implementations | Keep route component version and update imports |
| WizardNavigation | TBD | Not fully analyzed | Likely keep route component version |
| WizardProgress | TBD | Not fully analyzed | Likely keep route component version |

## Implementation Plan

### Phase 1: Consolidation Preparation

1. **Create Backup Branch**
   ```bash
   git checkout -b wizard-component-consolidation
   ```

2. **Document Current Component Usage**
   - Identify all imports of both sets of components
   - Note any special usage patterns or dependencies

### Phase 2: Component Consolidation

#### Step 1: Replace Placeholder Components

For components like `CategoriesStep` where the feature component is just a placeholder, we'll replace it with the route component implementation:

1. Copy the route component implementation to the feature component location
2. Update imports and references to match the feature component style
3. Test to ensure functionality works correctly

#### Step 2: Refactor Complex Components

For components with significant differences but shared logic (like `BasicInfoStep`):

1. Extract common logic into base components
2. Create specialized implementations as needed
3. Update imports and references

#### Step 3: Update Component Exports

Ensure consistent export style across all wizard components:

1. For feature components: 
   ```typescript
   export default ComponentName;
   ```

2. For route components:
   ```typescript
   export function ComponentName() {
     // Component implementation
   }
   ```

#### Step 4: Update Import References

Update all import statements to reflect the consolidated component locations:

1. For each component, identify all files importing it
2. Update the import paths to point to the correct location
3. Test to ensure no broken imports

### Phase 3: Testing and Verification

1. **Functional Testing**
   - Test the wizard flow from start to finish
   - Verify all steps work as expected
   - Test edge cases and error handling

2. **Visual Verification**
   - Ensure UI appears correctly at all steps
   - Verify animations and transitions work smoothly

3. **Performance Testing**
   - Measure any impact on loading times or performance
   - Optimize if necessary

### Phase 4: Documentation

1. **Update Component Documentation**
   - Document the component hierarchy
   - Note any special considerations for future development

2. **Update Architecture Documentation**
   - Update architectural diagrams if necessary
   - Document the reasoning behind the consolidation

## Implementation Details by Component

### BasicInfoStep

**Action**: Copy the route component to the feature location with modifications:

```typescript
/**
 * BasicInfoStep.client.tsx
 * Client component for the first step of the ticket submission wizard
 * Handles basic information input (date, truck, jobsite)
 */
'use client';

// Copy implementation from route component
// Update imports to use feature component paths
// Ensure default export is used
```

### CategoriesStep

**Action**: Replace placeholder with route implementation:

```typescript
/**
 * CategoriesStep.client.tsx
 * Client component for the second step of the ticket submission wizard
 * Handles category counters with specific ranges
 */
'use client';

// Copy implementation from route component
// Update imports to use feature component paths
// Ensure default export is used
```

### WizardContainer

**Action**: Use route implementation with modifications:

```typescript
/**
 * WizardContainer.client.tsx
 * Client component that manages the overall ticket submission wizard flow
 */
'use client';

// Copy implementation from route component
// Update imports to use feature component paths
// Ensure default export is used
```

## Success Criteria

The consolidation will be considered successful when:

1. All duplicate components are consolidated to a single implementation
2. All imports reference the correct components
3. The wizard functions correctly end-to-end
4. Component documentation clearly explains the component organization
5. No regressions in functionality are introduced

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking changes during consolidation | Implement changes incrementally with frequent testing |
| Import path issues | Use search and replace tools to ensure all imports are updated |
| Component signature changes | Maintain consistent interfaces during the transition |
| Performance impacts | Monitor performance before and after changes |

## Timeline

1. **Preparation**: 0.5 days
2. **Component Consolidation**: 1-2 days
3. **Testing and Verification**: 0.5 days
4. **Documentation**: 0.5 days

**Total Estimated Time**: 2.5-3.5 days
