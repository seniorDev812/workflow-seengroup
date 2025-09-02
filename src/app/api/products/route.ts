import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/products/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('categoryId') ?? undefined;
  return NextResponse.json({ data: db.listProducts(categoryId) });
}



