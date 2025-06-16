import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, getTableColumns } from '@/lib/db';

// Mark as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('tableName');
    const schema = searchParams.get('schema') || 'public';
    
    if (!tableName) {
      return NextResponse.json({ error: 'Table name is required' }, { status: 400 });
    }
    
    // Get list of tables to validate if the requested table exists
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = $1
    `;
    const tables = await executeQuery(tablesQuery, [schema]);
    const tableExists = tables.some((t: any) => t.table_name === tableName);
    
    if (!tableExists) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }
    
    // Get columns to validate search parameters
    const columns = await getTableColumns(tableName, schema);
    
    // Build the query based on search parameters
    let query = `SELECT * FROM "${schema}"."${tableName}"`;
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    // Process search filters - convert entries() to Array to avoid TypeScript iteration error
    const searchParamsArray = Array.from(searchParams.entries());
    for (const [key, value] of searchParamsArray) {
      // Skip non-filter parameters
      if (['tableName', 'schema', 'dateFrom', 'dateTo', 'dateColumn'].includes(key)) {
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
        const isDateType = ['date', 'timestamp', 'timestamptz', 'timestamp without time zone'].includes(column.data_type);
        
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
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM "${schema}"."${tableName}"${conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : ''}`;
    const countResult = await executeQuery(countQuery, values);
    const totalCount = parseInt(countResult[0].count);
    
    // Add pagination
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 50;
    const offset = (page - 1) * pageSize;
    
    query += ` LIMIT 1000`;
    if (page > 1) {
      query += ` OFFSET ${offset}`;
    }
    
    const data = await executeQuery(query, values);
    return NextResponse.json({ 
      data,
      pagination: {
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}