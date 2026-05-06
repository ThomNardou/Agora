import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const admin = JSON.parse(
            (await cookies()).get("session")?.value || "{}",
        ).adminId;

        if (!admin) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const { id, name, body, sendAt, status } = await request.json();

        if (!name) {
            return NextResponse.json({ message: "Name is required" }, { status: 400 });
        }

        const nlStatus = await prisma.t_newsLetters_status.findFirst({
            where: {
                status: status
            }
        })

        if (!nlStatus) {
            return NextResponse.json({ message: "Status not found" }, { status: 500 });
        }

        let sendAtDate: Date | null = null;

        if (status === "IN_PROGRESS") {
            sendAtDate = new Date();
        }

        else if (status === "SCHEDULED") {
            if (!sendAt) {
                return NextResponse.json({ message: "sendAt is required for scheduled newsletters" }, { status: 400 });
            }
            sendAtDate = new Date(sendAt);
        }

        console.log("Creating newsletter with data:", { name, body, sendAt: sendAtDate, status });

        if (id) {
            await prisma.t_newsLetters.update({
                where: { newsLetter_id: id },
                data: {
                    name,
                    body,
                    sendAt: sendAtDate,
                    newsLetter_status_fk: nlStatus.status_id
                }
            });

            return NextResponse.json({ message: "Newsletter updated successfully" });
        } else {
            await prisma.t_newsLetters.create({
                data: {
                    name,
                    body,
                    sendAt: sendAtDate,
                    newsLetter_status_fk: nlStatus.status_id
                }
            });

            return NextResponse.json({ message: "Newsletter created successfully" });
        }
    } catch (error) {
        console.error("Error creating newsletter:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}