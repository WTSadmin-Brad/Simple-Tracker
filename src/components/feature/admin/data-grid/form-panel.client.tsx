/**
 * form-panel.client.tsx
 * Form panel component for admin data management pages
 * 
 * @source Admin_Flows.md - "Data Management" section
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormField, FormPanelProps } from './types';

/**
 * Form panel component for admin data management pages
 */
export function FormPanel({
  isOpen,
  onClose,
  title,
  fields,
  initialData = null,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  isLoading = false,
  error = null,
  schema,
  formId = 'admin-form',
  className = ''
}: FormPanelProps) {
  // Generate schema from fields if not provided
  const [generatedSchema, setGeneratedSchema] = useState<z.ZodTypeAny | null>(null);
  
  // Generate schema from fields
  useEffect(() => {
    if (!schema) {
      const schemaFields: Record<string, z.ZodTypeAny> = {};
      
      fields.forEach(field => {
        if (field.validation) {
          schemaFields[field.name] = field.validation;
        } else {
          // Default validation based on field type
          switch (field.type) {
            case 'text':
            case 'textarea':
              schemaFields[field.name] = z.string().optional();
              break;
            case 'number':
              schemaFields[field.name] = z.number().optional();
              break;
            case 'select':
              if (field.options && field.options.length > 0) {
                schemaFields[field.name] = z.enum([field.options[0].value, ...field.options.slice(1).map(opt => opt.value)]).optional();
              } else {
                schemaFields[field.name] = z.string().optional();
              }
              break;
            case 'date':
              schemaFields[field.name] = z.string().optional();
              break;
            case 'checkbox':
              schemaFields[field.name] = z.boolean().optional();
              break;
            case 'radio':
              if (field.options && field.options.length > 0) {
                schemaFields[field.name] = z.enum([field.options[0].value, ...field.options.slice(1).map(opt => opt.value)]).optional();
              } else {
                schemaFields[field.name] = z.string().optional();
              }
              break;
            case 'file':
              schemaFields[field.name] = z.any().optional();
              break;
            default:
              schemaFields[field.name] = z.any().optional();
          }
        }
      });
      
      setGeneratedSchema(z.object(schemaFields));
    }
  }, [fields, schema]);
  
  // Initialize form
  const formSchema = schema || generatedSchema;
  const form = useForm({
    resolver: formSchema ? zodResolver(formSchema) : undefined,
    defaultValues: initialData || {},
  });
  
  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({});
    }
  }, [initialData, form]);
  
  // Handle form submission
  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });
  
  // Render field based on type
  const renderField = (field: FormField) => {
    return (
      <Controller
        key={field.name}
        name={field.name}
        control={form.control}
        defaultValue={field.defaultValue !== undefined ? field.defaultValue : ''}
        render={({ field: formField, fieldState, formState }) => {
          // Custom render function
          if (field.type === 'custom' && field.renderField) {
            return field.renderField({ field: formField, fieldState, formState });
          }
          
          // Default rendering based on field type
          switch (field.type) {
            case 'textarea':
              return (
                <textarea
                  id={field.name}
                  className={`block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-300 ${
                    fieldState.error ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  placeholder={field.placeholder}
                  rows={4}
                  {...formField}
                />
              );
              
            case 'number':
              return (
                <input
                  type="number"
                  id={field.name}
                  className={`block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-300 ${
                    fieldState.error ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  placeholder={field.placeholder}
                  {...formField}
                  onChange={(e) => {
                    const value = e.target.value === '' ? '' : Number(e.target.value);
                    formField.onChange(value);
                  }}
                />
              );
              
            case 'select':
              return (
                <select
                  id={field.name}
                  className={`block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-300 ${
                    fieldState.error ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  {...formField}
                >
                  <option value="">{field.placeholder || 'Select an option'}</option>
                  {field.options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              );
              
            case 'date':
              return (
                <input
                  type="date"
                  id={field.name}
                  className={`block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-300 ${
                    fieldState.error ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  {...formField}
                />
              );
              
            case 'checkbox':
              return (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={field.name}
                    className={`h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 ${
                      fieldState.error ? 'border-red-300 dark:border-red-700 focus:ring-red-500' : ''
                    }`}
                    {...formField}
                    checked={!!formField.value}
                  />
                  <label htmlFor={field.name} className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                    {field.label}
                  </label>
                </div>
              );
              
            case 'radio':
              return (
                <div className="space-y-2">
                  {field.options?.map(option => (
                    <div key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        id={`${field.name}-${option.value}`}
                        name={field.name}
                        value={option.value}
                        className={`h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 ${
                          fieldState.error ? 'border-red-300 dark:border-red-700 focus:ring-red-500' : ''
                        }`}
                        checked={formField.value === option.value}
                        onChange={() => formField.onChange(option.value)}
                      />
                      <label htmlFor={`${field.name}-${option.value}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              );
              
            case 'file':
              return (
                <input
                  type="file"
                  id={field.name}
                  className={`block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 dark:file:bg-primary-900 file:text-primary-700 dark:file:text-primary-200 hover:file:bg-primary-100 dark:hover:file:bg-primary-800 ${
                    fieldState.error ? 'text-red-500 dark:text-red-400' : ''
                  }`}
                  onChange={(e) => {
                    formField.onChange(e.target.files?.[0] || null);
                  }}
                />
              );
              
            default:
              return (
                <input
                  type="text"
                  id={field.name}
                  className={`block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-300 ${
                    fieldState.error ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  placeholder={field.placeholder}
                  {...formField}
                />
              );
          }
        }}
      />
    );
  };
  
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
            
            <motion.div
              className={`fixed inset-y-0 right-0 flex max-w-full pl-10 ${className}`}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="w-screen max-w-md">
                <div className="flex h-full flex-col overflow-y-auto bg-white dark:bg-gray-800 shadow-xl">
                  <div className="px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {title}
                      </h2>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className="rounded-md bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          onClick={onClose}
                        >
                          <span className="sr-only">Close panel</span>
                          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative flex-1 px-4 sm:px-6">
                    {/* Error message */}
                    {error && (
                      <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400 dark:text-red-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                              Error
                            </h3>
                            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                              <p>{error}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Form */}
                    <form id={formId} onSubmit={handleSubmit}>
                      <div className="space-y-6">
                        {fields.map(field => (
                          <div key={field.name} className={field.type === 'checkbox' ? '' : 'space-y-1'}>
                            {field.type !== 'checkbox' && (
                              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                              </label>
                            )}
                            {renderField(field)}
                            {form.formState.errors[field.name] && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {form.formState.errors[field.name]?.message?.toString() || 'This field is required'}
                              </p>
                            )}
                            {field.helperText && !form.formState.errors[field.name] && (
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {field.helperText}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </form>
                  </div>
                  
                  <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        onClick={onClose}
                        disabled={isLoading}
                      >
                        {cancelLabel}
                      </button>
                      <button
                        type="submit"
                        form={formId}
                        className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : null}
                        {submitLabel}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
}

export default FormPanel;
