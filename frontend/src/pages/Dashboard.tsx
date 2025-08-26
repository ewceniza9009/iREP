import { useQuery } from '@apollo/client';
import {
  RectangleGroupIcon,
  BuildingOffice2Icon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';
import { GET_DASHBOARD_STATS } from '../graphql/dashboard';
import SummaryCard from '../components/SummaryCard';

// Define TypeScript types for the GraphQL query result
interface ProjectStats {
  total: number;
  planning: number;
  active: number;
  completed: number;
  onHold: number;
}

interface PropertyStats {
  total: number;
  available: number;
  pending: number;
}

interface DashboardData {
  projectStats: ProjectStats;
  propertyStats: PropertyStats;
}

// A simple progress bar component for visualizing stats breakdown
const StatProgressBar = ({ value, total, color = 'bg-blue-500' }: { value: number; total: number; color?: string }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
        <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

export default function DashboardPage() {
  const { loading, error, data } = useQuery<DashboardData>(GET_DASHBOARD_STATS);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="mt-4 text-gray-600 animate-pulse">Loading dashboard summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600 bg-red-50 rounded-lg">
        <h1 className="text-2xl font-bold">Error!</h1>
        <p className="mt-2">Could not load dashboard data: {error.message}</p>
      </div>
    );
  }
  
  const { projectStats, propertyStats } = data!;

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 flex-1">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard Overview</h1>
      <p className="mt-2 text-gray-600">Welcome back! Here's a summary of your organization's activity.</p>
      
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard title="Total Projects" value={projectStats.total} icon={RectangleGroupIcon}>
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between text-sm text-gray-600 font-medium"><span>Active</span><span>{projectStats.active}</span></div>
                    <StatProgressBar value={projectStats.active} total={projectStats.total} color="bg-green-500" />
                </div>
                <div>
                    <div className="flex justify-between text-sm text-gray-600 font-medium"><span>Planning</span><span>{projectStats.planning}</span></div>
                    <StatProgressBar value={projectStats.planning} total={projectStats.total} color="bg-yellow-500" />
                </div>
                 <div>
                    <div className="flex justify-between text-sm text-gray-600 font-medium"><span>Completed</span><span>{projectStats.completed}</span></div>
                    <StatProgressBar value={projectStats.completed} total={projectStats.total} color="bg-blue-500" />
                </div>
            </div>
        </SummaryCard>

        <SummaryCard title="Properties" value={propertyStats.total} icon={BuildingOffice2Icon}>
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between text-sm text-gray-600 font-medium"><span>Available</span><span>{propertyStats.available}</span></div>
                    <StatProgressBar value={propertyStats.available} total={propertyStats.total} color="bg-green-500" />
                </div>
                <div>
                    <div className="flex justify-between text-sm text-gray-600 font-medium"><span>Pending</span><span>{propertyStats.pending}</span></div>
                    <StatProgressBar value={propertyStats.pending} total={propertyStats.total} color="bg-yellow-500" />
                </div>
            </div>
        </SummaryCard>

        {/* Placeholder for Accounting Summary */}
        <SummaryCard title="Financials" value="N/A" icon={ChartPieIcon}>
            <p className="text-sm text-center text-gray-500 pt-4">Accounting data coming soon.</p>
        </SummaryCard>
      </div>

      {/* Placeholder for Real-time Activity */}
      <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-700">Recent Activity</h2>
          <div className="mt-4 p-6 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">Real-time activity feed will be displayed here.</p>
          </div>
      </div>
    </div>
  );
}