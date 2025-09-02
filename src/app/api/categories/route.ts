import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/products/store';

export async function GET() {
  return NextResponse.json({ data: db.listCategories() });
}



