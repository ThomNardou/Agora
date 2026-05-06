import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const nlId = searchParams.get("nlId");
        const redirectUrl = searchParams.get("url");

        if (!nlId) {
            return NextResponse.redirect(decodeURIComponent(redirectUrl || "/"));
        }

        await prisma.t_emails_clicked.create({
            data: {
                newsLetter_fk: parseInt(nlId)
            }
        });

        if (redirectUrl) {
            return NextResponse.redirect(decodeURIComponent(redirectUrl));
        }
        return NextResponse.json({ message: "Click tracked successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error tracking click" }, { status: 500 });
    }
}