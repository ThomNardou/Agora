import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                { message: "Token de désinscription manquant." },
                { status: 400 },
            );
        }

        const reader = await prisma.t_readers.findUnique({
            where: { unsubscribeToken: token },
        });

        if (!reader) {
            return NextResponse.json(
                { message: "Token invalide ou déjà utilisé." },
                { status: 404 },
            );
        }

        // Revoke consent and invalidate the token by generating a new one
        await prisma.t_readers.update({
            where: { unsubscribeToken: token },
            data: {
                email: "unsubscribed_" + randomBytes(16).toString("hex") + "@example.com",
                consentGiven: false,
                unsubscribeToken: null,
            },
        });

        return NextResponse.json(
            { message: "Vous avez été désabonné avec succès." },
            { status: 200 },
        );

    } catch (error) {
        console.error("Error unsubscribing from newsletter:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}
