/**
 * Admin Sidebar Navigation
 * 
 * Server component that provides the sidebar navigation for the admin section.
 * Contains links to all admin management areas.
 */

import Link from 'next/link';
import { 
  HomeIcon, 
  TruckIcon, 
  UsersIcon, 
  MapPinIcon, 
  TicketIcon, 
  ArchiveIcon, 
  DownloadIcon 
} from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

function NavItem({ href, icon, label, isActive = false }: NavItemProps) {
  return (
    <Link 
      href={href}
      className={`
        flex items-center px-4 py-3 text-sm font-medium rounded-md
        ${isActive 
          ? 'bg-primary/10 text-primary' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }
      `}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Link>
  );
}

interface AdminSidebarNavProps {
  currentPath: string;
}

export default function AdminSidebarNav({ currentPath }: AdminSidebarNavProps) {
  const navItems = [
    {
      href: '/admin/dashboard',
      icon: <HomeIcon className="h-5 w-5" />,
      label: 'Dashboard'
    },
    {
      href: '/admin/tickets',
      icon: <TicketIcon className="h-5 w-5" />,
      label: 'Tickets'
    },
    {
      href: '/admin/trucks',
      icon: <TruckIcon className="h-5 w-5" />,
      label: 'Trucks'
    },
    {
      href: '/admin/jobsites',
      icon: <MapPinIcon className="h-5 w-5" />,
      label: 'Jobsites'
    },
    {
      href: '/admin/users',
      icon: <UsersIcon className="h-5 w-5" />,
      label: 'Users'
    },
    {
      href: '/admin/archive',
      icon: <ArchiveIcon className="h-5 w-5" />,
      label: 'Archive'
    },
    {
      href: '/admin/export',
      icon: <DownloadIcon className="h-5 w-5" />,
      label: 'Export'
    }
  ];

  return (
    <div className="py-6 px-3">
      <div className="mb-8 px-4">
        <h2 className="text-lg font-bold text-gray-900">Admin</h2>
        <p className="text-sm text-gray-500">System Management</p>
      </div>
      
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavItem 
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={currentPath.startsWith(item.href)}
          />
        ))}
      </nav>
    </div>
  );
}
