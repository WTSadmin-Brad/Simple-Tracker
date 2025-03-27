'use client';

/**
 * Calendar Search Component (Client Component)
 * 
 * Provides search functionality for finding specific dates or events in the calendar.
 * Features:
 * - Date parsing from multiple formats
 * - Text search in jobsite names and notes
 * - Real-time search results display
 * - Responsive design for all screen sizes
 * 
 * @source Employee_Flows.md - "Calendar Search Functionality" section
 */

import { useState, useEffect } from 'react';
import { format, parse, isValid, parseISO } from 'date-fns';
import { Search, Calendar, X, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCalendarViewState, useCalendarDataFetching } from '@/stores/calendarStore';
import { DATE_FORMATS } from '@/lib/constants/dateFormats';

/**
 * Props for the Calendar Search component
 */
interface CalendarSearchProps {
  /** Optional className to apply to the container */
  className?: string;
  /** Optional callback for when a search result is selected */
  onResultSelect?: (date: Date) => void;
}

/**
 * Calendar Search component with date and text search capabilities
 */
export function CalendarSearch({
  className = "",
  onResultSelect
}: CalendarSearchProps) {
  const { setCurrentDate, setSelectedDate } = useCalendarViewState();
  const { getWorkdaysInRange } = useCalendarDataFetching();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{ date: Date; reason?: string }[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Clear search results when query is empty
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      setShowResults(false);
      setError(null);
    }
  }, [searchQuery]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      setError(null);
      return;
    }

    setIsSearching(true);
    setShowResults(true);
    setError(null);

    try {
      // Try to parse the query as a date first (support various formats)
      const dateFormats = [
        DATE_FORMATS.API_DATE, 
        'MM/dd/yyyy', 
        'MM-dd-yyyy', 
        'MMM d, yyyy'
      ];
      
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
          const ticketSummary = workday.ticketSummary ? 'has tickets' : '';
          
          return jobsite.includes(query) || 
                notes.includes(query) || 
                ticketSummary.includes(query);
        })
        .map(workday => ({
          date: new Date(workday.date),
          reason: workday.jobsite || 'Matching workday'
        }));
      
      setSearchResults(results);
    } catch (err) {
      console.error('Error during search:', err);
      setError('An error occurred during search');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (date: Date) => {
    try {
      setCurrentDate(date);
      setSelectedDate(date);
      
      if (onResultSelect) {
        onResultSelect(date);
      }
      
      setSearchQuery('');
      setShowResults(false);
      setError(null);
    } catch (err) {
      console.error('Error selecting result:', err);
      setError('Unable to select date');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setError(null);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" aria-hidden="true" />
          </div>
          
          <Input
            type="text"
            placeholder="Search dates or events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-10 touch-target"
            aria-label="Search calendar"
            aria-autocomplete="list"
            aria-controls={showResults ? "search-results" : undefined}
            aria-expanded={showResults}
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
                aria-label="Clear search"
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
          aria-label="Search"
        >
          {isSearching ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
              <span className="hidden sm:inline">Searching</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4 sm:mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">Search</span>
            </>
          )}
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Enhanced Search Results Dropdown */}
      {showResults && (
        <div 
          id="search-results"
          className="absolute z-10 mt-1 w-full bg-card rounded-md shadow-lg border border-border max-h-64 overflow-auto"
          role="listbox"
          aria-label="Search results"
        >
          {searchResults.length > 0 ? (
            <ul className="py-1">
              {searchResults.map((result, index) => (
                <li 
                  key={index}
                  className="px-4 py-3 hover:bg-muted cursor-pointer touch-target flex items-start gap-3"
                  onClick={() => handleResultClick(result.date)}
                  role="option"
                  aria-selected="false"
                >
                  <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="font-medium">{format(result.date, DATE_FORMATS.FULL_DATE)}</div>
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
                  <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-2" aria-hidden="true" />
                  <p className="text-muted-foreground">Searching...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Search className="h-8 w-8 text-muted-foreground mb-2" aria-hidden="true" />
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