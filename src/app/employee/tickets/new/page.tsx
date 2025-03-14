/**
 * New Ticket Submission Page
 * Displays the 4-step wizard for ticket submission
 */

import { WizardContainer } from './_components/WizardContainer.client';

export default function NewTicketPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">New Ticket Submission</h1>
      
      <WizardContainer />
    </div>
  );
}
