import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.searchParams.get('path') || '';
  const backend = process.env.BACKEND_URL || 'http://localhost:4000';
  const res = await fetch(`${backend}${path}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const url = new URL(req.url);
  const path = url.searchParams.get('path') || '';
  const backend = process.env.BACKEND_URL || 'http://localhost:4000';
  const res = await fetch(`${backend}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
