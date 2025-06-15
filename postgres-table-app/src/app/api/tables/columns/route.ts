import { NextRequest, NextResponse } from 'next/server';
import { getTableColumns } from '@/lib/db';

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
    
    const columns = await getTableColumns(tableName, schema);
    return NextResponse.json({ columns });
  } catch (error: unknown) {
    console.error('API error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}