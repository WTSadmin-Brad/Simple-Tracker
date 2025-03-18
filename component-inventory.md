# Simple Tracker Component Inventory and Renaming Plan

## Overview

This document provides a comprehensive inventory of components in the Simple Tracker application, identifying naming inconsistencies and establishing a plan for standardization. The goal is to align all component naming with the established guideline of using **kebab-case for filenames** while maintaining **PascalCase for component names**.

Based on a thorough analysis of the codebase, we've identified 114 component files across multiple directories with significant naming inconsistencies that need standardization.

## Reasoning for Standardization

1. **Consistency**: The component guidelines specify kebab-case for file names, but implementation is inconsistent
2. **Maintainability**: Consistent naming patterns make the codebase more predictable and easier to navigate
3. **Reduced Cognitive Load**: Developers don't need to remember multiple naming conventions
4. **Alignment with Guidelines**: Brings implementation in line with documented standards
5. **Best Practice Alignment**: Kebab-case filenames are more web-friendly and align with URL conventions

## Component Inventory and Renaming Plan

### Authentication Components

| Current Filename | New Filename | Component Name | Location | Import Updates Needed |
|------------------|--------------|----------------|----------|------------------------|
| `auth-guard.client.tsx` | No change | `AuthGuard` | `src/components/auth/` | None |
| `auth-provider.client.tsx` | No change | `AuthProvider` | `src/components/auth/` | None |
| `login-form.client.tsx` | No change | `LoginForm` | `src/components/auth/` | None |

### Common Components

| Current Filename | New Filename | Component Name | Location | Import Updates Needed |
|------------------|--------------|----------------|----------|------------------------|
| `animated-card.tsx` | No change | `AnimatedCard` | `src/components/common/` | None |
| `bottom-sheet.tsx` | No change | `BottomSheet` | `src/components/common/` | None |
| `ConnectionStatusDetector.client.tsx` | `connection-status-detector.client.tsx` | `ConnectionStatusDetector` | `src/components/common/` | Multiple imports across application |
| `error-message.tsx` | No change | `ErrorMessage` | `src/components/common/` | None |
| `loading-spinner.tsx` | No change | `LoadingSpinner` | `src/components/common/` | None |
| `Toast.client.tsx` | `toast.client.tsx` | `Toast` | `src/components/common/` | UI components, providers |

### Common Components - Bottom Sheet

| Current Filename | New Filename | Component Name | Location | Import Updates Needed |
|------------------|--------------|----------------|----------|------------------------|
| `BottomSheet.client.tsx` | `bottom-sheet.client.tsx` | `BottomSheet` | `src/components/common/bottom-sheet/` | Multiple imports across application |
| `DatePickerSheet.client.tsx` | `date-picker-sheet.client.tsx` | `DatePickerSheet` | `src/components/common/bottom-sheet/` | Form components, Calendar components |
| `JobsitePickerSheet.client.tsx` | `jobsite-picker-sheet.client.tsx` | `JobsitePickerSheet` | `src/components/common/bottom-sheet/` | Form components, Admin components |
| `TruckPickerSheet.client.tsx` | `truck-picker-sheet.client.tsx` | `TruckPickerSheet` | `src/components/common/bottom-sheet/` | Form components, Admin components |

### Feature Components - Tickets

| Current Filename | New Filename | Component Name | Location | Import Updates Needed |
|------------------|--------------|----------------|----------|------------------------|
| `Counter.client.tsx` | `counter.client.tsx` | `Counter` | `src/components/feature/tickets/` | Categories step components |
| `ImageUploadGrid.client.tsx` | `image-upload-grid.client.tsx` | `ImageUploadGrid` | `src/components/feature/tickets/` | Image upload components |
| `TicketItem.tsx` | No change | `TicketItem` | `src/components/feature/tickets/` | None |
| `TicketList.tsx` | No change | `TicketList` | `src/components/feature/tickets/` | None |

### Feature Components - Wizard (Ticket Submission)

| Current Filename | New Filename | Component Name | Location | Import Updates Needed |
|------------------|--------------|----------------|----------|------------------------|
| `AutoSaveIndicator.client.tsx` | `auto-save-indicator.client.tsx` | `AutoSaveIndicator` | `src/components/feature/tickets/wizard/` | Wizard container imports |
| `BasicInfoStep.client.tsx` | `basic-info-step.client.tsx` | `BasicInfoStep` | `src/components/feature/tickets/wizard/` | Wizard flows, container components |
| `CategoriesStep.client.tsx` | `categories-step.client.tsx` | `CategoriesStep` | `src/components/feature/tickets/wizard/` | Wizard flows, container components |
| `ConfirmationStep.client.tsx` | `confirmation-step.client.tsx` | `ConfirmationStep` | `src/components/feature/tickets/wizard/` | Wizard flows, container components |
| `ImageUploadStep.client.tsx` | `image-upload-step.client.tsx` | `ImageUploadStep` | `src/components/feature/tickets/wizard/` | Wizard flows, container components |
| `SessionRecoveryPrompt.client.tsx` | `session-recovery-prompt.client.tsx` | `SessionRecoveryPrompt` | `src/components/feature/tickets/wizard/` | Wizard container components |
| `WizardContainer.client.tsx` | `wizard-container.client.tsx` | `WizardContainer` | `src/components/feature/tickets/wizard/` | Page components, app routes |
| `WizardNavigation.client.tsx` | `wizard-navigation.client.tsx` | `WizardNavigation` | `src/components/feature/tickets/wizard/` | Wizard container imports |
| `WizardProgress.client.tsx` | `wizard-progress.client.tsx` | `WizardProgress` | `src/components/feature/tickets/wizard/` | Wizard container imports |

