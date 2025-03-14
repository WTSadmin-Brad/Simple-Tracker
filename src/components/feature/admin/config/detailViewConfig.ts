/**
 * detailViewConfig.ts
 * Configuration for entity detail views in the admin interface
 * 
 * This file contains field definitions and tab configurations for all entity
 * detail pages, using a consistent configuration-based approach.
 */

import { format } from 'date-fns';
import { DetailField } from '../data-grid/DetailPanel.client';

// Ticket detail fields configuration
export const ticketDetailFields: DetailField[] = [
  {
    key: 'id',
    label: 'Ticket ID',
    type: 'text'
  },
  {
    key: 'date',
    label: 'Date',
    type: 'date',
    renderValue: (value) => format(new Date(value), 'MMMM d, yyyy')
  },
  {
    key: 'userId',
    label: 'Submitted By',
    type: 'text'
  },
  {
    key: 'truckNumber',
    label: 'Truck Number',
    type: 'text'
  },
  {
    key: 'truckNickname',
    label: 'Truck Nickname',
    type: 'text'
  },
  {
    key: 'jobsiteName',
    label: 'Jobsite',
    type: 'text'
  },
  {
    key: 'total',
    label: 'Total Tickets',
    type: 'text'
  },
  {
    key: 'submissionDate',
    label: 'Submission Date',
    type: 'date',
    renderValue: (value) => format(new Date(value), 'MMMM d, yyyy h:mm a')
  },
  {
    key: 'archiveStatus',
    label: 'Archive Status',
    type: 'status',
    renderValue: (value) => {
      switch (value) {
        case 'active':
          return <span className="text-green-600 font-medium">Active</span>;
        case 'images_archived':
          return <span className="text-amber-600 font-medium">Images Archived</span>;
        case 'fully_archived':
          return <span className="text-gray-600 font-medium">Fully Archived</span>;
        default:
          return value;
      }
    }
  }
];

// Ticket detail tabs configuration
export const ticketDetailTabs = [
  {
    id: 'details',
    label: 'Details',
    fields: ticketDetailFields
  },
  {
    id: 'categories',
    label: 'Categories',
    fields: [
      {
        key: 'categories',
        label: 'Ticket Categories',
        type: 'custom',
        renderValue: (categories) => {
          if (!categories) return <p>No categories data available</p>;
          
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {Object.entries(categories).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <span className="font-medium">{key}</span>
                  <span className="text-lg">{value}</span>
                </div>
              ))}
            </div>
          );
        }
      }
    ]
  },
  {
    id: 'images',
    label: 'Images',
    fields: [
      {
        key: 'images',
        label: 'Ticket Images',
        type: 'custom',
        renderValue: (images) => {
          if (!images || !Array.isArray(images) || images.length === 0) {
            return <p>No images available</p>;
          }
          
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-md border border-gray-200">
                  <img 
                    src={image.url} 
                    alt={`Ticket image ${index + 1}`} 
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          );
        }
      }
    ]
  }
];

// Jobsite detail fields configuration
export const jobsiteDetailFields: DetailField[] = [
  {
    key: 'id',
    label: 'Jobsite ID',
    type: 'text'
  },
  {
    key: 'name',
    label: 'Name',
    type: 'text'
  },
  {
    key: 'location',
    label: 'Location',
    type: 'text'
  },
  {
    key: 'address',
    label: 'Address',
    type: 'text'
  },
  {
    key: 'contactName',
    label: 'Contact Name',
    type: 'text'
  },
  {
    key: 'contactPhone',
    label: 'Contact Phone',
    type: 'text'
  },
  {
    key: 'status',
    label: 'Status',
    type: 'status',
    renderValue: (value) => {
      switch (value) {
        case 'active':
          return <span className="text-green-600 font-medium">Active</span>;
        case 'inactive':
          return <span className="text-gray-600 font-medium">Inactive</span>;
        default:
          return value;
      }
    }
  },
  {
    key: 'createdAt',
    label: 'Created At',
    type: 'date',
    renderValue: (value) => value ? format(new Date(value), 'MMMM d, yyyy') : 'N/A'
  }
];

// Jobsite detail tabs configuration
export const jobsiteDetailTabs = [
  {
    id: 'details',
    label: 'Details',
    fields: jobsiteDetailFields
  },
  {
    id: 'tickets',
    label: 'Recent Tickets',
    fields: [
      {
        key: 'recentTickets',
        label: 'Recent Tickets',
        type: 'list',
        renderValue: (tickets) => {
          if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
            return <p>No recent tickets</p>;
          }
          
          return (
            <div className="space-y-4 mt-2">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex justify-between">
                    <span className="font-medium">Ticket #{ticket.id}</span>
                    <span>{format(new Date(ticket.date), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Truck: {ticket.truckNumber} | Total: {ticket.total}
                  </div>
                </div>
              ))}
            </div>
          );
        }
      }
    ]
  }
];

