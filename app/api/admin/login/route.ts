import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface UserConnected {
    id: number;
    name: string | null;
    email: string;
}

export async function GET() {
    const cookie = (await cookies()).get("session");

    if (!cookie) {
        console.log("No session cookie found");
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let sessionJson: { userId: number; token: string };

    try {
        sessionJson = JSON.parse(cookie.value);
    } catch {
        console.log("Invalid session cookie format");
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const session = await prisma.t_sessions.findFirst({
        where: { admin_fk: sessionJson.userId },
        include: { admin: true },
    });

    if (!session) {
        console.log("Session not found");
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const tokenMatches = await bcrypt.compare(sessionJson.token, session!.token);

    if (!tokenMatches) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        jwt.verify(sessionJson.token, process.env.JWT_SECRET || "");
    } catch {
        console.log("Invalid JWT token");
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const admin = session!.admin;

    if (!admin) {
        console.log("Admin not found for session");
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
        {
            message: "Authorized",
            admin: {
                id: admin.admin_id,
                name: admin.name,
                email: admin.email,
            } satisfies UserConnected,
        },
        { status: 200 },
    );
}

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 },
            );
        }

        const admin = await prisma.t_admins.findUnique({
            where: { email },
        });

        if (!admin) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 },
            );
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 },
            );
        }

        const secretKey = process.env.JWT_SECRET;
        const expirationTime = process.env.JWT_EXPIRATION_TIME;

        if (!secretKey || !expirationTime) {
            console.error("Missing environment variables");
            return NextResponse.json(
                { message: "Internal server error" },
                { status: 500 },
            );
        }

        const expiresIn = parseInt(expirationTime, 10);

        if (isNaN(expiresIn)) {
            console.error("JWT_EXPIRATION_TIME is not a valid number");
            return NextResponse.json(
                { message: "Internal server error" },
                { status: 500 },
            );
        }

        const token = jwt.sign({ adminId: admin.admin_id }, secretKey, {
            expiresIn,
        });

        const expiresAt = new Date(Date.now() + expiresIn * 1000);
        const tokenHash = bcrypt.hashSync(token, 10);

        await prisma.t_sessions.deleteMany({ where: { admin_fk: admin.admin_id } });
        await prisma.t_sessions.create({
            data: {
                token: tokenHash,
                admin: { connect: { admin_id: admin.admin_id } },
            },
        });

        const cookieValue = JSON.stringify({ adminId: admin.admin_id, token });

        (await cookies()).set({
            name: "session",
            value: cookieValue,
            httpOnly: process.env.NODE_ENV === "production",
            secure: true,
            sameSite: "strict",
            path: "/",
            expires: expiresAt,
        });

        return NextResponse.json({ message: "Login successful" }, { status: 200 });
    } catch (error) {
        console.error("POST /auth error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}
