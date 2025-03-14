/**
 * Admin Header Component
 * 
 * This server component provides the header for all admin pages,
 * including the title, description, and action buttons.
 * 
 * @source Project Requirements - Admin Section
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  description?: string;
  backLink?: string;
  children?: React.ReactNode;
}

export default function AdminHeader({ 
  title, 
  description, 
  backLink, 
  children 
}: AdminHeaderProps) {
  return (
    <div className="space-y-2 mb-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {backLink && (
            <Link 
              href={backLink} 
              className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 mr-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          )}
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {children}
        </div>
      </div>
      
      {description && (
        <p className="text-gray-500">{description}</p>
      )}
    </div>
  );
}