### Feature Components - Calendar

| Current Filename | New Filename | Component Name | Location | Import Updates Needed |
|------------------|--------------|----------------|----------|------------------------|
| `CalendarSkeleton.tsx` | No change | `CalendarSkeleton` | `src/components/feature/calendar/` | None |
| `DayCell.client.tsx` | `day-cell.client.tsx` | `DayCell` | `src/components/feature/calendar/` | Month view components |
| `MonthView.tsx` | No change | `MonthView` | `src/components/feature/calendar/` | None |

### Feature Components - Admin

| Current Filename | New Filename | Component Name | Location | Import Updates Needed |
|------------------|--------------|----------------|----------|------------------------|
| `AdminActionButton.client.tsx` | `admin-action-button.client.tsx` | `AdminActionButton` | `src/components/feature/admin/` | Admin components |
| `ArchiveResultsTable.client.tsx` | `archive-results-table.client.tsx` | `ArchiveResultsTable` | `src/components/feature/admin/` | Archive page components |
| `ArchiveSearchBar.client.tsx` | `archive-search-bar.client.tsx` | `ArchiveSearchBar` | `src/components/feature/admin/` | Archive page components |
| `ExportButton.client.tsx` | `export-button.client.tsx` | `ExportButton` | `src/components/feature/admin/` | Export page components |
| `ExportControls.client.tsx` | `export-controls.client.tsx` | `ExportControls` | `src/components/feature/admin/` | Export page components |
| `ExportHistoryList.client.tsx` | `export-history-list.client.tsx` | `ExportHistoryList` | `src/components/feature/admin/` | Export page components |
| `TicketArchiveControls.client.tsx` | `ticket-archive-controls.client.tsx` | `TicketArchiveControls` | `src/components/feature/admin/` | Archive page components |
| `TicketDetailView.client.tsx` | `ticket-detail-view.client.tsx` | `TicketDetailView` | `src/components/feature/admin/` | Ticket management components |
| `TicketStatusBadge.client.tsx` | `ticket-status-badge.client.tsx` | `TicketStatusBadge` | `src/components/feature/admin/` | Ticket management components |

### Feature Components - Admin Dashboard

| Current Filename | New Filename | Component Name | Location | Import Updates Needed |
|------------------|--------------|----------------|----------|------------------------|
| `CardConfigPanel.client.tsx` | `card-config-panel.client.tsx` | `CardConfigPanel` | `src/components/feature/admin/dashboard/` | Dashboard components |
| `DashboardCard.client.tsx` | `dashboard-card.client.tsx` | `DashboardCard` | `src/components/feature/admin/dashboard/` | Dashboard components |
| `DashboardLayout.client.tsx` | `dashboard-layout.client.tsx` | `DashboardLayout` | `src/components/feature/admin/dashboard/` | Dashboard page components |
| `ActivityCard.client.tsx` | `activity-card.client.tsx` | `ActivityCard` | `src/components/feature/admin/dashboard/cards/` | Dashboard components |
| `ChartCard.client.tsx` | `chart-card.client.tsx` | `ChartCard` | `src/components/feature/admin/dashboard/cards/` | Dashboard components |
| `MetricCard.client.tsx` | `metric-card.client.tsx` | `MetricCard` | `src/components/feature/admin/dashboard/cards/` | Dashboard components |
| `StatusCard.client.tsx` | `status-card.client.tsx` | `StatusCard` | `src/components/feature/admin/dashboard/cards/` | Dashboard components |
| `TableCard.client.tsx` | `table-card.client.tsx` | `TableCard` | `src/components/feature/admin/dashboard/cards/` | Dashboard components |

### Feature Components - Admin Data Grid

