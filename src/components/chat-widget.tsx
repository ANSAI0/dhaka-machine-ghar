"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2, Phone, Send, X } from "lucide-react";
import { trackConversion } from "@/lib/analytics";
import { WhatsappIcon } from "./brand-icons";
import { OnlineDot, SupportAvatar } from "./support-avatar";
import { useSite } from "./site-provider";

type Msg = { role: "user" | "assistant"; text: string };
const KEY = "dmg-chat";
const suggestions = ["২৫ টন পাওয়ার প্রেসের দাম কত?", "রিকন্ডিশন্ড লেদ মেশিন আছে?", "অগ্রিম কত দিতে হবে?", "আমাকে কল করুন"];

// Turns site paths (/product/…) and phone numbers in bot replies into links.
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\/(?:product|category|lp|track|quotation|shop|warranty|contact)(?:\/[\w-]+)?(?:\?[\w=&-]+)?|01[3-9]\d{2}-?\d{6})/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 0 ? (
          <span key={i}>{p}</span>
        ) : p.startsWith("/") ? (
          <Link key={i} href={p} className="break-all font-semibold text-brand-700 underline">{p.startsWith("/product/") ? "মেশিনটি দেখুন →" : p}</Link>
        ) : (
          <a key={i} href={`tel:${p.replace(/-/g, "")}`} className="font-semibold text-brand-700 underline">{p}</a>
        ),
      )}
    </>
  );
}

export function ChatWidget() {
  const site = useSite();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const [greet, setGreet] = useState(false);

  // A small greeting keeps popping up beside the button while the chat is closed:
  // first after a few seconds, then on a loop (shown ~9 s, hidden ~16 s).
  useEffect(() => {
    if (open) {
      setGreet(false);
      return;
    }
    let t: ReturnType<typeof setTimeout>;
    const cycle = (show: boolean) => {
      setGreet(show);
      t = setTimeout(() => cycle(!show), show ? 9000 : 16000);
    };
    t = setTimeout(() => cycle(true), 3500);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
      if (saved?.sessionId) {
        setSessionId(saved.sessionId);
        setMsgs(saved.msgs ?? []);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      if (sessionId) localStorage.setItem(KEY, JSON.stringify({ sessionId, msgs: msgs.slice(-30) }));
    } catch {}
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, sessionId]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: t }]);
    setBusy(true);
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, message: t, page: path }) });
      const d = await r.json();
      if (d.sessionId) setSessionId(d.sessionId);
      setMsgs((m) => [...m, { role: "assistant", text: d.reply ?? d.error ?? `দুঃখিত, সমস্যা হয়েছে। কল করুন ${site.phone}` }]);
      if (d.leadSaved) trackConversion("Lead", { content_name: "chatbot" });
    } catch {
      setMsgs((m) => [...m, { role: "assistant", text: `নেটওয়ার্ক সমস্যা। সরাসরি কল করুন ${site.phone}` }]);
    } finally {
      setBusy(false);
    }
  }

  // Hand the conversation to a person on WhatsApp, carrying the last question along.
  const lastQ = [...msgs].reverse().find((m) => m.role === "user")?.text;
  const wa = `https://wa.me/${site.whatsappIntl}?text=${encodeURIComponent(lastQ ? `আসসালামু আলাইকুম, ওয়েবসাইটের চ্যাট থেকে: ${lastQ}` : "আসসালামু আলাইকুম, আমি একটি মেশিন সম্পর্কে জানতে চাই।")}`;

  return (
    <>
      {open && (
        <section role="dialog" aria-label="DMG সহকারী chat" className="fixed inset-x-2 bottom-20 z-50 flex origin-bottom-right animate-pop-in max-h-[75vh] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:inset-x-auto sm:right-5 sm:w-[380px] md:bottom-24">
          <header className="flex items-center gap-3 bg-brand-700 px-4 py-3 text-white">
            <span className="relative h-10 w-10 shrink-0">
              <SupportAvatar className="h-10 w-10 rounded-full ring-2 ring-white/40" />
              <OnlineDot className="-bottom-0.5 -right-0.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold leading-tight">DMG সহকারী</p>
              <p className="flex items-center gap-1.5 text-xs text-white/80"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> অনলাইন · মেশিন, দাম ও অর্ডার</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-lg p-1 hover:bg-white/15"><X className="h-5 w-5" /></button>
          </header>
          <div className="flex gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2">
            <a href={wa} target="_blank" rel="noopener" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#25d366] py-1.5 text-xs font-bold text-white"><WhatsappIcon className="h-4 w-4" /> মানুষের সাথে কথা বলুন</a>
            <a href={`tel:${site.phoneIntl}`} className="flex items-center justify-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-bold text-white"><Phone className="h-3.5 w-3.5" /> কল</a>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3" aria-live="polite">
            {msgs.length === 0 && (
              <div className="rounded-2xl rounded-tl-sm bg-gray-100 p-3 text-sm text-gray-800">
                আসসালামু আলাইকুম! আমি ঢাকা মেশিন ঘরের সহকারী। কোন মেশিন খুঁজছেন বা কী জানতে চান?
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`max-w-[85%] whitespace-pre-line rounded-2xl p-3 text-sm ${m.role === "user" ? "ml-auto rounded-tr-sm bg-brand-600 text-white" : "rounded-tl-sm bg-gray-100 text-gray-800"}`}>
                {m.role === "assistant" ? <Rich text={m.text} /> : m.text}
              </div>
            ))}
            {busy && <div className="flex w-fit items-center gap-2 rounded-2xl bg-gray-100 px-3 py-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> লিখছে…</div>}
            {msgs.length === 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-brand-200 px-3 py-1 text-xs text-brand-700 hover:bg-brand-50">{s}</button>
                ))}
              </div>
            )}
            <div ref={end} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t border-gray-100 p-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={1000} placeholder="আপনার প্রশ্ন লিখুন…" aria-label="Message" className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-600" />
            <button disabled={busy || !input.trim()} aria-label="Send" className="rounded-xl bg-brand-600 px-3 text-white disabled:opacity-50"><Send className="h-4 w-4" /></button>
          </form>
        </section>
      )}
      <div className="relative">
        {greet && !open && (
          <div className="absolute bottom-2 right-full mr-3 w-max max-w-[230px] origin-bottom-right animate-pop-in">
            <button
              onClick={() => setOpen(true)}
              className="rounded-2xl rounded-br-sm bg-white px-4 py-2.5 text-left text-[13px] leading-snug text-gray-800 shadow-xl ring-1 ring-black/5 hover:ring-brand-200"
            >
              <span className="block font-bold text-gray-900">আসসালামু আলাইকুম! 👋</span>
              কোন মেশিন খুঁজছেন? আমাকে জিজ্ঞেস করুন।
            </button>
            <button
              onClick={() => setGreet(false)}
              aria-label="Dismiss"
              className="absolute -left-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white shadow ring-2 ring-white hover:bg-black"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close chat" : "Open chat"}
          aria-expanded={open}
          className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg ring-[3px] ring-white transition-transform hover:scale-105 ${open ? "" : "animate-nudge"}`}
        >
          {open ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <SupportAvatar className="h-full w-full rounded-full" />
              <OnlineDot className="bottom-0 right-0" />
            </>
          )}
        </button>
      </div>
    </>
  );
}
