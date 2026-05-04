import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const nlId = searchParams.get("nlId");
        const readerId = searchParams.get("readerId");
        const redirectUrl = searchParams.get("url");

        if (!nlId || !readerId) {
            return NextResponse.json({ message: "nlId and readerId are required" }, { status: 400 });
        }

        await prisma.t_emails_clicked.create({
            data: {
                newsLetter: { connect: { newsLetter_id: parseInt(nlId) } },
                reader: { connect: { reader_id: parseInt(readerId) } },
            },
        });

        if (redirectUrl) {
            return NextResponse.redirect(decodeURIComponent(redirectUrl));
        }
        return NextResponse.json({ message: "Click tracked successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error tracking click" }, { status: 500 });
    }
}