| Current Filename | New Filename | Component Name | Location | Import Updates Needed |
|------------------|--------------|----------------|----------|------------------------|
| `ActionBar.client.tsx` | `action-bar.client.tsx` | `ActionBar` | `src/components/feature/admin/data-grid/` | Data grid components |
| `DataGrid.client.tsx` | `data-grid.client.tsx` | `DataGrid` | `src/components/feature/admin/data-grid/` | Admin list pages |
| `DetailPanel.client.tsx` | `detail-panel.client.tsx` | `DetailPanel` | `src/components/feature/admin/data-grid/` | Data grid components |
| `EntityDetailView.client.tsx` | `entity-detail-view.client.tsx` | `EntityDetailView` | `src/components/feature/admin/data-grid/` | Data grid components |
| `FilterBar.client.tsx` | `filter-bar.client.tsx` | `FilterBar` | `src/components/feature/admin/data-grid/` | Data grid components |
| `FormPanel.client.tsx` | `form-panel.client.tsx` | `FormPanel` | `src/components/feature/admin/data-grid/` | Data grid components |

### Form Components

| Current Filename | New Filename | Component Name | Location | Import Updates Needed |
|------------------|--------------|----------------|----------|------------------------|
| `Form.client.tsx` | `form.client.tsx` | `Form` | `src/components/forms/` | Multiple form components across app |
| `CheckboxField.client.tsx` | `checkbox-field.client.tsx` | `CheckboxField` | `src/components/forms/form-fields/` | Form components |
| `CounterField.client.tsx` | `counter-field.client.tsx` | `CounterField` | `src/components/forms/form-fields/` | Form components |
| `DateField.client.tsx` | `date-field.client.tsx` | `DateField` | `src/components/forms/form-fields/` | Form components |
| `ImageUploadField.client.tsx` | `image-upload-field.client.tsx` | `ImageUploadField` | `src/components/forms/form-fields/` | Form components |
| `SelectField.client.tsx` | `select-field.client.tsx` | `SelectField` | `src/components/forms/form-fields/` | Form components |
| `TextareaField.client.tsx` | `textarea-field.client.tsx` | `TextareaField` | `src/components/forms/form-fields/` | Form components |
| `TextField.client.tsx` | `text-field.client.tsx` | `TextField` | `src/components/forms/form-fields/` | Form components |

### Layout Components

| Current Filename | New Filename | Component Name | Location | Import Updates Needed |
|------------------|--------------|----------------|----------|------------------------|
| `admin-layout.tsx` | No change | `AdminLayout` | `src/components/layout/` | None |
| `bottom-nav.tsx` | No change | `BottomNav` | `src/components/layout/` | None |
| `employee-layout.tsx` | No change | `EmployeeLayout` | `src/components/layout/` | None |
| `navbar.tsx` | No change | `Navbar` | `src/components/layout/` | None |
| `sidebar-nav.tsx` | No change | `SidebarNav` | `src/components/layout/` | None |

### Provider Components

| Current Filename | New Filename | Component Name | Location | Import Updates Needed |
|------------------|--------------|----------------|----------|------------------------|
| `AppProviders.client.tsx` | `app-providers.client.tsx` | `AppProviders` | `src/components/providers/` | App layout component |
| `WizardStateProvider.client.tsx` | `wizard-state-provider.client.tsx` | `WizardStateProvider` | `src/components/providers/` | Wizard components |

### Route-Specific Components - Admin

| Current Filename | New Filename | Component Name | Location | Import Updates Needed |
|------------------|--------------|----------------|----------|------------------------|
| `AdminHeader.tsx` | `admin-header.tsx` | `AdminHeader` | `src/app/admin/_components/` | Admin layout components |
| `AdminLayout.tsx` | `admin-layout.tsx` | `AdminLayout` | `src/app/admin/_components/` | Admin pages |
| `JobsitesDataGrid.client.tsx` | `jobsites-data-grid.client.tsx` | `JobsitesDataGrid` | `src/app/admin/jobsites/_components/` | Jobsites page |
| `TicketsDataGrid.client.tsx` | `tickets-data-grid.client.tsx` | `TicketsDataGrid` | `src/app/admin/tickets/_components/` | Tickets admin page |
| `TrucksDataGrid.client.tsx` | `trucks-data-grid.client.tsx` | `TrucksDataGrid` | `src/app/admin/trucks/_components/` | Trucks admin page |
| `UsersDataGrid.client.tsx` | `users-data-grid.client.tsx` | `UsersDataGrid` | `src/app/admin/users/_components/` | Users admin page |

### Route-Specific Components - Employee Calendar

