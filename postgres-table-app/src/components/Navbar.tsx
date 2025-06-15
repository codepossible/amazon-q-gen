"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut } from '@/lib/auth';

export default function Navbar() {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const { user } = await getCurrentUser();
      if (user) {
        setUsername(user.attributes.given_name);
      }
      setLoading(false);
      
    }

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    setUsername(null);
    if (!error) {
      router.push('/login');
    }
  };

  return (
    <nav className="bg-indigo-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          PostgreSQL Table Viewer
        </Link>
        
        {!loading && (
          <div className="flex items-center space-x-4">
            {username && (
              <>
                <span className="hidden md:inline">Welcome, {username}</span>
                <button 
                  onClick={handleSignOut}
                  className="bg-white text-indigo-600 px-4 py-2 rounded hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}