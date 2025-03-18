# Note on Wizard Components

## Component Reorganization

The wizard components previously in this directory have been consolidated with the route-specific implementations in:

`/src/app/employee/tickets/new/_components/`

This consolidation was done to eliminate duplication and align with our component organization strategy, which places route-specific components in their respective route directories.

## Feature Components vs. Route Components

Since these wizard components are only used within the ticket creation route, they have been consolidated into the route-specific directory. This follows our component organization strategy rule:

> **Is it only used within a specific route?**
> - Yes → Place in `/src/app/[route-path]/_components/`

A backup of the original components can be found in:

`/backup-components/feature/tickets/wizard/`

## Documentation

For more details about this reorganization, please refer to the following documentation:

1. `/component-reorganization.md` - Detailed explanation of the component consolidation process
2. `/src/app/employee/tickets/new/_components/README.md` - Documentation for the route-specific wizard components