| Current Filename | New Filename | Component Name | Location | Import Updates Needed |
|------------------|--------------|----------------|----------|------------------------|
| `CalendarContent.client.tsx` | `calendar-content.client.tsx` | `CalendarContent` | `src/app/employee/calendar/_components/` | Calendar page |
| `CalendarFilters.client.tsx` | `calendar-filters.client.tsx` | `CalendarFilters` | `src/app/employee/calendar/_components/` | Calendar page |
| `CalendarNavigation.client.tsx` | `calendar-navigation.client.tsx` | `CalendarNavigation` | `src/app/employee/calendar/_components/` | Calendar page |
| `CalendarSearch.client.tsx` | `calendar-search.client.tsx` | `CalendarSearch` | `src/app/employee/calendar/_components/` | Calendar page |
| `CalendarView.tsx` | `calendar-view.tsx` | `CalendarView` | `src/app/employee/calendar/_components/` | Calendar page |
| `DayDetailSheet.client.tsx` | `day-detail-sheet.client.tsx` | `DayDetailSheet` | `src/app/employee/calendar/_components/` | Calendar page |
| `DaySelector.client.tsx` | `day-selector.client.tsx` | `DaySelector` | `src/app/employee/calendar/_components/` | Calendar page |

### Route-Specific Components - Employee Tickets

| Current Filename | New Filename | Component Name | Location | Import Updates Needed |
|------------------|--------------|----------------|----------|------------------------|
| `BasicInfoStep.client.tsx` | `basic-info-step.client.tsx` | `BasicInfoStep` | `src/app/employee/tickets/new/_components/` | Local route imports |
| `CategoriesStep.client.tsx` | `categories-step.client.tsx` | `CategoriesStep` | `src/app/employee/tickets/new/_components/` | Local route imports |
| `ConfirmationStep.client.tsx` | `confirmation-step.client.tsx` | `ConfirmationStep` | `src/app/employee/tickets/new/_components/` | Local route imports |
| `ImageUploadStep.client.tsx` | `image-upload-step.client.tsx` | `ImageUploadStep` | `src/app/employee/tickets/new/_components/` | Local route imports |
| `WizardContainer.client.tsx` | `wizard-container.client.tsx` | `WizardContainer` | `src/app/employee/tickets/new/_components/` | Local route imports |
| `WizardNavigation.client.tsx` | `wizard-navigation.client.tsx` | `WizardNavigation` | `src/app/employee/tickets/new/_components/` | Local route imports |
| `WizardProgress.client.tsx` | `wizard-progress.client.tsx` | `WizardProgress` | `src/app/employee/tickets/new/_components/` | Local route imports |

## Special Components to Review

The following components need further assessment to determine if they're duplicates or serve different purposes:

1. **Wizard Components**:
   - Both `/src/components/feature/tickets/wizard/` and `/src/app/employee/tickets/new/_components/` contain wizard components with identical names
   - Need to determine if these are duplicates or have different purposes
   - If duplicates, consider consolidation
   - If different, ensure clear documentation of their different purposes

## Implementation Strategy

### Phase 1: Preparation

1. **Backup the Codebase**: Create a backup or ensure all changes are committed to version control
2. **Verify Component Inventory**: Confirm all components are identified and properly categorized

### Phase 2: Component Renaming

Rename components in batches, grouped by directory for easier testing and verification:

#### Batch 1: Common Components

1. **Components to Rename**:
   - `ConnectionStatusDetector.client.tsx` → `connection-status-detector.client.tsx`
   - `Toast.client.tsx` → `toast.client.tsx`
   - `bottom-sheet/BottomSheet.client.tsx` → `bottom-sheet/bottom-sheet.client.tsx`
   - `bottom-sheet/DatePickerSheet.client.tsx` → `bottom-sheet/date-picker-sheet.client.tsx`
   - `bottom-sheet/JobsitePickerSheet.client.tsx` → `bottom-sheet/jobsite-picker-sheet.client.tsx`
   - `bottom-sheet/TruckPickerSheet.client.tsx` → `bottom-sheet/truck-picker-sheet.client.tsx`

2. **Steps for Each Component**:
   ```bash
   # For ConnectionStatusDetector.client.tsx:
   git mv src/components/common/ConnectionStatusDetector.client.tsx src/components/common/connection-status-detector.client.tsx
   
   # For Toast.client.tsx:
   git mv src/components/common/Toast.client.tsx src/components/common/toast.client.tsx
   
   # For bottom sheet components:
   git mv src/components/common/bottom-sheet/BottomSheet.client.tsx src/components/common/bottom-sheet/bottom-sheet.client.tsx
   git mv src/components/common/bottom-sheet/DatePickerSheet.client.tsx src/components/common/bottom-sheet/date-picker-sheet.client.tsx
   git mv src/components/common/bottom-sheet/JobsitePickerSheet.client.tsx src/components/common/bottom-sheet/jobsite-picker-sheet.client.tsx
   git mv src/components/common/bottom-sheet/TruckPickerSheet.client.tsx src/components/common/bottom-sheet/truck-picker-sheet.client.tsx
   ```

3. **Update Import Statements**:
   - Use search and replace to find all import statements referencing these components
   - Example search pattern: `from ['"]@/components/common/ConnectionStatusDetector\.client['"]`
   - Example replacement: `from '@/components/common/connection-status-detector.client'`

