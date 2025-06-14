"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Column {
  column_name: string;
  data_type: string;
}

interface TableData {
  [key: string]: any;
}

interface SearchFilter {
  [key: string]: string;
}

export default function TablePage({ params }: { params: { tableName: string } }) {
  const { tableName } = params;
  const [columns, setColumns] = useState<Column[]>([]);
  const [data, setData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilter>({});
  const [dateColumn, setDateColumn] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Fetch table columns
  useEffect(() => {
    async function fetchColumns() {
      try {
        const response = await fetch(`/api/tables/columns?tableName=${tableName}`);
        if (!response.ok) {
          throw new Error('Failed to fetch columns');
        }
        const result = await response.json();
        setColumns(result.columns);
      } catch (err: any) {
        setError(err.message);
      }
    }

    fetchColumns();
  }, [tableName]);

  // Fetch table data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Start with base URL
        let url = `/api/tables?tableName=${tableName}`;
        
        // Add column filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            url += `&${key}=${encodeURIComponent(value)}`;
          }
        });
        
        // Add date range filters
        if (dateColumn) {
          url += `&dateColumn=${dateColumn}`;
          if (dateFrom) url += `&dateFrom=${dateFrom}`;
          if (dateTo) url += `&dateTo=${dateTo}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const result = await response.json();
        setData(result.data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [tableName, filters, dateColumn, dateFrom, dateTo]);

  // Update filter for a specific column
  const updateFilter = (column: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setDateColumn('');
    setDateFrom('');
    setDateTo('');
  };

  // Get date columns
  const dateColumns = columns.filter(col => 
    ['date', 'timestamp', 'timestamptz'].includes(col.data_type)
  );

  if (error) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <Link 
          href="/"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Table: {tableName}</h1>
        <Link 
          href="/"
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to Home
        </Link>
      </div>

      {/* Search Form */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Search</h2>
        
        {/* Column Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {columns.slice(0, 3).map((column) => (
            <div key={column.column_name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {column.column_name}
              </label>
              <input
                type="text"
                value={filters[column.column_name] || ''}
                onChange={(e) => updateFilter(column.column_name, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={`Filter by ${column.column_name}`}
              />
            </div>
          ))}
        </div>
        
        {/* Date Range Filter */}
        {dateColumns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Column</label>
              <select
                value={dateColumn}
                onChange={(e) => setDateColumn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select date column</option>
                {dateColumns.map((col) => (
                  <option key={col.column_name} value={col.column_name}>
                    {col.column_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={!dateColumn}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={!dateColumn}
              />
            </div>
          </div>
        )}
        
        {/* Filter Actions */}
        <div className="flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center py-4">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-center py-4">No data found</p>
        ) : (
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                {columns.map((column) => (
                  <th 
                    key={column.column_name}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                  >
                    {column.column_name}
                    <div className="text-xs font-normal text-gray-400">{column.data_type}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {columns.map((column) => (
                    <td 
                      key={`${rowIndex}-${column.column_name}`}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-b"
                    >
                      {row[column.column_name] !== null ? String(row[column.column_name]) : 'null'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}