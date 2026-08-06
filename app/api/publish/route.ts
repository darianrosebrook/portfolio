/**
 * Legacy publish API — retired.
 *
 * Use `/api/articles` and `/api/case-studies` instead. Kept as a stub so
 * accidental callers get a clear 410 instead of an unauthenticated data path.
 */

const GONE_BODY = {
  error: 'Gone',
  message:
    'This endpoint has been retired. Use /api/articles or /api/case-studies.',
};

function goneResponse(): Response {
  return Response.json(GONE_BODY, {
    status: 410,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

export async function GET(): Promise<Response> {
  return goneResponse();
}

export async function POST(_req: Request): Promise<Response> {
  return goneResponse();
}

export async function PUT(_req: Request): Promise<Response> {
  return goneResponse();
}
