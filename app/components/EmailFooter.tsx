export default function EmailFooter(unsubscribeUrl: string, appUrl: string) {
    return `
        <tr><td style="padding:0 48px;"><hr style="border:none;border-top:1px solid #e4e4e7;margin:0;"></td></tr>
        <tr>
            <td style="padding:24px 48px;text-align:center;">
                <p style="margin:0;font-size:12px;color:#a1a1aa;">
                    <a href="${unsubscribeUrl}" style="color:#71717a;text-decoration:underline;">Me désabonner</a>
                    &nbsp;·&nbsp;
                    <a href="${appUrl}/privacyPolicy" style="color:#71717a;text-decoration:underline;">Politique de confidentialité</a>
                </p>
            </td>
        </tr>
    `;
}
