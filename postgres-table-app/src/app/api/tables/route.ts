import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, getTableColumns } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('tableName');
    
    if (!tableName) {
      return NextResponse.json({ error: 'Table name is required' }, { status: 400 });
    }
    
    // Get list of tables to validate if the requested table exists
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const tables = await executeQuery(tablesQuery);
    const tableExists = tables.some((t: any) => t.table_name === tableName);
    
    if (!tableExists) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }
    
    // Get columns to validate search parameters
    const columns = await getTableColumns(tableName);
    
    // Build the query based on search parameters
    let query = `SELECT * FROM "${tableName}"`;
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    // Process search filters
    for (const [key, value] of searchParams.entries()) {
      // Skip non-filter parameters
      if (['tableName', 'dateFrom', 'dateTo', 'dateColumn'].includes(key)) {
        continue;
      }
      
      // Check if the column exists in the table
      const column = columns.find((c: any) => c.column_name === key);
      if (column && value) {
        conditions.push(`"${key}"::text ILIKE $${paramIndex}`);
        values.push(`%${value}%`);
        paramIndex++;
      }
    }
    
    // Process date range filter
    const dateColumn = searchParams.get('dateColumn');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    if (dateColumn) {
      const column = columns.find((c: any) => c.column_name === dateColumn);
      if (column) {
        const isDateType = ['date', 'timestamp', 'timestamptz'].includes(column.data_type);
        
        if (isDateType && dateFrom) {
          conditions.push(`"${dateColumn}" >= $${paramIndex}`);
          values.push(dateFrom);
          paramIndex++;
        }
        
        if (isDateType && dateTo) {
          conditions.push(`"${dateColumn}" <= $${paramIndex}`);
          values.push(dateTo);
          paramIndex++;
        }
      }
    }
    
    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ' LIMIT 100';
    
    const data = await executeQuery(query, values);
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}