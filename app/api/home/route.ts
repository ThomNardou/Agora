import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export default interface HomeResponseData {
    newsLettersThisWeek: number;
    mailsOpened: number;
    clickRate: number;
    subscribedReaders: number;
    unsubscribedReaders: number;
    mailsError: number;
    newsletters: {
        id: number;
        name: string;
        sendAt: Date | null;
        nbrClicks?: number;
        nbrOpens?: number;
        status: {
            displayName: string;
            textColor: string;
            backgroundColor: string;
            value: string;
        };
    }[];
    readers: {
        id: number;
        email: string;
        consentGiven: boolean;
    }[];

}

export async function GET(request: NextRequest) {
    const admin = JSON.parse(
        (await cookies()).get("session")?.value || "{}",
    ).adminId;

    if (!admin) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const newsletters = await prisma.t_newsLetters.findMany({
        include: {
            newsLetter_status: true,
        },
    });

    const readers = await prisma.t_readers.findMany();


    const newsLettersThisWeek = newsletters.filter((n) => n.sendAt && (() => {
        const sendAt = new Date(n.sendAt!);
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sendAt >= oneWeekAgo && sendAt <= now;
    })).length;

    const allEmailsOpened = await prisma.t_emails_opened.findMany();
    const allEmailsClicked = await prisma.t_emails_clicked.findMany();

    const mailsOpened = allEmailsOpened.length;
    const clickRate = allEmailsClicked.length;
    const subscribedReaders = readers.filter(r => r.consentGiven).length;
    const unsubscribedReaders = readers.filter(r => !r.consentGiven).length;
    const mailsError = newsletters.filter(n => n.newsLetter_status.status === "FAILED").length;

    const responseData: HomeResponseData = {
        newsLettersThisWeek,
        mailsOpened,
        clickRate,
        subscribedReaders,
        unsubscribedReaders,
        mailsError,
        newsletters: newsletters.map(n => ({
            id: n.newsLetter_id,
            name: n.name,
            sendAt: n.sendAt ? new Date(n.sendAt) : null,
            nbrClicks: allEmailsClicked.filter(c => c.newsLetter_fk === n.newsLetter_id).length,
            nbrOpens: allEmailsOpened.filter(o => o.newsLetter_fk === n.newsLetter_id).length,
            status: {
                displayName: n.newsLetter_status.displayName,
                textColor: n.newsLetter_status.textColor,
                backgroundColor: n.newsLetter_status.backgroundColor,
                value: n.newsLetter_status.status,
            },
        })),
        readers: readers.map(r => ({
            id: r.reader_id,
            email: r.email,
            consentGiven: r.consentGiven,
        })),
    };

    return NextResponse.json(responseData);


}