// Truck detail fields configuration
export const truckDetailFields: DetailField[] = [
  {
    key: 'id',
    label: 'Truck ID',
    type: 'text'
  },
  {
    key: 'number',
    label: 'Truck Number',
    type: 'text'
  },
  {
    key: 'nickname',
    label: 'Nickname',
    type: 'text'
  },
  {
    key: 'type',
    label: 'Type',
    type: 'text'
  },
  {
    key: 'capacity',
    label: 'Capacity',
    type: 'text'
  },
  {
    key: 'status',
    label: 'Status',
    type: 'status',
    renderValue: (value) => {
      switch (value) {
        case 'active':
          return <span className="text-green-600 font-medium">Active</span>;
        case 'maintenance':
          return <span className="text-amber-600 font-medium">In Maintenance</span>;
        case 'inactive':
          return <span className="text-gray-600 font-medium">Inactive</span>;
        default:
          return value;
      }
    }
  },
  {
    key: 'lastMaintenance',
    label: 'Last Maintenance',
    type: 'date',
    renderValue: (value) => value ? format(new Date(value), 'MMMM d, yyyy') : 'N/A'
  }
];

// Truck detail tabs configuration
export const truckDetailTabs = [
  {
    id: 'details',
    label: 'Details',
    fields: truckDetailFields
  },
  {
    id: 'history',
    label: 'Ticket History',
    fields: [
      {
        key: 'ticketHistory',
        label: 'Ticket History',
        type: 'custom',
        renderValue: (history) => {
          if (!history || !Array.isArray(history) || history.length === 0) {
            return <p>No ticket history available</p>;
          }
          
          return (
            <div className="space-y-4 mt-2">
              {history.map((entry) => (
                <div key={entry.date} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="font-medium">{format(new Date(entry.date), 'MMMM yyyy')}</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-sm text-gray-500">Total Tickets:</span>
                      <div className="text-lg font-medium">{entry.totalTickets}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Total Load:</span>
                      <div className="text-lg font-medium">{entry.totalLoad}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        }
      }
    ]
  }
];

// User detail fields configuration
export const userDetailFields: DetailField[] = [
  {
    key: 'id',
    label: 'User ID',
    type: 'text'
  },
  {
    key: 'name',
    label: 'Name',
    type: 'text'
  },
  {
    key: 'email',
    label: 'Email',
    type: 'text'
  },
  {
    key: 'role',
    label: 'Role',
    type: 'status',
    renderValue: (value) => {
      switch (value) {
        case 'admin':
          return <span className="text-purple-600 font-medium">Administrator</span>;
        case 'manager':
          return <span className="text-blue-600 font-medium">Manager</span>;
        case 'driver':
          return <span className="text-green-600 font-medium">Driver</span>;
        default:
          return value;
      }
    }
  },
  {
    key: 'status',
    label: 'Status',
    type: 'status',
    renderValue: (value) => {
      switch (value) {
        case 'active':
          return <span className="text-green-600 font-medium">Active</span>;
        case 'inactive':
          return <span className="text-gray-600 font-medium">Inactive</span>;
        case 'suspended':
          return <span className="text-red-600 font-medium">Suspended</span>;
        default:
          return value;
      }
    }
  },
  {
    key: 'createdAt',
    label: 'Created At',
    type: 'date',
    renderValue: (value) => value ? format(new Date(value), 'MMMM d, yyyy') : 'N/A'
  },
  {
    key: 'lastLogin',
    label: 'Last Login',
    type: 'date',
    renderValue: (value) => value ? format(new Date(value), 'MMMM d, yyyy h:mm a') : 'Never'
  }
];

// User detail tabs configuration
export const userDetailTabs = [
  {
    id: 'details',
    label: 'Details',
    fields: userDetailFields
  },
  {
    id: 'activity',
    label: 'Activity',
    fields: [
      {
        key: 'recentActivity',
        label: 'Recent Activity',
        type: 'custom',
        renderValue: (activity) => {
          if (!activity || !Array.isArray(activity) || activity.length === 0) {
            return <p>No recent activity</p>;
          }
          
          return (
            <div className="space-y-4 mt-2">
              {activity.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.action}</span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(item.timestamp), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <div className="mt-1 text-sm">
                    {item.description}
                  </div>
                </div>
              ))}
            </div>
          );
        }
      }
    ]
  }
];
