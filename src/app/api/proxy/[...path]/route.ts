import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function forward(request: NextRequest, paramsPromise: Promise<{ path: string[] }>) {
  const cookieStore = await cookies();
  const token = cookieStore.get('adminToken')?.value;
  const { path } = await paramsPromise;
  const pathname = path.join('/');

  // Static assets like uploads are served at BACKEND_URL/uploads, not under /api
  const isStaticUpload = pathname.startsWith('uploads/');
  const url = isStaticUpload
    ? `${BACKEND_URL}/${pathname}${request.nextUrl.search}`
    : `${BACKEND_URL}/api/${pathname}${request.nextUrl.search}`;

  const headers = new Headers();
  const incomingHeaders = request.headers;
  const contentType = incomingHeaders.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  if (token) headers.set('authorization', `Bearer ${token}`);
  const incomingCookieHeader = incomingHeaders.get('cookie');
  if (incomingCookieHeader) headers.set('cookie', incomingCookieHeader);

  const init: RequestInit = {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer(),
  };

  const res = await fetch(url, init);
  const contentTypeRes = res.headers.get('content-type') || '';
  if (contentTypeRes.includes('application/json')) {
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }
  // Stream non-JSON responses such as file downloads and preserve key headers
  const passHeaders = new Headers();
  const copy = (k: string) => { const v = res.headers.get(k); if (v) passHeaders.set(k, v); };
  copy('content-type');
  copy('content-disposition');
  copy('content-length');
  return new NextResponse(res.body, { status: res.status, headers: passHeaders });
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


