"use client";

import { useActionState, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { addBanner, type BannerState } from "./actions";

const input = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-600";

export function BannerForm({ full }: { full: boolean }) {
  const [state, action, pending] = useActionState<BannerState, FormData>(addBanner, {});
  const [preview, setPreview] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={form}
      action={async (fd) => {
        await action(fd);
        form.current?.reset();
        setPreview(null);
      }}
      className="grid gap-4 sm:grid-cols-[1fr_1fr]"
    >
      <label className="text-sm">
        <span className="mb-1 block font-semibold text-gray-700">Banner image *</span>
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          disabled={full}
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPreview(f ? URL.createObjectURL(f) : null);
          }}
          className={input}
        />
        <span className="mt-1 block text-xs text-gray-500">Wide image, 16:9 — best 1600 × 900 px (JPG/PNG/WebP, up to 5 MB). Keep text away from the edges.</span>
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-semibold text-gray-700">Link (optional)</span>
        <input name="link" placeholder="/category/power-press  or  https://…" disabled={full} className={input} />
        <span className="mt-1 block text-xs text-gray-500">Where tapping the banner goes. Leave empty for no link.</span>
      </label>
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element -- local blob preview
        <img src={preview} alt="" className="aspect-video w-full max-w-md rounded-md object-cover ring-1 ring-gray-200 sm:col-span-2" />
      )}
      <div className="flex items-center gap-3 sm:col-span-2">
        <button disabled={pending || full} className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Add banner
        </button>
        {full && <span className="text-xs text-gray-500">Maximum reached — delete one to add another.</span>}
        {(state.ok || state.error) && <span role="status" className={`text-sm ${state.error ? "text-accent-600" : "text-brand-700"}`}>{state.error ?? state.ok}</span>}
      </div>
    </form>
  );
}
