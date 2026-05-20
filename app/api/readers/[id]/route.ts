import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = JSON.parse(
            (await cookies()).get("session")?.value || "{}",
        ).adminId;

        if (!admin) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const readerId = parseInt(id);
        const reader = await prisma.t_readers.findUnique({
            where: {
                reader_id: readerId
            }
        });

        if (!reader) {
            return NextResponse.json({ message: "Reader not found" }, { status: 404 });
        }

        await prisma.t_newsLetters_readers.deleteMany({
            where: {
                reader_fk: readerId
            }
        });
        
        await prisma.t_readers.delete({
            where: {
                reader_id: readerId
            },

        });


        return NextResponse.json({ message: "Reader deleted successfully" });
    } catch (error) {
        console.error("Error deleting reader:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}