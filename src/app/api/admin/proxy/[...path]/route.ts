import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function forward(request: NextRequest, paramsPromise: Promise<{ path: string[] }>) {
  const cookieStore = await cookies();
  const token = cookieStore.get('adminToken')?.value;
  const { path } = await paramsPromise;
  const pathname = path.join('/');

  const url = `${BACKEND_URL}/api/admin/${pathname}${request.nextUrl.search}`;

  const headers = new Headers();
  // Copy relevant headers but avoid host-related issues
  const incomingHeaders = request.headers;
  const contentType = incomingHeaders.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  if (token) headers.set('authorization', `Bearer ${token}`);
  // Forward incoming cookies as-is to support backends that use cookie auth
  const incomingCookieHeader = request.headers.get('cookie');
  if (incomingCookieHeader) headers.set('cookie', incomingCookieHeader);

  const init: RequestInit = {
    method: request.method,
    headers,
    // Only pass body for non-GET/HEAD
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer(),
  };

  const res = await fetch(url, init);

  // Try to return JSON, otherwise pass text
  const contentTypeRes = res.headers.get('content-type') || '';
  if (contentTypeRes.includes('application/json')) {
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }
  const text = await res.text();
  return new NextResponse(text, { status: res.status });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(request, params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(request, params);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(request, params);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(request, params);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(request, params);
}


