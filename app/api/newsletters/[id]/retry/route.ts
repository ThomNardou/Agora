import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = JSON.parse(
            (await cookies()).get("session")?.value || "{}",
        ).adminId;

        if (!admin) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        const { id } = await params;
        const nlId = parseInt(id);
        const newsletter = await prisma.t_newsLetters.findUnique({
            where: {
                newsLetter_id: nlId
            },
            include: {
                newsLetter_status: true
            }
        });

        if (!newsletter) {
            return NextResponse.json({ message: "Newsletter not found" }, { status: 404 });
        }

        if (newsletter.newsLetter_status.status !== "FAILED") {
            return NextResponse.json({ message: "Only newsletters with FAILED status can be retried" }, { status: 400 });
        }

        await prisma.t_newsLetters.update({
            where: {
                newsLetter_id: nlId
            },
            data: {
                newsLetter_status_fk: await prisma.t_newsLetters_status.findFirst({ where: { status: "SCHEDULED" } }).then(status => status?.status_id),
                sendAt: new Date(Date.now() + 5 * 60 * 1000), 
            }
        });

        return NextResponse.json({ message: "Newsletter retry scheduled successfully" });
    } catch (error) {
        console.error("Error scheduling newsletter retry:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}