/**
 * Hook for responsive design media queries
 * Provides utilities for responsive design throughout the application
 * with predefined breakpoints and convenience hooks.
 * 
 * @source directory-structure.md - "Custom Hooks" section
 * @source Mobile_Optimization.md - "Responsive Design" section
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
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Create the media query list
    const mediaQuery = window.matchMedia(query);
    
    // Set the initial value
    setMatches(mediaQuery.matches);

    // Define a callback for when the match state changes
    const handleChange = (event: MediaQueryListEvent): void => {
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
  /** Small devices (640px and up) */
  sm: '(min-width: 640px)',
  /** Medium devices (768px and up) */
  md: '(min-width: 768px)',
  /** Large devices (1024px and up) */
  lg: '(min-width: 1024px)',
  /** Extra large devices (1280px and up) */
  xl: '(min-width: 1280px)',
  /** 2X large devices (1536px and up) */
  '2xl': '(min-width: 1536px)',
  
  // Special queries
  /** Landscape orientation */
  landscape: '(orientation: landscape)',
  /** Portrait orientation */
  portrait: '(orientation: portrait)',
  /** Touch-based devices */
  touchDevice: '(hover: none) and (pointer: coarse)',
  /** Mouse-based devices */
  mouseDevice: '(hover: hover) and (pointer: fine)',
  /** Reduced motion preference */
  reducedMotion: '(prefers-reduced-motion: reduce)',
  /** Dark mode preference */
  darkMode: '(prefers-color-scheme: dark)',
  /** Light mode preference */
  lightMode: '(prefers-color-scheme: light)'
};

/**
 * Hook to detect if the device is a mobile phone (< 768px)
 * 
 * @returns Boolean indicating if the device is a mobile phone
 */
export function useIsMobile(): boolean {
  return !useMediaQuery(breakpoints.md);
}

/**
 * Hook to detect if the device is a tablet (768px - 1023px)
 * 
 * @returns Boolean indicating if the device is a tablet
 */
export function useIsTablet(): boolean {
  return useMediaQuery(breakpoints.md) && !useMediaQuery(breakpoints.lg);
}

/**
 * Hook to detect if the device is a desktop (>= 1024px)
 * 
 * @returns Boolean indicating if the device is a desktop
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(breakpoints.lg);
}

/**
 * Hook to detect if the device is in landscape orientation
 * 
 * @returns Boolean indicating if the device is in landscape orientation
 */
export function useIsLandscape(): boolean {
  return useMediaQuery(breakpoints.landscape);
}

/**
 * Hook to detect if the device has touch input
 * 
 * @returns Boolean indicating if the device has touch input
 */
export function useIsTouchDevice(): boolean {
  return useMediaQuery(breakpoints.touchDevice);
}
