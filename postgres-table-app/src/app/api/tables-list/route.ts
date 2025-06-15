import { NextRequest, NextResponse } from 'next/server';
import { getTables } from '@/lib/db';

// Mark as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schema = searchParams.get('schema') || 'public';
    const search = searchParams.get('search') || '';
    
    const tables = await getTables(schema);
    
    // Filter tables by search term if provided
    const filteredTables = search 
      ? tables.filter((t: any) => 
          t.table_name.toLowerCase().includes(search.toLowerCase())
        )
      : tables;
    
    return NextResponse.json({ tables: filteredTables });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}