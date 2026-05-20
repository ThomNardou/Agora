import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> })  {
    try {
        const admin = JSON.parse(
            (await cookies()).get("session")?.value || "{}",
        ).adminId;

        if (!admin) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

        const unauthorizedStatuses = ["COMPLETED", "FAILED", "IN_PROGRESS"];

        if (unauthorizedStatuses.includes(newsletter.newsLetter_status.status)) {
            return NextResponse.json({ message: "Unauthorized to delete newsletter with this status" }, { status: 400 });
        }

        if (newsletter.newsLetter_status.status === "IN_PROGRESS_IN_VALIDATION") {
            const timeSinceUpdate = Date.now() - newsletter.updatedAt.getTime();
            const thirtySecondsInMs = 30 * 1000;

            if (timeSinceUpdate > thirtySecondsInMs) {
                return NextResponse.json({ message: "Deletion window expired. Newsletter is now processing." }, { status: 400 });
            }
        }

        await prisma.t_newsLetters_readers.deleteMany({
            where: {
                newsLetter_fk: nlId
            }
        });
        await prisma.t_newsLetters.delete({
            where: {
                newsLetter_id: nlId
            }
        });


        return NextResponse.json({ message: "Newsletter deleted successfully" });
    } catch (error) {
        console.error("Error deleting newsletter:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}