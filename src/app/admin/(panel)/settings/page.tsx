import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiConfigured } from "@/lib/chatbot";
import { getBotSettings, getEditableSite, getEmailSettings, getMarketing, getSmsSettings, getTheme } from "@/lib/settings";
import { newsletterAudience } from "@/lib/newsletter";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Badge, Card, PageHeader, shortDate } from "@/components/admin/ui";
import { removeAdmin } from "./actions";
import { AddAdminForm, BotForm, EmailForm, MarketingForm, PasswordForm, SiteSettingsForm, SmsForm, ThemeForm } from "./forms";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const s = await requireAdmin();
  const owner = s.role === "owner";
  const [email, audience, runs] = owner
    ? await Promise.all([getEmailSettings(), newsletterAudience(), db.newsletterRun.findMany({ orderBy: { createdAt: "desc" }, take: 5 })])
    : [null, [], []];
  const [site, marketing, theme, bot, sms, smsLog, admins] = await Promise.all([
    getEditableSite(),
    getMarketing(),
    getTheme(),
    getBotSettings(),
    getSmsSettings(),
    owner ? db.smsLog.findMany({ orderBy: { createdAt: "desc" }, take: 15 }) : Promise.resolve([]),
    owner ? db.adminUser.findMany({ orderBy: { createdAt: "asc" } }) : Promise.resolve([]),
  ]);

  return (
    <>
      <PageHeader title="Settings" />
      <div className="space-y-6">
        {owner ? (
          <>
            <Card title="Business info (shown across the website)"><SiteSettingsForm v={site} /></Card>
            {email && (
              <Card title="Email — account, order emails & weekly update">
                <EmailForm
                  v={{ enabled: email.enabled, host: email.host, port: email.port, secure: email.secure, user: email.user, hasPass: !!email.pass, fromEmail: email.fromEmail, fromName: email.fromName, weekday: email.weekday, weeklyNote: email.weeklyNote, onOrder: email.onOrder, onPayment: email.onPayment, onStep: email.onStep, onDelivery: email.onDelivery, alertTo: email.alertTo }}
                  audience={audience.length}
                />
                {runs.length > 0 && (
                  <ul className="mt-4 space-y-1 border-t border-gray-100 pt-3 text-xs text-gray-600">
                    {runs.map((r) => (
                      <li key={r.id}>{shortDate(r.createdAt)} · {r.trigger} · sent {r.sent}{r.failed ? `, failed ${r.failed}` : ""} · {r.status}</li>
                    ))}
                  </ul>
                )}
              </Card>
            )}
            <Card title="SMS notifications">
              <SmsForm v={{ provider: sms.provider, hasKey: !!sms.apiKey, senderId: sms.senderId, customUrl: sms.customUrl, onOrder: sms.onOrder, onStep: sms.onStep, language: sms.language }} />
              {smsLog.length > 0 && (
                <details className="mt-4 text-sm">
                  <summary className="cursor-pointer font-semibold text-gray-700">Recent SMS ({smsLog.length})</summary>
                  <ul className="mt-2 divide-y divide-gray-100">
                    {smsLog.map((m) => (
                      <li key={m.id} className="py-2">
                        <Badge tone={m.status === "sent" ? "green" : m.status === "failed" ? "red" : "gray"}>{m.status}</Badge> <span className="text-gray-500">{shortDate(m.createdAt)} · {m.phone} · {m.kind}</span>
                        <p className="text-gray-700">{m.message}</p>
                        {m.status !== "sent" && m.response && <p className="text-xs text-gray-400">{m.response.slice(0, 160)}</p>}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </Card>
            <Card title="Chat assistant"><BotForm enabled={bot.enabled} knowledge={bot.knowledge} aiReady={aiConfigured()} /></Card>
            <Card title="Theme colours"><ThemeForm theme={theme} /></Card>
            <Card title="Marketing — Meta Pixel, Conversions API & GTM">
              <MarketingForm pixelId={marketing.pixelId} gtmId={marketing.gtmId} hasToken={!!marketing.capiToken} capiTestCode={marketing.capiTestCode} />
              <p className="mt-4 text-xs text-gray-500">
                With a Pixel ID set, every public page sends PageView; orders send <strong>Purchase</strong> and quotation requests send <strong>Lead</strong> — from the browser and, with a token, from the server too, sharing one event id so Meta counts each once.
              </p>
            </Card>
          </>
        ) : (
          <p className="rounded-xl bg-gray-100 p-4 text-sm text-gray-600">Business and marketing settings can only be changed by an Owner.</p>
        )}

        <Card title="My account — change password"><PasswordForm /></Card>

        {owner && (
          <Card title="Admin users">
            <table className="mb-6 w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-gray-500">
                <tr><th className="pb-2">Name</th><th className="pb-2">Email</th><th className="pb-2">Role</th><th className="pb-2">Last login</th><th /></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map((a) => (
                  <tr key={a.id}>
                    <td className="py-2 font-semibold">{a.name}{a.id === s.uid && <span className="ml-1 text-xs font-normal text-gray-400">(you)</span>}</td>
                    <td className="py-2">{a.email}</td>
                    <td className="py-2"><Badge tone={a.role === "owner" ? "green" : "blue"}>{a.role}</Badge></td>
                    <td className="py-2 text-gray-500">{a.lastLoginAt ? shortDate(a.lastLoginAt) : "never"}</td>
                    <td className="py-2 text-right">
                      {a.id !== s.uid && (
                        <form action={removeAdmin.bind(null, a.id)}>
                          <ConfirmButton message={`Remove ${a.email}? They lose access immediately.`} className="text-xs font-semibold text-accent-600 hover:underline">Remove</ConfirmButton>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <AddAdminForm />
          </Card>
        )}
      </div>
    </>
  );
}
