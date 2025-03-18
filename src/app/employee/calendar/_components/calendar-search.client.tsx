'use client';

/**
 * Calendar Search Component (Client Component)
 * Provides search functionality for finding specific dates or events in the calendar
 * 
 * Enhanced with better responsive layout:
 * - Improved search input and button for all screen sizes
 * - Better search results display with proper touch targets
 * - Enhanced visual feedback during search operations
 */

import { useState, useEffect } from 'react';
import { format, parse, isValid } from 'date-fns';
import { Search, Calendar, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useCalendarStore from '@/stores/calendarStore';

export function CalendarSearch() {
  const { setCurrentDate, setSelectedDate, getWorkdaysInRange } = useCalendarStore();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{ date: Date; reason?: string }[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);

  // Clear search results when query is empty
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    // Try to parse the query as a date first (support various formats)
    const dateFormats = ['yyyy-MM-dd', 'MM/dd/yyyy', 'MM-dd-yyyy', 'MMM d, yyyy'];
    let parsedDate: Date | null = null;

    // Try each format until one works
    for (const format of dateFormats) {
      const attemptParse = parse(searchQuery, format, new Date());
      if (isValid(attemptParse)) {
        parsedDate = attemptParse;
        break;
      }
    }

    if (parsedDate && isValid(parsedDate)) {
      // If valid date, go directly to that date
      setSearchResults([{ date: parsedDate }]);
      setIsSearching(false);
      return;
    }

    // Otherwise, search for workdays with matching text in jobsite or notes
    // Get workdays for the current year (wider search range)
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1); // Jan 1
    const endDate = new Date(currentYear, 11, 31); // Dec 31
    
    const workdays = getWorkdaysInRange(startDate, endDate);
    
    // Filter workdays that match the search query
    const results = workdays
      .filter(workday => {
        const query = searchQuery.toLowerCase();
        const jobsite = workday.jobsite?.toLowerCase() || '';
        const notes = workday.notes?.toLowerCase() || '';
        const ticketSummary = workday.ticketSummary?.toLowerCase() || '';
        
        return jobsite.includes(query) || 
               notes.includes(query) || 
               ticketSummary.includes(query);
      })
      .map(workday => ({
        date: new Date(workday.date),
        reason: workday.jobsite || 'Matching workday'
      }));
    
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleResultClick = (date: Date) => {
    setCurrentDate(date);
    setSelectedDate(date);
    setSearchQuery('');
    setShowResults(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          
          <Input
            type="text"
            placeholder="Search dates or events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-10 touch-target"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          
          {searchQuery && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <Button 
          onClick={handleSearch}
          disabled={!searchQuery.trim() || isSearching}
          className="h-10 px-3 sm:px-4 touch-target"
        >
          {isSearching ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span className="hidden sm:inline">Searching</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Search</span>
            </>
          )}
        </Button>
      </div>

      {/* Enhanced Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-10 mt-1 w-full bg-card rounded-md shadow-lg border border-border max-h-64 overflow-auto">
          {searchResults.length > 0 ? (
            <ul className="py-1">
              {searchResults.map((result, index) => (
                <li 
                  key={index}
                  className="px-4 py-3 hover:bg-muted cursor-pointer touch-target flex items-start gap-3"
                  onClick={() => handleResultClick(result.date)}
                >
                  <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">{format(result.date, 'MMMM d, yyyy')}</div>
                    {result.reason && (
                      <div className="text-sm text-muted-foreground mt-1">{result.reason}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center">
              {isSearching ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
                  <p className="text-muted-foreground">Searching...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Search className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No results found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different search term or date format</p>
                </div>
              )}
            </div>
          )}
          
          {searchResults.length > 0 && (
            <div className="p-2 border-t border-border">
              <Badge variant="secondary" className="text-xs">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </Badge>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CalendarSearch;
