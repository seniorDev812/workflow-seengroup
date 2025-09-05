﻿import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Call the real backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/products/categories`);
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching categories from backend:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch categories',
        data: []
      },
      { status: 500 }
    );
  }
}



