import { getServerEnv } from "@/lib/env";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(payload: EmailPayload) {
  const apiKey = getServerEnv("RESEND_API_KEY");
  const from = getServerEnv("EMAIL_FROM");

  if (!apiKey || !from) {
    console.warn("Resend no está configurado; el correo no se envió.", {
      to: payload.to,
      subject: payload.subject
    });
    return { sent: false, reason: "RESEND_NOT_CONFIGURED" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text
    })
  });

  if (!response.ok) {
    const message = await response.text();
    console.error("Resend rechazó el correo.", { status: response.status, message });
    return { sent: false, reason: "RESEND_REJECTED" };
  }

  return { sent: true };
}

export function wrapEmail(title: string, body: string) {
  return `
    <main style="font-family:Arial,sans-serif;background:#0a0a0a;color:#f7f2ea;padding:32px">
      <section style="max-width:640px;margin:0 auto;border:1px solid #303030;padding:28px">
        <p style="letter-spacing:.18em;text-transform:uppercase;color:#c8ff45;font-size:12px">La Perrera Club</p>
        <h1 style="font-size:28px;line-height:1.1;margin:0 0 18px">${title}</h1>
        <div style="font-size:16px;line-height:1.6;color:#f7f2ea">${body}</div>
      </section>
    </main>
  `;
}
