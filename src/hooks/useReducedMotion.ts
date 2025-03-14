/**
 * Hook for detecting user preference for reduced motion
 * 
 * @source directory-structure.md - "Custom Hooks" section
 * @source MEMORY - "Use `useReducedMotion` hook for accessibility"
 */

import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user prefers reduced motion
 * Used to provide accessible animations throughout the application
 * 
 * TODO: Implement with actual media query detection
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for the prefers-reduced-motion media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set the initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Define a callback for when the preference changes
    const handleMediaChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add the callback as a listener
    mediaQuery.addEventListener('change', handleMediaChange);

    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  return prefersReducedMotion;
}
