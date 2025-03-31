# Query Hooks Reference

This document provides a quick reference for the TanStack Query hooks available in the Simple Tracker application.

## Table of Contents

1. [Ticket Queries](#ticket-queries)
2. [Workday Queries](#workday-queries)
3. [Usage Examples](#usage-examples)

## Ticket Queries

### `useTicketQueries`

Located in `src/hooks/queries/useTicketQueries.ts`, this hook provides all ticket-related queries and mutations.

#### Queries

| Name | Description | Parameters | Return Type |
|------|-------------|------------|-------------|
| `wizardData` | Current wizard data | - | `WizardData \| null` |
| `isLoadingWizardData` | Loading state for wizard data | - | `boolean` |
| `isErrorWizardData` | Error state for wizard data | - | `boolean` |
| `wizardDataError` | Error for wizard data | - | `Error \| null` |
| `refetchWizardData` | Function to refetch wizard data | - | `() => Promise<QueryObserverResult>` |

#### Mutations

| Name | Description | Parameters | Return Type |
|------|-------------|------------|-------------|
| `submitTicket` | Submit a complete ticket | `WizardData` | `Promise<Ticket \| null>` |
| `isSubmittingTicket` | Loading state for ticket submission | - | `boolean` |
| `isErrorSubmitTicket` | Error state for ticket submission | - | `boolean` |
| `submitTicketError` | Error for ticket submission | - | `Error \| null` |
| `submitTicketReset` | Reset ticket submission state | - | `() => void` |
| `uploadTempImage` | Upload a temporary image | `File` | `Promise<TempImageUploadResponse \| null>` |
| `isUploadingTempImage` | Loading state for image upload | - | `boolean` |
| `isErrorUploadTempImage` | Error state for image upload | - | `boolean` |
| `uploadTempImageError` | Error for image upload | - | `Error \| null` |
| `uploadTempImageReset` | Reset image upload state | - | `() => void` |
| `deleteTempImage` | Delete a temporary image | `string` | `Promise<boolean>` |
| `isDeletingTempImage` | Loading state for image deletion | - | `boolean` |
| `isErrorDeleteTempImage` | Error state for image deletion | - | `boolean` |
| `deleteTempImageError` | Error for image deletion | - | `Error \| null` |
| `deleteTempImageReset` | Reset image deletion state | - | `() => void` |
| `saveWizardStep1` | Save step 1 data | `WizardStep1Data` | `Promise<void>` |
| `isSavingWizardStep1` | Loading state for step 1 save | - | `boolean` |
| `saveWizardStep2` | Save step 2 data | `WizardStep2Data` | `Promise<void>` |
| `isSavingWizardStep2` | Loading state for step 2 save | - | `boolean` |
| `saveWizardStep3` | Save step 3 data | `WizardStep3Data` | `Promise<void>` |
| `isSavingWizardStep3` | Loading state for step 3 save | - | `boolean` |
| `saveWizardStep` | Save any wizard step | `step: 1 \| 2 \| 3, data: any` | `Promise<boolean>` |
| `isSavingWizardStep` | Loading state for any step save | - | `boolean` |

#### Custom Query Hooks

| Name | Description | Parameters | Return Type |
|------|-------------|------------|-------------|
| `useTicketsQuery` | Get all tickets | `filters?: Record<string, any>` | `UseQueryResult<Ticket[], Error>` |
| `useTicketByIdQuery` | Get a ticket by ID | `id: string` | `UseQueryResult<Ticket \| null, Error>` |

## Workday Queries

### `useWorkdayQueries`

Located in `src/hooks/queries/useWorkdayQueries.ts`, this hook provides all workday-related queries and mutations.

#### Custom Query Hooks

| Name | Description | Parameters | Return Type |
|------|-------------|------------|-------------|
| `useMonthWorkdaysQuery` | Get workdays for a month | `year: number, month: number` | `UseQueryResult<Workday[], Error>` |
| `useWorkdayDetailsQuery` | Get workday details | `date: string` | `UseQueryResult<WorkdayWithTickets \| null, Error>` |

#### Mutations

| Name | Description | Parameters | Return Type |
|------|-------------|------------|-------------|
| `createWorkday` | Create a new workday | `{ date: string; jobsite: string; workType: WorkdayType }` | `Promise<Workday>` |
| `isCreatingWorkday` | Loading state for workday creation | - | `boolean` |
| `createWorkdayError` | Error for workday creation | - | `Error \| null` |
| `createWorkdayReset` | Reset workday creation state | - | `() => void` |
| `updateWorkday` | Update an existing workday | `{ id: string; jobsite: string; workType: WorkdayType; date?: string }` | `Promise<Workday>` |
| `isUpdatingWorkday` | Loading state for workday update | - | `boolean` |
| `updateWorkdayError` | Error for workday update | - | `Error \| null` |
| `updateWorkdayReset` | Reset workday update state | - | `() => void` |

## Usage Examples

### Basic Query Usage

```tsx
import { useTicketQueries } from '@/hooks/queries/useTicketQueries';

function TicketList() {
  const { useTicketsQuery } = useTicketQueries();
  const { data: tickets, isLoading, error } = useTicketsQuery();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <ul>
      {tickets.map(ticket => (
        <li key={ticket.id}>{ticket.title}</li>
      ))}
    </ul>
  );
}
```

### Mutation Usage

```tsx
import { useTicketQueries } from '@/hooks/queries/useTicketQueries';

function TicketForm() {
  const { submitTicket, isSubmittingTicket, submitTicketError } = useTicketQueries();
  
  const handleSubmit = async (formData) => {
    const result = await submitTicket(formData);
    if (result) {
      // Handle success, e.g., redirect to success page
      router.push('/success');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isSubmittingTicket}>
        {isSubmittingTicket ? 'Submitting...' : 'Submit'}
      </button>
      {submitTicketError && <ErrorMessage message={submitTicketError.message} />}
    </form>
  );
}
```

### Using the Business Logic Hook

```tsx
import { useTickets } from '@/hooks/useTickets';

function TicketWizard() {
  const { 
    wizardData, 
    isLoading, 
    error, 
    submitTicket, 
    saveWizardStep 
  } = useTickets();
  
  const handleSaveStep = async (step, data) => {
    const success = await saveWizardStep(step, data);
    if (success) {
      // Move to next step
      setCurrentStep(step + 1);
    }
  };
  
  return (
    <div>
      {/* Wizard UI */}
      {isLoading && <LoadingOverlay />}
      {error && <ErrorBanner message={error} />}
    </div>
  );
}
```

### Conditional Fetching

```tsx
import { useWorkdayQueries } from '@/hooks/queries/useWorkdayQueries';

function WorkdayDetail({ date }) {
  const { useWorkdayDetailsQuery } = useWorkdayQueries();
  const { 
    data: workday, 
    isLoading, 
    error 
  } = useWorkdayDetailsQuery(date); // Only runs if date is truthy
  
  if (!date) return <p>Please select a date</p>;
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  
  return (
    <div>
      {workday ? (
        <WorkdayInfo workday={workday} />
      ) : (
        <p>No workday found for this date</p>
      )}
    </div>
  );
}
```

### Combining Multiple Queries

```tsx
import { useTicketQueries } from '@/hooks/queries/useTicketQueries';
import { useWorkdayQueries } from '@/hooks/queries/useWorkdayQueries';

function Dashboard() {
  const { useTicketsQuery } = useTicketQueries();
  const { useMonthWorkdaysQuery } = useWorkdayQueries();
  
  const { data: tickets, isLoading: isLoadingTickets } = useTicketsQuery();
  const { data: workdays, isLoading: isLoadingWorkdays } = useMonthWorkdaysQuery(
    new Date().getFullYear(),
    new Date().getMonth() + 1
  );
  
  const isLoading = isLoadingTickets || isLoadingWorkdays;
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      <TicketSummary tickets={tickets} />
      <WorkdaySummary workdays={workdays} />
    </div>
  );
}
```
