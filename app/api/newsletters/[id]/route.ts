import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> })  {
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

        const unauthorizedStatuses = ["COMPLETED", "FAILED", "IN_PROGRESS"];

        if (unauthorizedStatuses.includes(newsletter.newsLetter_status.status)) {
            return NextResponse.json({ message: "Unauthorized to delete newsletter with this status" }, { status: 400 });
        }

        if (newsletter.newsLetter_status.status === "SCHEDULED") {

            const cancelledStatus = await prisma.t_newsLetters_status.findFirst({
                where: {
                    status: "CANCELLED"
                }
            });

            await prisma.t_newsLetters.update({
                where: {
                    newsLetter_id: nlId
                },
                data: {
                    newsLetter_status_fk: cancelledStatus?.status_id,
                    sendAt: null
                }
            });

            return NextResponse.json({ message: "Newsletter cancelled successfully" });
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