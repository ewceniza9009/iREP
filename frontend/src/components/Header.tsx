import { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { UserCircleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Header() {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('You have been logged out.');
    } catch (error) {
      toast.error('Logout failed. Please try again.');
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="flex items-center justify-end h-16 px-4 bg-white shadow-sm shrink-0 sm:px-6 md:px-8">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <UserCircleIcon className="h-6 w-6 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{user?.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Logout"
        >
          <ArrowLeftOnRectangleIcon className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
}