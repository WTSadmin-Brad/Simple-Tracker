'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PencilIcon, CheckIcon } from 'lucide-react';
import DashboardLayout from '@/components/feature/admin/dashboard/dashboard-layout.client';

export function DashboardClient() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-500">
          {isEditing
            ? "Customize your dashboard by adding, moving, and resizing cards."
            : "View and analyze key metrics and activities."}
        </p>

        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "default" : "outline"}
          className="ml-4"
        >
          {isEditing ? (
            <>
              <CheckIcon className="h-4 w-4 mr-2" />
              Save Layout
            </>
          ) : (
            <>
              <PencilIcon className="h-4 w-4 mr-2" />
              Customize Dashboard
            </>
          )}
        </Button>
      </div>

      <DashboardLayout
        isEditing={isEditing}
        onEditComplete={() => setIsEditing(false)}
      />
    </div>
  );
}

// Optional: Default export if preferred
// export default DashboardClient;