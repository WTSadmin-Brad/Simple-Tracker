/**
 * Hook for responsive design media queries
 * 
 * @source directory-structure.md - "Custom Hooks" section
 * @source MEMORY - "Mobile-first PWA for field workers"
 */

import { useState, useEffect } from 'react';

/**
 * Hook to detect if a media query matches
 * Used for responsive design throughout the application
 * 
 * @param query The media query to match against
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create the media query list
    const mediaQuery = window.matchMedia(query);
    
    // Set the initial value
    setMatches(mediaQuery.matches);

    // Define a callback for when the match state changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add the callback as a listener
    mediaQuery.addEventListener('change', handleChange);

    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Predefined breakpoints for the application
 * Following mobile-first approach
 */
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
  
  // Special queries
  landscape: '(orientation: landscape)',
  portrait: '(orientation: portrait)',
  touchDevice: '(hover: none) and (pointer: coarse)',
  mouseDevice: '(hover: hover) and (pointer: fine)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  darkMode: '(prefers-color-scheme: dark)',
  lightMode: '(prefers-color-scheme: light)'
};

/**
 * Convenience hooks for common breakpoints
 */
export function useIsMobile() {
  return !useMediaQuery(breakpoints.md);
}

export function useIsTablet() {
  return useMediaQuery(breakpoints.md) && !useMediaQuery(breakpoints.lg);
}

export function useIsDesktop() {
  return useMediaQuery(breakpoints.lg);
}

export function useIsLandscape() {
  return useMediaQuery(breakpoints.landscape);
}

export function useIsTouchDevice() {
  return useMediaQuery(breakpoints.touchDevice);
}
