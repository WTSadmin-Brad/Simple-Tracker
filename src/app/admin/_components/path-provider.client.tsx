'use client';

/**
 * Path Provider Client Component
 * 
 * This client component uses the usePathname hook to get the current path
 * and passes it to children via a render prop pattern.
 */

import { usePathname } from 'next/navigation';

interface PathProviderProps {
  children: (currentPath: string) => React.ReactNode;
}

export default function PathProvider({ children }: PathProviderProps) {
  const pathname = usePathname();
  
  return <>{children(pathname)}</>;
}
