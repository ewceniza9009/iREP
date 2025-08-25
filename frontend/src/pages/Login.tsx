import { useState, FormEvent, useContext, useEffect } from 'react'; // Import useEffect
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../auth/AuthContext';
import { ApolloError } from '@apollo/client';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@acme.realty.com');
  const [password, setPassword] = useState('password123');
  const { login, user } = useContext(AuthContext); // Get the user from context
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // This effect will run whenever the 'user' object changes.
  useEffect(() => {
    // If the user object exists, it means login was successful.
    if (user) {
      toast.success('Login successful!');
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // The handler's only job is to call login.
      // The useEffect hook will handle the navigation.
      await login(email, password);
    } catch (error: any) {
      if (error instanceof ApolloError) {
        const errorMessage = error.graphQLErrors[0]?.message || 'An unexpected error occurred.';
        toast.error(errorMessage);
      } else {
        toast.error('Failed to log in. Please check your credentials.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">iREP Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}