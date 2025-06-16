"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

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

interface FilterItem {
  column: string;
  value: string;
}

interface DateFilter {
  column: string;
  fromDate: string;
  toDate: string;
}

type SortDirection = 'asc' | 'desc' | null;

export default function TablePage({ params }: { params: { tableName: string } }) {
  const { tableName } = params;
  const searchParams = useSearchParams();
  const schema = searchParams.get('schema') || 'public';
  
  const [columns, setColumns] = useState<Column[]>([]);
  const [data, setData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilter>({});
  const [filterItems, setFilterItems] = useState<FilterItem[]>([]);
  const [dateColumn, setDateColumn] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [dateFilters, setDateFilters] = useState<DateFilter[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [selectedDateColumn, setSelectedDateColumn] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [expandedText, setExpandedText] = useState<{ text: string; isOpen: boolean }>({ text: '', isOpen: false });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch table columns
  useEffect(() => {
    async function fetchColumns() {
      try {
        const response = await fetch(`/api/tables/columns?tableName=${tableName}&schema=${schema}`);
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
  }, [tableName, schema]);

  // Fetch table data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Start with base URL
        let url = `/api/tables?tableName=${tableName}&schema=${schema}&page=${currentPage}`;
        
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
        setTotalPages(result.pagination.totalPages);
        setTotalCount(result.pagination.totalCount);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [tableName, schema, filters, dateColumn, dateFrom, dateTo, currentPage]);
  
  // Sort data when sort parameters change
  useEffect(() => {
    if (sortColumn && sortDirection) {
      const sortedData = [...data].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        // Handle null values
        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return sortDirection === 'asc' ? -1 : 1;
        if (bValue === null) return sortDirection === 'asc' ? 1 : -1;
        
        // Compare based on type
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        // Default string comparison
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        return sortDirection === 'asc' 
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      });
      
      setData(sortedData);
    }
  }, [sortColumn, sortDirection]);

  // Add a new filter
  const addFilter = () => {
    if (selectedColumn && !filterItems.some(item => item.column === selectedColumn)) {
      setFilterItems([...filterItems, { column: selectedColumn, value: '' }]);
      setSelectedColumn('');
    }
  };

  // Update filter value
  const updateFilterValue = (index: number, value: string) => {
    const newFilters = [...filterItems];
    newFilters[index].value = value;
    setFilterItems(newFilters);
  };

  // Remove a filter
  const removeFilter = (index: number) => {
    setFilterItems(filterItems.filter((_, i) => i !== index));
  };

  // Add a new date filter
  const addDateFilter = () => {
    if (selectedDateColumn && !dateFilters.some(filter => filter.column === selectedDateColumn)) {
      setDateFilters([...dateFilters, { column: selectedDateColumn, fromDate: '', toDate: '' }]);
      setSelectedDateColumn('');
    }
  };

  // Update date filter
  const updateDateFilter = (index: number, field: 'fromDate' | 'toDate', value: string) => {
    const newDateFilters = [...dateFilters];
    newDateFilters[index][field] = value;
    setDateFilters(newDateFilters);
  };

  // Remove a date filter
  const removeDateFilter = (index: number) => {
    setDateFilters(dateFilters.filter((_, i) => i !== index));
  };

  // Apply filters
  const applyFilters = () => {
    const newFilters: SearchFilter = {};
    filterItems.forEach(item => {
      if (item.value) {
        newFilters[item.column] = item.value;
      }
    });
    
    setFilters(newFilters);
    
    // Use the first date filter for the API (current API only supports one date filter)
    if (dateFilters.length > 0) {
      const firstDateFilter = dateFilters[0];
      setDateColumn(firstDateFilter.column);
      setDateFrom(firstDateFilter.fromDate);
      setDateTo(firstDateFilter.toDate);
    } else {
      setDateColumn('');
      setDateFrom('');
      setDateTo('');
    }
    
    setCurrentPage(1); // Reset to first page when applying new filters
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setFilterItems([]);
    setDateColumn('');
    setDateFilters([]);
    setDateFrom('');
    setDateTo('');
    setSortColumn(null);
    setSortDirection(null);
    setCurrentPage(1);
  };
  
  // Initialize filters from current filters
  useEffect(() => {
    const items: FilterItem[] = [];
    Object.entries(filters).forEach(([column, value]) => {
      items.push({ column, value });
    });
    setFilterItems(items);
    
    // Initialize date filter if one exists
    if (dateColumn) {
      setDateFilters([{
        column: dateColumn,
        fromDate: dateFrom,
        toDate: dateTo
      }]);
    }
  }, []);
  
  // Handle column sorting
  const handleSort = (columnName: string) => {
    if (sortColumn === columnName) {
      // Toggle direction if same column
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      // New column, start with ascending
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };
  
  // Handle text expansion
  const handleExpandText = (text: string) => {
    setExpandedText({ text, isOpen: true });
  };
  
  // Format cell content with truncation
  const formatCellContent = (content: any) => {
    if (content === null) return 'null';
    
    const stringContent = String(content);
    if (stringContent.length > 100) {
      return (
        <>
          {stringContent.substring(0, 100)}...
          <button 
            onClick={() => handleExpandText(stringContent)}
            className="ml-1 text-blue-500 hover:text-blue-700"
          >
            [more]
          </button>
        </>
      );
    }
    
    return stringContent;
  };

  // Get date columns
  const dateColumns = columns.filter(col => 
    ['date', 'timestamp', 'timestamptz','timestamp without time zone'].includes(col.data_type)
  );

  const standardColumns = columns.filter(col=>!dateColumns.includes(col))

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
        <div>
          <h1 className="text-2xl font-bold">Table: {tableName}</h1>
          <p className="text-gray-500">Schema: {schema}</p>
        </div>
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
        
        {/* Column Filter Selector */}
        <div className="mb-4">
          <div className="flex items-end space-x-2">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Column Filter
              </label>
              <select
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a column</option>
                {standardColumns.map((column) => (
                  <option 
                    key={column.column_name} 
                    value={column.column_name}
                    disabled={filterItems.some(item => item.column === column.column_name)}
                  >
                    {column.column_name} ({column.data_type})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={addFilter}
              disabled={!selectedColumn}
              className={`px-4 py-2 rounded ${
                !selectedColumn 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Add Filter
            </button>
          </div>
        </div>
        
        {/* Active Filters */}
        {filterItems.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Active Filters</h3>
            <div className="space-y-2">
              {filterItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-grow flex items-center space-x-2">
                    <div className="bg-gray-200 px-2 py-1 rounded text-sm">
                      {item.column}
                    </div>
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => updateFilterValue(index, e.target.value)}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={`Filter by ${item.column}`}
                    />
                  </div>
                  <button
                    onClick={() => removeFilter(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Date Filter Selector */}
        {dateColumns.length > 0 && (
          <div className="mb-4">
            <div className="flex items-end space-x-2">
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Date Range Filter
                </label>
                <select
                  value={selectedDateColumn}
                  onChange={(e) => setSelectedDateColumn(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a date column</option>
                  {dateColumns.map((column) => (
                    <option 
                      key={column.column_name} 
                      value={column.column_name}
                      disabled={dateFilters.some(filter => filter.column === column.column_name)}
                    >
                      {column.column_name} ({column.data_type})
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={addDateFilter}
                disabled={!selectedDateColumn}
                className={`px-4 py-2 rounded ${
                  !selectedDateColumn 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                Add Date Filter
              </button>
            </div>
          </div>
        )}
        
        {/* Active Date Filters */}
        {dateFilters.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Active Date Filters</h3>
            <div className="space-y-4">
              {dateFilters.map((filter, index) => (
                <div key={index} className="border border-gray-200 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="bg-gray-200 px-2 py-1 rounded text-sm">
                      {filter.column}
                    </div>
                    <button
                      onClick={() => removeDateFilter(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                      <input
                        type="date"
                        value={filter.fromDate}
                        onChange={(e) => updateDateFilter(index, 'fromDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                      <input
                        type="date"
                        value={filter.toDate}
                        onChange={(e) => updateDateFilter(index, 'toDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Filter Actions */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Clear All Filters
          </button>
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Apply Filters
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
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {data.length} rows of {totalCount} total results
            </div>
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                {columns.map((column) => (
                  <th 
                    key={column.column_name}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b cursor-pointer"
                    onClick={() => handleSort(column.column_name)}
                  >
                    <div className="flex items-center">
                      <span>{column.column_name}</span>
                      {sortColumn === column.column_name && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
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
                      className="px-6 py-4 text-sm text-gray-500 border-b break-words"
                      style={{ maxWidth: '300px' }}
                    >
                      {formatCellContent(row[column.column_name])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
            
            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Text expansion modal */}
      {expandedText.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Full Text</h3>
              <button 
                onClick={() => setExpandedText({ text: '', isOpen: false })}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="whitespace-pre-wrap break-words">
              {expandedText.text}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}