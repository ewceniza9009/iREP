import { NavLink } from 'react-router-dom';
import {
  ChartBarIcon,
  BuildingOffice2Icon,
  RectangleGroupIcon,
} from '@heroicons/react/24/outline';
import React from 'react';

// The type for a Heroicon component is a React Function Component that accepts SVG props.
type HeroIcon = React.FC<React.SVGProps<SVGSVGElement>>;

interface NavItem {
  href: string;
  label: string;
  icon: HeroIcon;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: ChartBarIcon },
  { href: '/properties', label: 'Properties', icon: BuildingOffice2Icon },
  { href: '/projects', label: 'Projects', icon: RectangleGroupIcon },
];

export default function Sidebar() {
  return (
    <aside className="flex-col hidden w-64 bg-gray-800 md:flex shrink-0">
      <div className="flex items-center justify-center h-16 text-2xl font-bold text-white">
        iREP
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.href}
            end // Use 'end' for the root path to prevent it from matching all routes
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <item.icon className="h-6 w-6 shrink-0 mr-3" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}