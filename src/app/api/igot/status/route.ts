import { NextResponse } from 'next/server';
import { igotMode } from '@/lib/igot';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ mode: igotMode() });
}
