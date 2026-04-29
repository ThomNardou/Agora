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
        where: { fkUser: sessionJson.userId },
        include: { user: true },
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
        console.log("Session not found or expired");
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const tokenMatches = await bcrypt.compare(sessionJson.token, session.token);

    if (!tokenMatches) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        jwt.verify(sessionJson.token, process.env.TOKEN_SECRET_KEY || "");
    } catch {
        console.log("Invalid JWT token");
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;

    if (!user) {
        console.log("User not found for session");
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
        {
            message: "Authorized",
            user: {
                id: user.idUser,
                name: user.name,
                email: user.email,
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

        const user = await prisma.t_users.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 },
            );
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 },
            );
        }

        const secretKey = process.env.TOKEN_SECRET_KEY;
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

        const token = jwt.sign({ userId: user.idUser }, secretKey, {
            expiresIn,
        });

        const expiresAt = new Date(Date.now() + expiresIn * 1000);
        const tokenHash = bcrypt.hashSync(token, 10);

        await prisma.t_sessions.deleteMany({ where: { fkUser: user.idUser } });
        await prisma.t_sessions.create({
            data: {
                token: tokenHash,
                expiresAt: expiresAt,
                user: { connect: { idUser: user.idUser } },
            },
        });

        const cookieValue = JSON.stringify({ userId: user.idUser, token });

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
