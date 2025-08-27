import { useQuery } from '@apollo/client';
import { useEffect, useState, useContext } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import {
  RectangleGroupIcon,
  BuildingOffice2Icon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';
import { GET_DASHBOARD_STATS } from '../graphql/dashboard';
import SummaryCard from '../components/SummaryCard';
import { AuthContext } from '../auth/AuthContext';
import toast from 'react-hot-toast';

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

interface RealtimeEvent {
  event: string;
  data: any;
  timestamp: string;
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
  const { user, accessToken } = useContext(AuthContext);
  const { loading, error, data, refetch } = useQuery<DashboardData>(GET_DASHBOARD_STATS);
  const [recentActivity, setRecentActivity] = useState<RealtimeEvent[]>([]);

  useEffect(() => {
    if (!user || !accessToken) {
      return;
    }

    const hubConnection = new HubConnectionBuilder()
      .withUrl(import.meta.env.VITE_REALTIME_URL, { // FIX: Removed the extra '/events' as it's already in the environment variable.
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    // Listen for real-time updates
    hubConnection.on('ReceiveUpdate', (message: string) => {
      try {
        const event: RealtimeEvent = JSON.parse(message);
        console.log("Real-time update received:", event);
        setRecentActivity(prev => [event, ...prev.slice(0, 4)]); // Keep a log of recent events
        toast.success(`New activity: ${event.event.replace('_', ' ')}`);
        // Re-fetch dashboard stats to reflect the changes
        refetch();
      } catch (e) {
        console.error("Failed to parse real-time message:", e);
      }
    });

    // Start the connection
    hubConnection.start()
      .then(() => console.log("SignalR Connected!"))
      .catch(err => console.error("SignalR Connection Failed: ", err));
    
    // Cleanup function
    return () => {
      hubConnection.stop();
    };
  }, [user, accessToken, refetch]);

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

      {/* Real-time Activity Feed */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-700">Recent Activity</h2>
        <div className="mt-4 p-6 bg-white rounded-lg shadow-md">
          {recentActivity.length > 0 ? (
            <ul className="space-y-4">
              {recentActivity.map((event, index) => (
                <li key={index} className="border-b pb-2 last:border-b-0">
                  <p className="text-sm font-medium text-gray-800">
                    <span className="text-blue-600 font-semibold">{event.event.replace('_', ' ')}:</span> Task "{event.data.name}" updated to {event.data.status} ({event.data.progress}% progress).
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Real-time activity feed will appear here as you make changes.</p>
          )}
        </div>
      </div>
    </div>
  );
}