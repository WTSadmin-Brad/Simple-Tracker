/**
 * ArchiveSearchBar Component
 * 
 * Provides a search interface for the archive system with a search box
 * and submit button.
 */

'use client';

import { useState, FormEvent } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ArchiveSearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  isLoading?: boolean;
}

export function ArchiveSearchBar({ 
  onSearch, 
  initialQuery = '', 
  isLoading = false 
}: ArchiveSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-lg gap-2">
      <div className="relative flex-grow">
        <Input
          type="text"
          placeholder="Search archives..."
          className="pr-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
          aria-label="Search archives"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
          <Search size={18} />
        </div>
      </div>
      <Button type="submit" disabled={isLoading || !query.trim()}>
        {isLoading ? 'Searching...' : 'Search'}
      </Button>
    </form>
  );
}
