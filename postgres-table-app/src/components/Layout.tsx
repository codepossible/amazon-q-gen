"use client";

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { user } = await getCurrentUser();
      setIsAuthenticated(!!user);
      setLoading(false);
    }
    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div className="container mx-auto px-4 py-8">{children}</div>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}