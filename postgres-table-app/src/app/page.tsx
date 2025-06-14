"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [tableName, setTableName] = useState('');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">PostgreSQL Table Viewer</h1>
      
      <div className="w-full max-w-md">
        <div className="mb-4">
          <label htmlFor="tableName" className="block text-sm font-medium text-gray-700 mb-1">
            Enter Table Name
          </label>
          <input
            type="text"
            id="tableName"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g. users, products, orders"
          />
        </div>
        
        <Link 
          href={tableName ? `/tables/${tableName}` : '#'}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${!tableName && 'opacity-50 cursor-not-allowed'}`}
          onClick={(e) => !tableName && e.preventDefault()}
        >
          View Table
        </Link>
      </div>
    </div>
  );
}