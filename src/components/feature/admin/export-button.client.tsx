/**
 * export-button.client.tsx
 * Client Component for data export functionality in admin views
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button.client';
import { FileDownIcon } from 'lucide-react';

interface ExportButtonProps {
  label?: string;
  onExport: () => Promise<void>;
  disabled?: boolean;
}

export default function ExportButton({
  label = 'Export Data',
  onExport,
  disabled = false
}: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await onExport();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || isLoading}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
      ) : (
        <FileDownIcon className="h-4 w-4" />
      )}
      <span>{label}</span>
    </Button>
  );
}
