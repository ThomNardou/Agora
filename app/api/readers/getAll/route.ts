import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET({ request }: { request: Request }) {
    try {
        const admin = JSON.parse(
            (await cookies()).get("session")?.value || "{}",
        ).adminId;

        if (!admin) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        const readers = await prisma.t_readers.findMany({
            select: {
                reader_id: true,
                email: true,
                consentGiven: true
            }
        });

        return NextResponse.json({ readers });
    } catch (error) {
        console.error("Error fetching readers:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}