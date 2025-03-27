/**
 * Admin Layout
 * 
 * This server component provides the layout wrapper for all admin pages,
 * including consistent navigation, header, and content structure.
 * Uses Next.js App Router layout pattern to automatically apply to all admin pages.
 */

import React from 'react';
import AdminSidebarNav from './_components/admin-sidebar-nav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MenuIcon } from 'lucide-react';
import PathProvider from './_components/path-provider.client';

export const metadata = {
  title: 'Admin | Simple Tracker',
  description: 'Administration portal for Simple Tracker',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PathProvider>
      {(currentPath) => (
        <div className="flex min-h-screen bg-gray-50">
          {/* Desktop Sidebar Navigation */}
          <div className="hidden md:block w-64 bg-white shadow-md border-r border-gray-200 overflow-y-auto">
            <AdminSidebarNav currentPath={currentPath} />
          </div>
          
          <div className="flex-1 flex flex-col">
            {/* Mobile Header with Menu Button */}
            <header className="bg-white shadow-sm h-16 flex items-center px-4 md:px-6 border-b border-gray-200">
              {/* Mobile Menu Button */}
              <div className="md:hidden mr-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MenuIcon className="h-5 w-5" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 max-w-[250px]">
                    <AdminSidebarNav currentPath={currentPath} />
                  </SheetContent>
                </Sheet>
              </div>
              
              {/* App Title/Logo */}
              <div className="flex-1 md:hidden">
                <h1 className="text-lg font-semibold">Simple Tracker</h1>
              </div>
              
              {/* User Menu (TODO: Implement user dropdown) */}
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
              </div>
            </header>
            
            <main className="flex-1 overflow-auto p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      )}
    </PathProvider>
  );
}
