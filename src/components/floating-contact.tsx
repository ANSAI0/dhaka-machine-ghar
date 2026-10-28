import { getBotSettings, getSite } from "@/lib/settings";
import { WhatsappIcon } from "./brand-icons";
import { ChatWidget } from "./chat-widget";

// Floating WhatsApp button, plus the chat assistant when it's switched on in Settings.
export async function FloatingContact() {
  const [site, bot] = await Promise.all([getSite(), getBotSettings()]);
  return (
    <div className="fixed bottom-20 right-3 z-40 flex flex-col items-end gap-3 md:bottom-6 md:right-5">
      <a
        href={`https://wa.me/${site.whatsappIntl}?text=${encodeURIComponent("আসসালামু আলাইকুম, আমি একটি মেশিন সম্পর্কে জানতে চাই।")}`}
        target="_blank"
        rel="noopener"
        aria-label="WhatsApp"
        className={`${bot.enabled ? "hidden md:flex" : "flex"} h-12 w-12 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition-transform hover:scale-105`}
      >
        <WhatsappIcon className="h-6 w-6" />
      </a>
      {bot.enabled && <ChatWidget />}
    </div>
  );
}
