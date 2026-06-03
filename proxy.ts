// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    const cookie = request.cookies.get("session");

    if (!cookie) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    console.log(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/login`)

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/login`,
        {
            headers: { Cookie: request.headers.get("cookie") || "" },
        },
    );

    if (!response.ok) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|login|privacyPolicy|unsubscribe|subscribe|$|_next/static|_next/image).*)"],
};

