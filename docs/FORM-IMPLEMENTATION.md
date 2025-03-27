# Simple Tracker Form Implementation

## Table of Contents

1. [Overview](#overview)
2. [Form Management Libraries](#form-management-libraries)
3. [Form Component Structure](#form-component-structure)
4. [Validation Patterns](#validation-patterns)
5. [Form Submission Patterns](#form-submission-patterns)
6. [Form State Management](#form-state-management)
7. [Wizard Form Implementation](#wizard-form-implementation)
8. [Best Practices](#best-practices)

## Overview

Simple Tracker uses a structured approach to form implementation, leveraging React Hook Form for state management and Zod for schema validation. This document outlines the patterns and approaches used for form implementation throughout the application.

## Form Management Libraries

### React Hook Form

React Hook Form is used for form state management with the following benefits:
- Minimal re-renders
- Uncontrolled components by default
- Easy validation integration
- Performance optimizations

```typescript
// Example React Hook Form usage
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema
const schema = z.object({
  truckNumber: z.string().min(1, 'Truck number is required'),
  jobsite: z.string().min(1, 'Jobsite is required'),
});

// Define type from schema
type FormValues = z.infer<typeof schema>;

// Use form hook
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: {
    truckNumber: '',
    jobsite: '',
  },
});

// Form submission handler
const onSubmit = (data: FormValues) => {
  console.log(data);
};
```

### Zod

Zod is used for schema validation with the following benefits:
- TypeScript integration
- Runtime validation
- Schema composition
- Error messages

```typescript
// Example Zod schema
import { z } from 'zod';

const ticketSchema = z.object({
  // Basic info
  date: z.string().min(1, 'Date is required'),
  truckNumber: z.string().min(1, 'Truck number is required'),
  truckNickname: z.string().optional(),
  jobsite: z.string().min(1, 'Jobsite is required'),
  jobsiteName: z.string().min(1, 'Jobsite name is required'),
  
  // Categories
  hangers: z.number().int().min(0).max(150),
  leaner6To12: z.number().int().min(0).max(150),
  leaner13To24: z.number().int().min(0).max(150),
  leaner25To36: z.number().int().min(0).max(150),
  leaner37To48: z.number().int().min(0).max(150),
  leaner49Plus: z.number().int().min(0).max(150),
});

// Type inference
type TicketFormValues = z.infer<typeof ticketSchema>;
```

## Form Component Structure

### Form Components

Form components are structured with the following pattern:

```tsx
// Example form component
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ticketSchema } from '@/lib/schemas/ticket-schema';

type TicketFormProps = {
  onSubmit: (data: TicketFormValues) => void;
  defaultValues?: Partial<TicketFormValues>;
  isLoading?: boolean;
};

export function TicketForm({ onSubmit, defaultValues, isLoading }: TicketFormProps) {
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: defaultValues || {
      date: new Date().toISOString().split('T')[0],
      truckNumber: '',
      truckNickname: '',
      jobsite: '',
      jobsiteName: '',
      hangers: 0,
      leaner6To12: 0,
      leaner13To24: 0,
      leaner25To36: 0,
      leaner37To48: 0,
      leaner49Plus: 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="truckNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Truck Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Additional form fields */}
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Form>
  );
}
```

### Form Field Components

Specialized form field components are used for different data types:

```tsx
// Example form field component
import { useController } from 'react-hook-form';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

type FormInputProps = {
  name: string;
  label: string;
  control: any;
  rules?: any;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
};

export function FormInput({
  name,
  label,
  control,
  rules,
  defaultValue = '',
  placeholder,
  type = 'text',
}: FormInputProps) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
  });

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Input
          {...field}
          type={type}
          placeholder={placeholder}
          className={error ? 'border-red-500' : ''}
        />
      </FormControl>
      <FormMessage>{error?.message}</FormMessage>
    </FormItem>
  );
}
```

## Validation Patterns

### Schema-Based Validation

Zod schemas are used for form validation:

```typescript
// Example validation schema
const ticketSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  truckNumber: z.string().min(1, 'Truck number is required'),
  jobsite: z.string().min(1, 'Jobsite is required'),
  
  // Conditional validation
  categories: z.object({
    hangers: z.number().int().min(0).max(150),
    leaner6To12: z.number().int().min(0).max(150),
    leaner13To24: z.number().int().min(0).max(150),
    leaner25To36: z.number().int().min(0).max(150),
    leaner37To48: z.number().int().min(0).max(150),
    leaner49Plus: z.number().int().min(0).max(150),
  }).refine(
    (data) => Object.values(data).some(value => value > 0),
    {
      message: 'At least one category must have a value greater than 0',
      path: ['categories'],
    }
  ),
});
```

### Custom Validation

Custom validation functions are used for complex validation logic:

```typescript
// Example custom validation
const validateImageFiles = (files: File[]) => {
  if (files.length === 0) {
    return 'At least one image is required';
  }
  
  if (files.length > 10) {
    return 'Maximum 10 images allowed';
  }
  
  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      return 'Only image files are allowed';
    }
    
    if (file.size > 5 * 1024 * 1024) {
      return 'Image size must be less than 5MB';
    }
  }
  
  return true;
};
```

## Form Submission Patterns

### React Query Mutations

Form submissions use React Query mutations:

```typescript
// Example form submission with React Query
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ticketService } from '@/lib/services/ticketService';
import { QUERY_KEYS } from '@/lib/queryKeys';

export function useCreateTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, ticketData }: { 
      userId: string; 
      ticketData: CreateTicketData 
    }) => ticketService.createTicket(userId, ticketData),
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.tickets] });
      toast.success('Ticket created successfully');
    },
    onError: (error) => {
      // Handle error
      toast.error(errorHandler.getUserFriendlyMessage(error));
    }
  });
}
```

### Form Submission Flow

The typical form submission flow is:

1. **Form Validation**: Validate form data using Zod schema
2. **Data Transformation**: Transform form data if needed
3. **API Call**: Submit data to API using React Query mutation
4. **Success Handling**: Show success message and update UI
5. **Error Handling**: Show error message and handle errors

```tsx
// Example form submission component
function TicketFormContainer() {
  const { mutate, isPending } = useCreateTicket();
  const userId = useUserId(); // Custom hook to get user ID
  
  const handleSubmit = (data: TicketFormValues) => {
    // Transform data if needed
    const transformedData = {
      ...data,
      date: new Date(data.date).toISOString(),
    };
    
    // Submit data
    mutate({
      userId,
      ticketData: transformedData,
    });
  };
  
  return (
    <TicketForm
      onSubmit={handleSubmit}
      isLoading={isPending}
    />
  );
}
```

## Form State Management

### Form State Persistence

Form state is persisted using Zustand for multi-step forms:

```typescript
// Example form state store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WizardState {
  currentStep: number;
  stepData: {
    step1?: WizardStep1Data;
    step2?: WizardStep2Data;
    step3?: WizardStep3Data;
  };
  setCurrentStep: (step: number) => void;
  setStepData: (step: number, data: any) => void;
  resetWizard: () => void;
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      currentStep: 1,
      stepData: {},
      setCurrentStep: (step) => set({ currentStep: step }),
      setStepData: (step, data) => set((state) => ({
        stepData: {
          ...state.stepData,
          [`step${step}`]: data,
        },
      })),
      resetWizard: () => set({ currentStep: 1, stepData: {} }),
    }),
    {
      name: 'wizard-storage',
      // Add expiration for abandoned sessions
      partialize: (state) => ({
        currentStep: state.currentStep,
        stepData: state.stepData,
        timestamp: Date.now(), // Add timestamp for expiration check
      }),
      onRehydrateStorage: () => (state) => {
        // Check for expiration (24 hours)
        if (state && state.timestamp) {
          const now = Date.now();
          const expirationTime = 24 * 60 * 60 * 1000; // 24 hours
          
          if (now - state.timestamp > expirationTime) {
            // Reset if expired
            state.resetWizard();
          }
        }
      },
    }
  )
);
```

### Form Reset and Initialization

Form reset and initialization patterns:

```tsx
// Example form reset and initialization
function TicketForm() {
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      // Default values
    },
  });
  
  // Reset form with new values
  const resetForm = (newValues: Partial<TicketFormValues>) => {
    form.reset({
      ...form.getValues(),
      ...newValues,
    });
  };
  
  // Initialize form with data from API
  useEffect(() => {
    if (ticketData) {
      form.reset(ticketData);
    }
  }, [ticketData, form]);
  
  return (
    // Form JSX
  );
}
```

## Wizard Form Implementation

### Wizard Pattern

The ticket submission wizard follows a multi-step form pattern:

```tsx
// Example wizard component
function TicketWizard() {
  const { currentStep, setCurrentStep, stepData, setStepData, resetWizard } = useWizardStore();
  
  const handleStepSubmit = (step: number, data: any) => {
    setStepData(step, data);
    setCurrentStep(step + 1);
  };
  
  const handleFinalSubmit = async () => {
    try {
      // Combine data from all steps
      const combinedData = {
        ...stepData.step1,
        ...stepData.step2,
        ...stepData.step3,
      };
      
      // Submit data
      await ticketService.createTicket(userId, combinedData);
      
      // Reset wizard on success
      resetWizard();
      
      // Show success message
      toast.success('Ticket submitted successfully');
    } catch (error) {
      // Handle error
      toast.error(errorHandler.getUserFriendlyMessage(error));
    }
  };
  
  return (
    <div>
      <WizardProgress currentStep={currentStep} totalSteps={4} />
      
      {currentStep === 1 && (
        <BasicInfoStep
          defaultValues={stepData.step1}
          onSubmit={(data) => handleStepSubmit(1, data)}
        />
      )}
      
      {currentStep === 2 && (
        <CategoriesStep
          defaultValues={stepData.step2}
          onSubmit={(data) => handleStepSubmit(2, data)}
          onBack={() => setCurrentStep(1)}
        />
      )}
      
      {currentStep === 3 && (
        <ImageUploadStep
          defaultValues={stepData.step3}
          onSubmit={(data) => handleStepSubmit(3, data)}
          onBack={() => setCurrentStep(2)}
        />
      )}
      
      {currentStep === 4 && (
        <ConfirmationStep
          data={stepData}
          onSubmit={handleFinalSubmit}
          onBack={() => setCurrentStep(3)}
        />
      )}
    </div>
  );
}
```

### Step Components

Each wizard step is implemented as a separate form component:

```tsx
// Example step component
function BasicInfoStep({ defaultValues, onSubmit }) {
  const form = useForm<WizardStep1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues,
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Form fields */}
        <Button type="submit">Next</Button>
      </form>
    </Form>
  );
}
```

## Best Practices

### Form Implementation Best Practices

1. **Schema-Based Validation**: Use Zod schemas for all forms
2. **Consistent Error Handling**: Use consistent error messages and display patterns
3. **Loading States**: Show loading states during form submission
4. **Form Reset**: Reset forms after successful submission
5. **Form Initialization**: Initialize forms with default values or data from API

### Form Accessibility Best Practices

1. **Keyboard Navigation**: Ensure forms are navigable using keyboard
2. **Error Announcements**: Announce errors to screen readers
3. **Label Association**: Associate labels with form controls
4. **Focus Management**: Manage focus during form submission and errors
5. **Descriptive Error Messages**: Provide clear, descriptive error messages

### Form Performance Best Practices

1. **Uncontrolled Components**: Use uncontrolled components when possible
2. **Memoization**: Memoize expensive calculations and callbacks
3. **Lazy Validation**: Validate on submit rather than on change for complex forms
4. **Debounced Validation**: Debounce validation for fields that trigger expensive operations
5. **Optimistic Updates**: Use optimistic updates for better user experience
