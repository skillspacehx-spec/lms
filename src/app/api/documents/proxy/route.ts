import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/documents/proxy?url=ENCODED_CLOUDINARY_URL
 *
 * Server-side proxy for Cloudinary document URLs.
 * Fetches the file on the server and streams it back to the browser
 * with correct Content-Type and inline Content-Disposition headers.
 * This bypasses any Cloudinary X-Frame-Options / CORS restrictions
 * when embedding documents in iframes.
 */
export async function GET(request: NextRequest) {
  try {
    // Must be logged in to proxy documents
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawUrl = request.nextUrl.searchParams.get('url');
    if (!rawUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    let targetUrl: string;
    try {
      targetUrl = decodeURIComponent(rawUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid url parameter' }, { status: 400 });
    }

    // Security: only allow Cloudinary URLs
    if (!targetUrl.startsWith('https://res.cloudinary.com/')) {
      return NextResponse.json({ error: 'Only Cloudinary URLs are allowed' }, { status: 403 });
    }

    // Fetch from Cloudinary on the server side
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LMS-DocumentProxy/1.0)',
      },
      // 30 second timeout
      signal: AbortSignal.timeout(30_000),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream responded with ${upstream.status}` },
        { status: 502 }
      );
    }

    let contentType =
      upstream.headers.get('content-type') || 'application/octet-stream';

    // If it's a PDF stored with a bypassed extension (like .pdf.dat)
    if (targetUrl.toLowerCase().includes('.pdf')) {
      contentType = 'application/pdf';
    }

    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Force browser to display inline (not download)
        'Content-Disposition': 'inline',
        // Allow this response to be embedded in an iframe on our own origin
        'X-Frame-Options': 'SAMEORIGIN',
        // Cache for 1 hour
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('Document proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy document' },
      { status: 500 }
    );
  }
}
