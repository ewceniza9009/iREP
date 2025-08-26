import React from 'react';

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  children?: React.ReactNode;
  className?: string;
}

export default function SummaryCard({ title, value, icon: Icon, children, className = '' }: SummaryCardProps) {
  return (
    <div className={`p-6 bg-white rounded-lg shadow-md ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="mt-1 text-4xl font-bold text-gray-800">{value}</p>
        </div>
        <div className="p-3 bg-blue-100 rounded-full">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}