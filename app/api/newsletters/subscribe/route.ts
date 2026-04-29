import { NextResponse} from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const {email, consentGiven} = await request.json();

        if (!email) {
            return NextResponse.json(
                {message: "L'email est requis pour s'abonner à la newsletter."},
                {status: 400},
            );
        }

        const existingSubscriber = await prisma.t_readers.findUnique({
            where: {email},
        });

        if (existingSubscriber && existingSubscriber.consentGiven) {
            return NextResponse.json(
                {message: "Cet email est déjà abonné à la newsletter."},
                {status: 400},
            );
        }

        if (existingSubscriber) {
            await prisma.t_readers.update({
                where: {email},
                data: {consentGiven: consentGiven ?? false},
            });

            return NextResponse.json(
                {message: "Votre consentement a été mis à jour."},
                {status: 200},
            );
        }

    } catch (error) {
        console.error("Error subscribing to newsletter:", error);
        return NextResponse.json(
            {message: "Internal server error"},
            {status: 500},
        );
    }
}