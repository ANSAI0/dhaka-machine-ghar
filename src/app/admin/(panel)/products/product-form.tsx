"use client";

import Image from "next/image";
import { startTransition, useActionState, useState } from "react";
import { Loader2, Save } from "lucide-react";
import type { Category, Product } from "@/lib/catalog";
import { saveProduct, type ProductFormState } from "./actions";

export type ProductFormValues = Omit<Product, "icon"> & { active: boolean };

const input = "w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100";
const slugify = (s: string) => s.toLowerCase().replace(/["'″]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

type FieldProps = { name: string; label: string; hint?: string; error?: string; children: React.ReactNode; className?: string };
function Field({ name, label, hint, error, children, className = "" }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={`pf-${name}`} className="mb-1 block text-sm font-semibold text-gray-700">{label}</label>
      {children}
      {error ? <p className="mt-1 text-xs font-medium text-accent-600">{error}</p> : hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export function ProductForm({ categories, initial }: { categories: Category[]; initial?: ProductFormValues }) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(saveProduct.bind(null, initial?.slug ?? null), {});
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [cat, setCat] = useState(initial?.category ?? categories[0]?.slug ?? "");
  const [preview, setPreview] = useState<string | null>(null);
  const fe = state.fieldErrors ?? {};
  const subs = categories.find((c) => c.slug === cat)?.subcategories ?? [];

  const b = (n: string) => (fe[n] ? "border-accent-600" : "border-gray-200");

  return (
    <form
      // Submit manually: <form action> would reset every field after a failed validation.
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="grid gap-6 xl:grid-cols-3"
    >
      <div className="space-y-6 xl:col-span-2">
        <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold text-gray-800">Basics</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="name" error={fe.name} label="Name (English) *">
              <input id="pf-name" name="name" value={name} onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} className={`${input} ${b("name")}`} />
            </Field>
            <Field name="nameBn" error={fe.nameBn} label="নাম (বাংলা) *">
              <input id="pf-nameBn" name="nameBn" defaultValue={initial?.nameBn} className={`${input} ${b("nameBn")}`} />
            </Field>
            <Field name="slug" error={fe.slug} label="URL slug *" hint={`/product/${slug || "…"}`} className="sm:col-span-2">
              <input id="pf-slug" name="slug" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} className={`${input} ${b("slug")} font-mono`} />
            </Field>
            <Field name="category" error={fe.category} label="Category *">
              <select id="pf-category" name="category" value={cat} onChange={(e) => setCat(e.target.value)} className={`${input} ${b("category")}`}>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </Field>
            <Field name="subcategory" error={fe.subcategory} label="Type">
              <select key={cat} id="pf-subcategory" name="subcategory" defaultValue={initial?.category === cat ? initial.subcategory : ""} className={`${input} border-gray-200`}>
                <option value="">—</option>
                {subs.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
              </select>
            </Field>
            <Field name="condition" error={fe.condition} label="Condition *">
              <select id="pf-condition" name="condition" defaultValue={initial?.condition ?? "new"} className={`${input} ${b("condition")}`}>
                <option value="new">Brand New (Factory Made)</option>
                <option value="reconditioned">Foreign Reconditioned</option>
              </select>
            </Field>
            <Field name="brand" error={fe.brand} label="Brand">
              <input id="pf-brand" name="brand" defaultValue={initial?.brand ?? "Dhaka Machine Ghar"} className={`${input} border-gray-200`} />
            </Field>
            <Field name="capacity" error={fe.capacity} label="Capacity *" hint="Shown on cards and used by the capacity filter, e.g. 25 Ton">
              <input id="pf-capacity" name="capacity" defaultValue={initial?.capacity} className={`${input} ${b("capacity")}`} />
            </Field>
            <Field name="voltage" error={fe.voltage} label="Power supply">
              <input id="pf-voltage" name="voltage" list="voltages" defaultValue={initial?.voltage ?? "440V Three Phase"} className={`${input} border-gray-200`} />
              <datalist id="voltages"><option value="220V Single Phase" /><option value="440V Three Phase" /><option value="Manual" /></datalist>
            </Field>
            <Field name="short" error={fe.short} label="Short description *" className="sm:col-span-2">
              <textarea id="pf-short" name="short" rows={2} defaultValue={initial?.short} className={`${input} ${b("short")}`} />
            </Field>
            <Field name="highlights" error={fe.highlights} label="Highlights" hint="One per line" className="sm:col-span-2">
              <textarea id="pf-highlights" name="highlights" rows={3} defaultValue={initial?.highlights.join("\n")} className={`${input} border-gray-200`} />
            </Field>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold text-gray-800">Technical specifications</h2>
          <Field name="specs" error={fe.specs} label="Spec table" hint="One row per line — Label: Value (e.g. Stroke: 50 mm)">
            <textarea id="pf-specs" name="specs" rows={8} defaultValue={initial?.specs.map(([k, v]) => `${k}: ${v}`).join("\n")} className={`${input} border-gray-200 font-mono text-xs`} />
          </Field>
        </section>

        <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold text-gray-800">ROI calculator defaults</h2>
          <p className="text-xs text-gray-500">Leave all empty to hide the “monthly profit” example for this machine.</p>
          <div className="grid gap-4 sm:grid-cols-4">
            <Field name="roiProduct" error={fe.roiProduct} label="Example product"><input id="pf-roiProduct" name="roiProduct" defaultValue={initial?.roi?.product} className={`${input} ${b("roi")}`} /></Field>
            <Field name="roiUnits" error={fe.roiUnits} label="Units / day"><input id="pf-roiUnits" name="roiUnits" inputMode="numeric" defaultValue={initial?.roi?.unitsPerDay} className={`${input} ${b("roi")}`} /></Field>
            <Field name="roiProfit" error={fe.roiProfit} label="Profit / unit (৳)"><input id="pf-roiProfit" name="roiProfit" inputMode="decimal" defaultValue={initial?.roi?.profitPerUnit} className={`${input} ${b("roi")}`} /></Field>
            <Field name="roiCost" error={fe.roiCost} label="Monthly cost (৳)"><input id="pf-roiCost" name="roiCost" inputMode="numeric" defaultValue={initial?.roi?.monthlyCost} className={`${input} ${b("roi")}`} /></Field>
          </div>
          {fe.roi && <p className="text-xs font-medium text-accent-600">{fe.roi}</p>}
        </section>

        <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold text-gray-800">Ad landing page</h2>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700"><input type="checkbox" name="landing" defaultChecked={initial?.landing} className="h-4 w-4 accent-brand-600" /> Landing page live at /lp/{slug || "…"}</label>
          <Field name="landingHeadline" error={fe.landingHeadline} label="Headline (বাংলা)" hint="Leave empty to auto-generate from the Bangla name">
            <input id="pf-landingHeadline" name="landingHeadline" defaultValue={initial?.landingCopy?.headline} className={`${input} border-gray-200`} />
          </Field>
          <Field name="landingSub" error={fe.landingSub} label="Sub-headline">
            <input id="pf-landingSub" name="landingSub" defaultValue={initial?.landingCopy?.sub} className={`${input} border-gray-200`} />
          </Field>
        </section>
      </div>

      <div className="space-y-6">
        <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold text-gray-800">Price (৳)</h2>
          <Field name="price" error={fe.price} label="Price *"><input id="pf-price" name="price" inputMode="numeric" defaultValue={initial?.price} className={`${input} ${b("price")}`} /></Field>
          <Field name="oldPrice" error={fe.oldPrice} label="Old price (shows discount)"><input id="pf-oldPrice" name="oldPrice" inputMode="numeric" defaultValue={initial?.oldPrice} className={`${input} ${b("oldPrice")}`} /></Field>
        </section>

        <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold text-gray-800">Photo</h2>
          <div className="relative aspect-square overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- local blob preview
              <img src={preview} alt="New photo preview" className="h-full w-full object-contain p-2" />
            ) : initial?.image ? (
              <Image src={initial.image} alt="Current photo" fill sizes="320px" className="object-contain p-2" />
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-gray-400">No photo yet</p>
            )}
          </div>
          <input
            id="pf-image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Upload photo"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setPreview(f ? URL.createObjectURL(f) : null);
            }}
            className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-700"
          />
          <p className="text-xs text-gray-400">JPG, PNG or WebP, up to 5 MB. Square photos on a white background look best.</p>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input type="checkbox" name="brandLogo" defaultChecked className="h-4 w-4 accent-brand-600" /> Add DMG logo to the photo
          </label>
          {fe.image && <p className="text-xs font-medium text-accent-600">{fe.image}</p>}
          {initial?.image && <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" name="removeImage" className="h-4 w-4" /> Remove current photo</label>}
        </section>

        <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold text-gray-800">Video & visibility</h2>
          <Field name="video" error={fe.video} label="YouTube video" hint="Paste the link or video id">
            <input id="pf-video" name="video" defaultValue={initial?.videoId ? `https://youtu.be/${initial.videoId}` : ""} className={`${input} ${b("video")}`} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="active" defaultChecked={initial?.active ?? true} className="h-4 w-4 accent-brand-600" /> Visible on website</label>
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="featured" defaultChecked={initial?.featured} className="h-4 w-4 accent-brand-600" /> Featured on home page</label>
        </section>

        {state.error && <p className="rounded-xl bg-accent-50 p-3 text-sm font-medium text-accent-700" role="status">{state.error}</p>}
        <button disabled={pending} className="sticky bottom-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 font-bold text-white shadow-lg hover:bg-brand-700 disabled:opacity-60">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save product
        </button>
      </div>
    </form>
  );
}
