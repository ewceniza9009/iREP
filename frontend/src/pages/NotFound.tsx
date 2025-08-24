import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-100 p-4">
      <h1 className="text-5xl md:text-6xl font-bold text-gray-800">404</h1>
      <p className="text-lg md:text-xl mt-4 text-gray-600">Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="mt-8 px-6 py-3 text-white font-semibold bg-blue-600 rounded-md shadow-md hover:bg-blue-700 transition-colors">
        Go Back Home
      </Link>
    </div>
  );
}
