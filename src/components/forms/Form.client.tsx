/**
 * form.client.tsx
 * 
 * A reusable form component with built-in validation using React Hook Form and Zod.
 * 
 * @source directory-structure.md - "Form Components" section
 */

'use client';

import React from 'react';
import { useForm, FormProvider, SubmitHandler, UseFormProps, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';

interface FormProps<T extends FieldValues> {
  /** Form schema for validation */
  schema?: z.ZodType<T>;
  /** Default values for the form */
  defaultValues?: UseFormProps<T>['defaultValues'];
  /** Form submission handler */
  onSubmit: SubmitHandler<T>;
  /** Children components */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Form ID */
  id?: string;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  /** Whether the form is disabled */
  disabled?: boolean;
}

/**
 * Form component with React Hook Form and Zod validation
 * Provides a consistent form structure with built-in validation
 */
export function Form<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
  id,
  isSubmitting = false,
  disabled = false,
}: FormProps<T>) {
  // Initialize form with React Hook Form
  const methods = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
    mode: 'onBlur', // Validate on blur for better UX
  });

  // Handle form submission with loading state protection
  const handleSubmit = methods.handleSubmit(async (data) => {
    if (!isSubmitting && !disabled) {
      await onSubmit(data);
    }
  });

  return (
    <FormProvider {...methods}>
      <form
        id={id}
        className={cn(className)}
        onSubmit={handleSubmit}
        noValidate // Use our own validation
      >
        <fieldset 
          disabled={isSubmitting || disabled} 
          className="space-y-4"
        >
          {children}
        </fieldset>
      </form>
    </FormProvider>
  );
}

/**
 * Form Section component for grouping related form fields
 * Creates a visual section with optional title and description
 */
export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Section header with title and description */}
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-medium">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      
      {/* Section content */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

/**
 * Form Actions component for form buttons
 * Provides consistent positioning and spacing for form actions
 */
export function FormActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-end space-x-2 pt-4", className)}>
      {children}
    </div>
  );
}
