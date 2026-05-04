import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import EmailHeader from "@/app/components/EmailHeader";
import EmailFooter from "@/app/components/EmailFooter";

export async function POST(request: Request) {
    try {
        const { email, consent } = await request.json();

        if (!email) {
            return NextResponse.json(
                { message: "L'email est requis pour s'abonner à la newsletter." },
                { status: 400 },
            );
        }

        if (!consent) {
            return NextResponse.json(
                { message: "Votre consentement est requis pour s'abonner à la newsletter." },
                { status: 400 },
            );
        }

        const existingSubscriber = await prisma.t_readers.findUnique({
            where: { email },
        });

        if (existingSubscriber && existingSubscriber.consentGiven) {
            return NextResponse.json(
                { message: "Cet email est déjà abonné à la newsletter." },
                { status: 400 },
            );
        }

        const unsubscribeToken = randomBytes(32).toString("hex");


        if (!existingSubscriber) {
            await prisma.t_readers.create({
                data: {
                    email,
                    consentGiven: consent || false,
                    consentGivenAt: new Date(),
                    unsubscribeToken,
                },
            });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const unsubscribeUrl = `${appUrl}/unsubscribe?token=${unsubscribeToken}`;

        const body_html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        ${EmailHeader()}
        <tr>
          <td style="padding:48px;">
            <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#18181b;">Bienvenue dans l'Agora 👋</p>
            <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.6;">
              Votre abonnement est confirmé. Vous recevrez désormais nos prochaines actualités, analyses et mises à jour directement dans votre boîte mail.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;border-radius:8px;margin-bottom:32px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#18181b;text-transform:uppercase;letter-spacing:0.5px;">Ce qui vous attend</p>
                  <p style="margin:0 0 8px;font-size:14px;color:#52525b;">📰 &nbsp;Actualités et analyses en profondeur</p>
                  <p style="margin:0 0 8px;font-size:14px;color:#52525b;">💡 &nbsp;Décryptages et points de vue</p>
                  <p style="margin:0;font-size:14px;color:#52525b;">🔔 &nbsp;Mises à jour exclusives de la plateforme</p>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:14px;color:#71717a;line-height:1.6;">
              À très bientôt,<br>
              <strong style="color:#18181b;">L'équipe Agora</strong>
            </p>
          </td>
        </tr>
        ${EmailFooter(unsubscribeUrl, appUrl)}
      </table>
    </td></tr>
  </table>
</body>
</html>`;


        await fetch("https://maily.section-inf.ch/mail/server.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Maily-Token": process.env.MAIL_TOKEN + Buffer.from(Date.now().toString()).toString("base64"),
            },
            body: JSON.stringify({
                from: process.env.MAIL_FROM,
                to: email,
                subject: "Bienvenue dans la newsletter d'Agora !",
                body_html,
            }),
        });

        return NextResponse.json(
            { message: "Merci pour votre abonnement !" },
            { status: 200 },
        );

    } catch (error) {
        console.error("Error subscribing to newsletter:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}