4. **Test Changes**:
   ```bash
   # Run build to verify no errors
   npm run build
   
   # Start the development server to test functionality
   npm run dev
   ```

5. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Rename common components to follow kebab-case convention"
   ```

#### Batch 2: Feature Components

1. **Tickets Feature Components**:
   ```bash
   # Rename Counter.client.tsx
   git mv src/components/feature/tickets/Counter.client.tsx src/components/feature/tickets/counter.client.tsx
   
   # Rename ImageUploadGrid.client.tsx
   git mv src/components/feature/tickets/ImageUploadGrid.client.tsx src/components/feature/tickets/image-upload-grid.client.tsx
   ```

2. **Wizard Components**:
   ```bash
   # Rename all wizard components
   git mv src/components/feature/tickets/wizard/AutoSaveIndicator.client.tsx src/components/feature/tickets/wizard/auto-save-indicator.client.tsx
   git mv src/components/feature/tickets/wizard/BasicInfoStep.client.tsx src/components/feature/tickets/wizard/basic-info-step.client.tsx
   git mv src/components/feature/tickets/wizard/CategoriesStep.client.tsx src/components/feature/tickets/wizard/categories-step.client.tsx
   git mv src/components/feature/tickets/wizard/ConfirmationStep.client.tsx src/components/feature/tickets/wizard/confirmation-step.client.tsx
   git mv src/components/feature/tickets/wizard/ImageUploadStep.client.tsx src/components/feature/tickets/wizard/image-upload-step.client.tsx
   git mv src/components/feature/tickets/wizard/SessionRecoveryPrompt.client.tsx src/components/feature/tickets/wizard/session-recovery-prompt.client.tsx
   git mv src/components/feature/tickets/wizard/WizardContainer.client.tsx src/components/feature/tickets/wizard/wizard-container.client.tsx
   git mv src/components/feature/tickets/wizard/WizardNavigation.client.tsx src/components/feature/tickets/wizard/wizard-navigation.client.tsx
   git mv src/components/feature/tickets/wizard/WizardProgress.client.tsx src/components/feature/tickets/wizard/wizard-progress.client.tsx
   ```

3. **Calendar Components**:
   ```bash
   # Rename DayCell.client.tsx
   git mv src/components/feature/calendar/DayCell.client.tsx src/components/feature/calendar/day-cell.client.tsx
   ```

4. **Update Import Statements and Test**:
   - Follow the same process as Batch 1 for updating imports and testing changes
   - Commit after verification: `git commit -m "Rename ticket and calendar feature components to follow kebab-case convention"`

#### Batch 3: Admin Feature Components

1. **Admin Components**:
   ```bash
   # Main admin components
   git mv src/components/feature/admin/AdminActionButton.client.tsx src/components/feature/admin/admin-action-button.client.tsx
   git mv src/components/feature/admin/ArchiveResultsTable.client.tsx src/components/feature/admin/archive-results-table.client.tsx
   git mv src/components/feature/admin/ArchiveSearchBar.client.tsx src/components/feature/admin/archive-search-bar.client.tsx
   git mv src/components/feature/admin/ExportButton.client.tsx src/components/feature/admin/export-button.client.tsx
   git mv src/components/feature/admin/ExportControls.client.tsx src/components/feature/admin/export-controls.client.tsx
   git mv src/components/feature/admin/ExportHistoryList.client.tsx src/components/feature/admin/export-history-list.client.tsx
   git mv src/components/feature/admin/TicketArchiveControls.client.tsx src/components/feature/admin/ticket-archive-controls.client.tsx
   git mv src/components/feature/admin/TicketDetailView.client.tsx src/components/feature/admin/ticket-detail-view.client.tsx
   git mv src/components/feature/admin/TicketStatusBadge.client.tsx src/components/feature/admin/ticket-status-badge.client.tsx
   ```

2. **Dashboard Components**:
   ```bash
   # Dashboard components
   git mv src/components/feature/admin/dashboard/CardConfigPanel.client.tsx src/components/feature/admin/dashboard/card-config-panel.client.tsx
   git mv src/components/feature/admin/dashboard/DashboardCard.client.tsx src/components/feature/admin/dashboard/dashboard-card.client.tsx
   git mv src/components/feature/admin/dashboard/DashboardLayout.client.tsx src/components/feature/admin/dashboard/dashboard-layout.client.tsx
   
   # Dashboard card components
   git mv src/components/feature/admin/dashboard/cards/ActivityCard.client.tsx src/components/feature/admin/dashboard/cards/activity-card.client.tsx
   git mv src/components/feature/admin/dashboard/cards/ChartCard.client.tsx src/components/feature/admin/dashboard/cards/chart-card.client.tsx
   git mv src/components/feature/admin/dashboard/cards/MetricCard.client.tsx src/components/feature/admin/dashboard/cards/metric-card.client.tsx
   git mv src/components/feature/admin/dashboard/cards/StatusCard.client.tsx src/components/feature/admin/dashboard/cards/status-card.client.tsx
   git mv src/components/feature/admin/dashboard/cards/TableCard.client.tsx src/components/feature/admin/dashboard/cards/table-card.client.tsx
   ```

3. **Data Grid Components**:
   ```bash
   # Data grid components
   git mv src/components/feature/admin/data-grid/ActionBar.client.tsx src/components/feature/admin/data-grid/action-bar.client.tsx
   git mv src/components/feature/admin/data-grid/DataGrid.client.tsx src/components/feature/admin/data-grid/data-grid.client.tsx
   git mv src/components/feature/admin/data-grid/DetailPanel.client.tsx src/components/feature/admin/data-grid/detail-panel.client.tsx
   git mv src/components/feature/admin/data-grid/EntityDetailView.client.tsx src/components/feature/admin/data-grid/entity-detail-view.client.tsx
   git mv src/components/feature/admin/data-grid/FilterBar.client.tsx src/components/feature/admin/data-grid/filter-bar.client.tsx
   git mv src/components/feature/admin/data-grid/FormPanel.client.tsx src/components/feature/admin/data-grid/form-panel.client.tsx
   ```

4. **Update Import Statements and Test**:
   - Follow the same process as previous batches
   - Commit: `git commit -m "Rename admin feature components to follow kebab-case convention"`

#### Batch 4: Form Components

1. **Form Components**:
   ```bash
   # Main form component
   git mv src/components/forms/Form.client.tsx src/components/forms/form.client.tsx
   
   # Form field components
   git mv src/components/forms/form-fields/CheckboxField.client.tsx src/components/forms/form-fields/checkbox-field.client.tsx
   git mv src/components/forms/form-fields/CounterField.client.tsx src/components/forms/form-fields/counter-field.client.tsx
   git mv src/components/forms/form-fields/DateField.client.tsx src/components/forms/form-fields/date-field.client.tsx
   git mv src/components/forms/form-fields/ImageUploadField.client.tsx src/components/forms/form-fields/image-upload-field.client.tsx
   git mv src/components/forms/form-fields/SelectField.client.tsx src/components/forms/form-fields/select-field.client.tsx
   git mv src/components/forms/form-fields/TextareaField.client.tsx src/components/forms/form-fields/textarea-field.client.tsx
   git mv src/components/forms/form-fields/TextField.client.tsx src/components/forms/form-fields/text-field.client.tsx
   ```

2. **Update, Test, and Commit**:
   - Follow the same process as previous batches
   - Commit: `git commit -m "Rename form components to follow kebab-case convention"`

#### Batch 5: Provider Components

1. **Provider Components**:
   ```bash
   git mv src/components/providers/AppProviders.client.tsx src/components/providers/app-providers.client.tsx
   git mv src/components/providers/WizardStateProvider.client.tsx src/components/providers/wizard-state-provider.client.tsx
   ```

2. **Update, Test, and Commit**:
   - Follow the same process as previous batches
   - Commit: `git commit -m "Rename provider components to follow kebab-case convention"`

#### Batch 6: Route-Specific Components

1. **Admin Route Components**:
   ```bash
   git mv src/app/admin/_components/AdminHeader.tsx src/app/admin/_components/admin-header.tsx
   git mv src/app/admin/_components/AdminLayout.tsx src/app/admin/_components/admin-layout.tsx
   git mv src/app/admin/jobsites/_components/JobsitesDataGrid.client.tsx src/app/admin/jobsites/_components/jobsites-data-grid.client.tsx
   git mv src/app/admin/tickets/_components/TicketsDataGrid.client.tsx src/app/admin/tickets/_components/tickets-data-grid.client.tsx
   git mv src/app/admin/trucks/_components/TrucksDataGrid.client.tsx src/app/admin/trucks/_components/trucks-data-grid.client.tsx
   git mv src/app/admin/users/_components/UsersDataGrid.client.tsx src/app/admin/users/_components/users-data-grid.client.tsx
   ```

2. **Employee Calendar Components**:
   ```bash
   git mv src/app/employee/calendar/_components/CalendarContent.client.tsx src/app/employee/calendar/_components/calendar-content.client.tsx
   git mv src/app/employee/calendar/_components/CalendarFilters.client.tsx src/app/employee/calendar/_components/calendar-filters.client.tsx
   git mv src/app/employee/calendar/_components/CalendarNavigation.client.tsx src/app/employee/calendar/_components/calendar-navigation.client.tsx
   git mv src/app/employee/calendar/_components/CalendarSearch.client.tsx src/app/employee/calendar/_components/calendar-search.client.tsx
   git mv src/app/employee/calendar/_components/CalendarView.tsx src/app/employee/calendar/_components/calendar-view.tsx
   git mv src/app/employee/calendar/_components/DayDetailSheet.client.tsx src/app/employee/calendar/_components/day-detail-sheet.client.tsx
   git mv src/app/employee/calendar/_components/DaySelector.client.tsx src/app/employee/calendar/_components/day-selector.client.tsx
   ```

3. **Employee Tickets Components**:
   ```bash
   git mv src/app/employee/tickets/new/_components/BasicInfoStep.client.tsx src/app/employee/tickets/new/_components/basic-info-step.client.tsx
   git mv src/app/employee/tickets/new/_components/CategoriesStep.client.tsx src/app/employee/tickets/new/_components/categories-step.client.tsx
   git mv src/app/employee/tickets/new/_components/ConfirmationStep.client.tsx src/app/employee/tickets/new/_components/confirmation-step.client.tsx
   git mv src/app/employee/tickets/new/_components/ImageUploadStep.client.tsx src/app/employee/tickets/new/_components/image-upload-step.client.tsx
   git mv src/app/employee/tickets/new/_components/WizardContainer.client.tsx src/app/employee/tickets/new/_components/wizard-container.client.tsx
   git mv src/app/employee/tickets/new/_components/WizardNavigation.client.tsx src/app/employee/tickets/new/_components/wizard-navigation.client.tsx
   git mv src/app/employee/tickets/new/_components/WizardProgress.client.tsx src/app/employee/tickets/new/_components/wizard-progress.client.tsx
   ```

4. **Update, Test, and Commit**:
   - Follow the same process as previous batches
   - Commit: `git commit -m "Rename route-specific components to follow kebab-case convention"`

### Phase 3: Component Duplication Resolution

#### Analyzing Wizard Component Duplication

The most significant duplication exists between `/src/components/feature/tickets/wizard/` and `/src/app/employee/tickets/new/_components/` directories. These include identical components with the same names:

1. `BasicInfoStep.client.tsx`
2. `CategoriesStep.client.tsx`
3. `ConfirmationStep.client.tsx`
4. `ImageUploadStep.client.tsx`
5. `WizardContainer.client.tsx`
6. `WizardNavigation.client.tsx`
7. `WizardProgress.client.tsx`

#### Step-by-Step Resolution Plan

1. **Analyze Component Differences**:

   ```bash
   # For each component pair, run a diff to identify differences
   diff src/components/feature/tickets/wizard/basic-info-step.client.tsx src/app/employee/tickets/new/_components/basic-info-step.client.tsx
   ```

2. **Create Decision Matrix**:

   | Component | Identical? | Differences | Recommended Action |
   |-----------|------------|-------------|-------------------|
   | BasicInfoStep | TBD | TBD | TBD |
   | CategoriesStep | TBD | TBD | TBD |
   | ConfirmationStep | TBD | TBD | TBD |
   | ImageUploadStep | TBD | TBD | TBD |
   | WizardContainer | TBD | TBD | TBD |
   | WizardNavigation | TBD | TBD | TBD |
   | WizardProgress | TBD | TBD | TBD |

3. **Implementation Options**:

   a) **If Components are Identical or Nearly Identical**:
      - Keep the components in `src/components/feature/tickets/wizard/`
      - Update imports in route-specific pages to use the feature components
      - Remove the duplicated components from `src/app/employee/tickets/new/_components/`

   b) **If Components Have Significant Differences**:
      - Extract common functionality into base components in `src/components/feature/tickets/wizard/`
      - Create route-specific extensions in `src/app/employee/tickets/new/_components/`
      - Use composition or inheritance to avoid code duplication
      - Clearly document the relationship between base and route-specific components

   c) **If Components Serve Different Purposes Despite Similar Names**:
      - Rename one set of components to better reflect their purpose
      - Document the specific purpose of each set of components
      - Consider refactoring to improve clarity

4. **Create Migration Script**:

   ```javascript
   // wizard-consolidation.js
   // Example script to consolidate wizard components if they're identical
   const fs = require('fs');
   const path = require('path');
   
   // Source and target directories
   const featureDir = 'src/components/feature/tickets/wizard/';
   const routeDir = 'src/app/employee/tickets/new/_components/';
   
   // Components to check
   const components = [
     'basic-info-step.client.tsx',
     'categories-step.client.tsx',
     'confirmation-step.client.tsx',
     'image-upload-step.client.tsx',
     'wizard-container.client.tsx',
     'wizard-navigation.client.tsx',
     'wizard-progress.client.tsx'
   ];
   
   // Check each component
   components.forEach(component => {
     const featurePath = path.join(featureDir, component);
     const routePath = path.join(routeDir, component);
     
     if (!fs.existsSync(featurePath) || !fs.existsSync(routePath)) {
       console.log(`One of the paths doesn't exist for ${component}`);
       return;
     }
     
     const featureContent = fs.readFileSync(featurePath, 'utf8');
     const routeContent = fs.readFileSync(routePath, 'utf8');
     

## Import Statement Updates

For each renamed component, import statements need to be updated throughout the codebase. Here's a template for updating imports:

### Example for `ConnectionStatusDetector.client.tsx`:

```typescript
// Old import
import ConnectionStatusDetector from '@/components/common/ConnectionStatusDetector.client';

// New import
import ConnectionStatusDetector from '@/components/common/connection-status-detector.client';
```

## Testing Approach

After each batch of changes:

1. **Build Verification**: Run `npm run build` to ensure no build errors
2. **Functionality Testing**: Test all affected features to ensure proper functioning
3. **Regression Testing**: Verify that no unexpected issues arise in other parts of the application

## Tools and Automation

To simplify the renaming process and reduce the risk of errors, we can use the following tools and scripts:

### 1. Import Path Finder Script

This Node.js script helps identify all import statements that need to be updated when renaming a component:

```javascript
// find-imports.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Component to search for (without extension)
const componentName = process.argv[2];
if (!componentName) {
  console.error('Please provide a component name to search for');
  process.exit(1);
}

// Use grep to find imports (works on Unix-based systems)
try {
  const result = execSync(`grep -r "from ['\\\"].*${componentName}['\\\"]" --include="*.tsx" --include="*.ts" src/`).toString();
  
  // Parse and display results
  const lines = result.split('\n').filter(Boolean);
  console.log(`Found ${lines.length} imports for ${componentName}:`);
  
  lines.forEach(line => {
    const [file, match] = line.split(':', 2);
    console.log(`${file.trim()}: ${match.trim()}`);
  });
} catch (error) {
  console.log(`No imports found for ${componentName} or error occurred.`);
}
```

Usage:
```bash
node find-imports.js ConnectionStatusDetector
```

### 2. Batch Rename Script

This script automates the process of renaming multiple files from PascalCase to kebab-case:

```javascript
// batch-rename.js
const fs = require('fs');
const path = require('path');

// Directory to process
const directory = process.argv[2];
if (!directory) {
  console.error('Please provide a directory path');
  process.exit(1);
}

// Function to convert PascalCase to kebab-case
function pascalToKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

// Process the directory
const files = fs.readdirSync(directory);
files.forEach(file => {
  // Skip non-typescript files and already kebab-case files
  if (!file.endsWith('.tsx') && !file.endsWith('.ts')) return;
  if (file.includes('-')) return;
  
  // Generate new filename
  const baseName = path.basename(file, path.extname(file));
  const ext = path.extname(file);
  const newBaseName = pascalToKebab(baseName);
  const newFile = newBaseName + ext;
  
  // Skip if no change needed
  if (file === newFile) return;
  
  // Rename file
  const oldPath = path.join(directory, file);
  const newPath = path.join(directory, newFile);
  
  console.log(`Renaming: ${file} → ${newFile}`);
  fs.renameSync(oldPath, newPath);
});
```

Usage:
```bash
node batch-rename.js src/components/feature/tickets/wizard/
```

### 3. Import Updater Script

This script updates import statements in all files after renaming components:

```javascript
// update-imports.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Old component name and new component name
const oldName = process.argv[2];
const newName = process.argv[3];

if (!oldName || !newName) {
  console.error('Please provide both old and new component names');
  process.exit(1);
}

// Find all imports of the old component
try {
  const result = execSync(`grep -r "from ['\\\"].*${oldName}['\\\"]" --include="*.tsx" --include="*.ts" src/`).toString();
  const lines = result.split('\n').filter(Boolean);
  
  console.log(`Found ${lines.length} imports to update.`);
  
  // Process each file that has imports
  const processedFiles = new Set();
  lines.forEach(line => {
    const [filePath] = line.split(':', 1);
    if (processedFiles.has(filePath)) return;
    
    processedFiles.add(filePath);
    console.log(`Processing ${filePath}...`);
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace imports
    // This regex matches imports with the old component name, preserving the path structure
    const regex = new RegExp(`(from\\s+['"])(.*)${oldName}(['"])`, 'g');
    const newContent = content.replace(regex, `$1$2${newName}$3`);
    
    // Write updated content back
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      console.log(`  Updated imports in ${filePath}`);
    }
  });
  
  console.log('Import updates completed.');
} catch (error) {
  console.error('Error updating imports:', error.message);
}
```

Usage:
```bash
node update-imports.js ConnectionStatusDetector connection-status-detector
```

## Success Criteria

The standardization will be considered successful when:

1. All component filenames follow kebab-case convention
2. All import statements are updated correctly
3. Application builds and functions correctly
4. Directory structure responsibilities are clearly documented
5. Component duplication issues are resolved
6. No regressions in functionality are introduced
7. Project passes all existing tests
8. Documentation is updated to reflect the new standards
