import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (host === 'www.push-taro.com' || request.nextUrl.hostname === 'www.push-taro.com') {
    const destination = new URL(request.nextUrl.pathname + request.nextUrl.search, 'https://push-taro.com');
    return NextResponse.redirect(destination, 308);
  }

  return NextResponse.next();
}