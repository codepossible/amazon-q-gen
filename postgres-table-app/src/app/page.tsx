"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Schema {
  schema_name: string;
}

interface Table {
  table_name: string;
}

export default function Home() {
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<string>('public');
  const [tables, setTables] = useState<Table[]>([]);
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch schemas
  useEffect(() => {
    async function fetchSchemas() {
      try {
        const response = await fetch('/api/schemas');
        if (!response.ok) {
          throw new Error('Failed to fetch schemas');
        }
        const data = await response.json();
        setSchemas(data.schemas);
      } catch (err: any) {
        setError(err.message);
      }
    }

    fetchSchemas();
  }, []);

  // Fetch tables when schema changes
  useEffect(() => {
    async function fetchTables() {
      setLoading(true);
      try {
        const response = await fetch(`/api/tables-list?schema=${selectedSchema}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tables');
        }
        const data = await response.json();
        setTables(data.tables);
        setFilteredTables(data.tables);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setTables([]);
        setFilteredTables([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTables();
  }, [selectedSchema]);

  // Filter tables based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTables(tables);
    } else {
      const filtered = tables.filter(table => 
        table.table_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTables(filtered);
    }
  }, [searchTerm, tables]);

  // Handle click outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle schema change
  const handleSchemaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSchema(e.target.value);
    setSelectedTable('');
    setSearchTerm('');
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
  };

  // Handle table selection from dropdown
  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    setSearchTerm(tableName);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">PostgreSQL Table Viewer</h1>
      
      <div className="w-full max-w-md">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Schema Selector */}
        <div className="mb-4">
          <label htmlFor="schema" className="block text-sm font-medium text-gray-700 mb-1">
            Select Schema
          </label>
          <select
            id="schema"
            value={selectedSchema}
            onChange={handleSchemaChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {schemas.map((schema) => (
              <option key={schema.schema_name} value={schema.schema_name}>
                {schema.schema_name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Table Search with Typeahead */}
        <div className="mb-4 relative" ref={dropdownRef}>
          <label htmlFor="tableName" className="block text-sm font-medium text-gray-700 mb-1">
            Search Table
          </label>
          <input
            type="text"
            id="tableName"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setIsDropdownOpen(true)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Type to search tables..."
          />
          
          {/* Dropdown for typeahead */}
          {isDropdownOpen && filteredTables.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto">
              {loading ? (
                <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
              ) : filteredTables.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500">No tables found</div>
              ) : (
                filteredTables.map((table) => (
                  <div
                    key={table.table_name}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleTableSelect(table.table_name)}
                  >
                    {table.table_name}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        <Link 
          href={selectedTable ? `/tables/${selectedTable}?schema=${selectedSchema}` : '#'}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${!selectedTable && 'opacity-50 cursor-not-allowed'}`}
          onClick={(e) => !selectedTable && e.preventDefault()}
        >
          View Table
        </Link>
      </div>
    </div>
  );
}