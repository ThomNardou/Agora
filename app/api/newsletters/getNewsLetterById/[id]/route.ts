import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = JSON.parse(
            (await cookies()).get("session")?.value || "{}",
        ).adminId;

        if (!admin) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        const { id } = await params;

        const newsletter = await prisma.t_newsLetters.findUnique({
            where: {
                newsLetter_id: parseInt(id)
            }
        });

        if (!newsletter) {
            return NextResponse.json({ message: "Newsletter not found" }, { status: 404 });
        }

        return NextResponse.json({ newsletter });
    } catch (error) {
        console.error("Error fetching newsletter:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}