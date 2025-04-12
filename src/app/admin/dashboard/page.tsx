/**
 * Admin Dashboard Page
 * 
 * This component displays the main admin dashboard with summary statistics
 * and quick access to key admin functions using a customizable card layout.
 * 
 * @source Project Requirements - Admin Section
 */

import React from 'react';
import { DashboardClient } from './_components/dashboard-client'; // Import the extracted client component

// Server component wrapper
export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Client component for interactive dashboard */}
      <DashboardClient />
    </div>
  );
}
// Removed the inline DashboardClient component definition