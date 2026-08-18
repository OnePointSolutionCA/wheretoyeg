import { Resend } from "resend";

const TO_EMAIL = "info@onepointsolutionsca.com";
const FROM_EMAIL = "WhereToYEG <info@onepointsolutionsca.com>";

let resend: Resend | null = null;
function getClient(): Resend {
  if (!resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("Missing RESEND_API_KEY");
    resend = new Resend(key);
  }
  return resend;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fieldRow(label: string, value: string): string {
  return `<tr><td style="padding:8px 16px;color:#7a8a95;font-size:13px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td><td style="padding:8px 16px;color:#0f2733;font-size:15px">${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`;
}

function toEmailHtml(title: string, fields: Record<string, string>, footer?: string): string {
  const rows = Object.entries(fields).map(([k, v]) => fieldRow(k, v)).join("");
  return `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#f5f7f9;margin:0;padding:24px">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,39,51,0.06)">
  <tr><td style="background:linear-gradient(135deg,#0f2733,#1a4d5c);padding:20px 24px;color:white">
    <div style="font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;opacity:.7">wheretoyeg.ca</div>
    <div style="font-size:22px;font-weight:800;margin-top:4px">${escapeHtml(title)}</div>
  </td></tr>
  <tr><td style="padding:8px 8px 20px 8px"><table cellpadding="0" cellspacing="0" width="100%">${rows}</table></td></tr>
  ${footer ? `<tr><td style="padding:0 24px 20px 24px;color:#7a8a95;font-size:12px">${escapeHtml(footer)}</td></tr>` : ""}
</table></body></html>`;
}

function toEmailText(title: string, fields: Record<string, string>): string {
  return `${title}\n\n${Object.entries(fields).map(([k, v]) => `${k}:\n${v}`).join("\n\n")}`;
}

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
  subject?: string;
};

export async function sendContactEmail(p: ContactPayload) {
  const fields = {
    "From": `${p.name} <${p.email}>`,
    ...(p.subject ? { "Subject": p.subject } : {}),
    "Message": p.message,
  };
  return getClient().emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    replyTo: p.email,
    subject: `[WhereToYEG] Contact — ${p.name}${p.subject ? ` — ${p.subject}` : ""}`,
    html: toEmailHtml("New contact form submission", fields),
    text: toEmailText("New contact form submission", fields),
  });
}

export type GetListedPayload = {
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  category?: string;
  tier?: string;
  notes?: string;
};

export async function sendGetListedEmail(p: GetListedPayload) {
  const fields: Record<string, string> = {
    "Business": p.businessName,
    "Contact": `${p.contactName} <${p.email}>`,
    ...(p.phone ? { "Phone": p.phone } : {}),
    ...(p.website ? { "Website": p.website } : {}),
    ...(p.category ? { "Category": p.category } : {}),
    ...(p.tier ? { "Plan": p.tier } : {}),
    ...(p.notes ? { "Notes": p.notes } : {}),
  };
  return getClient().emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    replyTo: p.email,
    subject: `[WhereToYEG] New listing request — ${p.businessName}${p.tier ? ` (${p.tier})` : ""}`,
    html: toEmailHtml("New Get Listed submission", fields),
    text: toEmailText("New Get Listed submission", fields),
  });
}
