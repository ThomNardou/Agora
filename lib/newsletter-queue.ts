import { marked } from "marked";
import prisma from "./prisma";
import EmailHeader from "@/app/components/EmailHeader";
import EmailFooter from "@/app/components/EmailFooter";

marked.setOptions({
    breaks: true,
});

const BATCH_SIZE = parseInt(process.env.NEWSLETTER_BATCH_SIZE ?? "20", 10);
const INTERVAL_MS = parseInt(process.env.NEWSLETTER_INTERVAL_MS ?? "60000", 10);
const MAX_FAILURES = parseInt(process.env.NEWSLETTER_MAX_FAILURES ?? "5", 10);

let isRunning = false;

export function startNewsletterQueue() {
    console.log(
        `[newsletter-queue] started — ${BATCH_SIZE} mails / tick, every ${INTERVAL_MS}ms`
    );
    setInterval(tick, INTERVAL_MS);
}

async function tick() {
    if (isRunning) return; // évite les chevauchements si un tick est encore en cours
    isRunning = true;
    try {
        await processBatch();
    } catch (err) {
        console.error("[newsletter-queue] tick error:", err);
    } finally {
        isRunning = false;
    }
}

async function processBatch() {
    const unsent = await prisma.t_newsLetters_readers.findMany({
        where: {
            sentAt: null,
            newsLetter: {
                sendAt: { lte: new Date() },
                newsLetter_status: {
                    status: { in: ["SCHEDULED", "IN_PROGRESS"] },
                },
            },
            reader: {
                consentGiven: true,
            },
        },
        include: {
            newsLetter: { include: { newsLetter_status: true } },
            reader: true,
        },
        take: BATCH_SIZE,
    });

    if (unsent.length === 0) return;

  
    const scheduledNewsletters = new Set(
        unsent
            .map((u) => u.newsLetter)
            .filter((nl) => nl.newsLetter_status.status === "SCHEDULED")
            .map((nl) => nl.newsLetter_id)
    );

    const inProgress = await prisma.t_newsLetters_status.findFirst({
        where: { status: "IN_PROGRESS" },
    });

    if (inProgress && scheduledNewsletters.size > 0) {
        await prisma.t_newsLetters.updateMany({
            where: { newsLetter_id: { in: Array.from(scheduledNewsletters) } },
            data: { newsLetter_status_fk: inProgress.status_id },
        });
        scheduledNewsletters.forEach((nlId) => {
            const nl = unsent.find((u) => u.newsLetter_fk === nlId)?.newsLetter;
            if (nl) console.log(`[newsletter-queue] #${nlId} "${nl.name}" → IN_PROGRESS`);
        });
    }

    // Envoie les newsletters en parallèle
    const res = await Promise.allSettled(
        unsent.map(async (entry) => {

            const addTrackingUrlForClicks = (html: string) => {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
                const trackingUrl = `${appUrl}/api/newsletters/track/clicked`;

                return html
                    .replace(/href="([^"]+)"/g, (match, url) => {
                        if (url.startsWith(trackingUrl)) return match;
                        const encodedUrl = encodeURIComponent(url);
                        return `href="${trackingUrl}?nlId=${entry.newsLetter_fk}&readerId=${entry.reader_fk}&url=${encodedUrl}"`;
                    })
                    .replace(/(?<![href="])https?:\/\/[^\s"<]+/g, (url) => {
                        const encodedUrl = encodeURIComponent(url);
                        return `<a href="${trackingUrl}?nlId=${entry.newsLetter_fk}&readerId=${entry.reader_fk}&url=${encodedUrl}">${url}</a>`;
                    });
            }

            const bodyHtml = await marked(entry.newsLetter.body);
            const bodyWithClickTracking = addTrackingUrlForClicks(bodyHtml);

            await sendEmail(
                entry.reader.email,
                entry.newsLetter.name,
                bodyWithClickTracking,
                entry.reader.unsubscribeToken,
                entry.reader.reader_id,
                entry.newsLetter_fk
            );
            await prisma.t_newsLetters_readers.update({
                where: {
                    newsLetter_fk_reader_fk: {
                        newsLetter_fk: entry.newsLetter_fk,
                        reader_fk: entry.reader_fk,
                    },
                },
                data: { sentAt: new Date() },
            });
        })
    );

    console.log(`[newsletter-queue] processed batch of ${unsent.length} entries: ${
        res.filter((r) => r.status === "fulfilled").length
    } sent, ${res.filter((r) => r.status === "rejected").length} failed`
    );

    // Vérifie seulement si c'est le dernier batch (moins de BATCH_SIZE readers)
    if (unsent.length < BATCH_SIZE) {
        const processedNewsletterIds = new Set(unsent.map((u) => u.newsLetter_fk));
        for (const nlId of processedNewsletterIds) {
            const remaining = await prisma.t_newsLetters_readers.count({
                where: { newsLetter_fk: nlId, sentAt: null },
            });
            if (remaining === 0) {
                await markCompleted(nlId);
            } else if (remaining >= MAX_FAILURES) {
                await markFailed(nlId, remaining);
            }
        }
    }
}

async function markCompleted(id: number) {
    const completed = await prisma.t_newsLetters_status.findFirst({
        where: { status: "COMPLETED" },
    });
    if (!completed) return;
    await prisma.t_newsLetters.update({
        where: { newsLetter_id: id },
        data: { newsLetter_status_fk: completed.status_id },
    });
    console.log(`[newsletter-queue] #${id} → COMPLETED`);
}

async function markFailed(id: number, failureCount: number) {
    const failed = await prisma.t_newsLetters_status.findFirst({
        where: { status: "FAILED" },
    });
    if (!failed) return;
    await prisma.t_newsLetters.update({
        where: { newsLetter_id: id },
        data: { newsLetter_status_fk: failed.status_id },
    });
    console.log(`[newsletter-queue] #${id} → FAILED (${failureCount} unsent readers)`);
}

async function sendEmail(
    to: string,
    subject: string,
    bodyHtml: string,
    unsubscribeToken: string | null,
    readerId: number,
    nlId: number
) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const unsubscribeUrl = unsubscribeToken
        ? `${appUrl}/unsubscribe?token=${unsubscribeToken}`
        : `${appUrl}/unsubscribe`;

    const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        ${EmailHeader()}
        <tr>
          <td style="padding:48px;">
            <p style="margin:0 0 24px;font-size:22px;font-weight:600;color:#18181b;">${subject}</p>
            <div style="font-size:15px;color:#52525b;line-height:1.8;">${bodyHtml}</div>
            <p style="margin:40px 0 0;font-size:14px;color:#71717a;line-height:1.6;">
              À très bientôt,<br><strong style="color:#18181b;">L'équipe Agora</strong>
            </p>
          </td>
        </tr>
        ${EmailFooter(unsubscribeUrl, appUrl, nlId, readerId)}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const response = await fetch("https://maily.section-inf.ch/mail/server.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Maily-Token":
                process.env.MAIL_TOKEN +
                Buffer.from(Date.now().toString()).toString("base64"),
        },
        body: JSON.stringify({
            from: process.env.MAIL_FROM,
            to,
            subject,
            body_html: html,
        }),
    });

    if (!response.ok) {
        throw new Error(`Maily HTTP ${response.status} for ${to}`);
    }
}
