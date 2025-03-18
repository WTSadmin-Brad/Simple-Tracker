/**
 * 403 Forbidden Page
 * 
 * Displays when a user attempts to access a resource they don't have permission for
 */

import { ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="container flex max-w-md flex-col items-center space-y-6 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        
        <h1 className="text-4xl font-bold tracking-tight">Access Denied</h1>
        
        <p className="text-muted-foreground">
          You don&apos;t have permission to access this page. If you believe this is an error,
          please contact your administrator.
        </p>
        
        <div className="flex gap-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
