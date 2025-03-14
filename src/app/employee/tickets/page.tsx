/**
 * Employee Tickets Page
 * Redirects to the new ticket submission page
 */

import { redirect } from 'next/navigation';

export default function TicketsPage() {
  redirect('/employee/tickets/new');
}
