import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '12';
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';

    // Build query parameters for backend
    const backendParams = new URLSearchParams();
    if (page) backendParams.append('page', page);
    if (limit) backendParams.append('limit', limit);
    if (search) backendParams.append('search', search);
    if (categoryId) backendParams.append('categoryId', categoryId);

    // Call the real backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/products?${backendParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching products from backend:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products',
        data: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      },
      { status: 500 }
    );
  }
}



