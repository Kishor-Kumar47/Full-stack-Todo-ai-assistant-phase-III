'use client';

import { useRouter } from 'next/navigation';
import { removeAuthToken } from '../../services/auth';

export default function Navigation() {
  const router = useRouter();

  const handleLogout = () => {
    removeAuthToken();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Todo App</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}