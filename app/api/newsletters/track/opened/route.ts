import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { GiFreemasonry } from "react-icons/gi";

const GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export async function GET(request: Request) {
    try {
        const trackId = new URL(request.url).searchParams.get("t");

        if (!trackId) {
            return new NextResponse(GIF, {
                headers: { "Content-Type": "image/gif" },
            });
        }

        const [newsletterId, readerId] = Buffer.from(trackId, "base64").toString("utf-8")
            .split(":");

        await prisma.t_emails_opened.create({
            data: {
                newsLetter: { connect: { newsLetter_id: parseInt(newsletterId) } },
                reader: { connect: { reader_id: parseInt(readerId) } },
            },
        });

        return new NextResponse(GIF, {
            headers: { "Content-Type": "image/gif" },
        });
    } catch (error) {
        return new NextResponse(GIF, {
            headers: { "Content-Type": "image/gif" },
        });
    }
}