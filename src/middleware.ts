import { NextRequest, NextResponse } from "next/server";

const ADMIN_PATH_PREFIX = "/dedicated-admin";

function unauthorized(): NextResponse {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="KamiraFit Admin", charset="UTF-8"',
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

function forbidden(message: string): NextResponse {
  return new NextResponse(message, {
    status: 403,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

/**
 * Constant-time comparison suitable for the Edge runtime.
 * Avoids leaking string lengths or characters through execution time.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);

  let mismatch = aBytes.byteLength === bBytes.byteLength ? 0 : 1;
  const maxLen = Math.max(aBytes.byteLength, bBytes.byteLength);

  for (let i = 0; i < maxLen; i += 1) {
    const byteA = i < aBytes.byteLength ? aBytes[i] : 0;
    const byteB = i < bBytes.byteLength ? bBytes[i] : 0;
    mismatch |= byteA ^ byteB;
  }

  return mismatch === 0;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith(ADMIN_PATH_PREFIX)) {
    return NextResponse.next();
  }

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  // In production or development, NEVER allow access if admin credentials are missing
  if (!username || !password) {
    return forbidden("Admin portal is disabled: administrative gate credentials are not configured.");
  }

  const authorization = request.headers.get("authorization");
  if (!authorization || !authorization.startsWith("Basic ")) {
    return unauthorized();
  }

  try {
    const base64Credentials = authorization.slice("Basic ".length).trim();
    const decoded = atob(base64Credentials);
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex === -1) {
      return unauthorized();
    }

    const suppliedUsername = decoded.slice(0, separatorIndex);
    const suppliedPassword = decoded.slice(separatorIndex + 1);

    const isUsernameValid = timingSafeEqual(suppliedUsername, username);
    const isPasswordValid = timingSafeEqual(suppliedPassword, password);

    if (isUsernameValid && isPasswordValid) {
      const response = NextResponse.next();
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");
      return response;
    }
  } catch {
    return unauthorized();
  }

  return unauthorized();
}

export const config = {
  matcher: ["/dedicated-admin/:path*"],
};
