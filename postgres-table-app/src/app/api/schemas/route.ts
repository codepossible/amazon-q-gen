import { NextResponse } from 'next/server';
import { getSchemas } from '@/lib/db';

// Mark as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const schemas = await getSchemas();
    return NextResponse.json({ schemas });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}