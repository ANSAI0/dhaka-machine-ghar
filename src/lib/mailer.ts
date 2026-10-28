import "server-only";
import nodemailer from "nodemailer";
import { getEmailSettings, type EmailSettings } from "./settings";

export const mailerReady = (e: EmailSettings) => !!(e.host && e.user && e.pass && e.fromEmail);

type Mail = { to: string; subject: string; html: string; text: string; headers?: Record<string, string> };

export async function sendMail(m: Mail, cfg?: EmailSettings) {
  const e = cfg ?? (await getEmailSettings());
  if (!mailerReady(e)) throw new Error("Email (SMTP) is not set up in Settings");
  const transport = nodemailer.createTransport({
    host: e.host,
    port: e.port,
    secure: e.secure,
    auth: { user: e.user, pass: e.pass },
    connectionTimeout: 15_000,
  });
  return transport.sendMail({ from: { name: e.fromName, address: e.fromEmail }, ...m });
}
