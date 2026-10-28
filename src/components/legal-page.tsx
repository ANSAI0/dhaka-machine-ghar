import { FileText } from "lucide-react";
import type { SiteInfo } from "@/lib/site";
import { Breadcrumb } from "./breadcrumb";
import { PageHero } from "./page-hero";

export type LegalSection = { h: string; p: (string | string[])[] }; // a string[] renders as a bullet list

// Shared layout for the Privacy / Refund / Terms pages.
export function LegalPage({ title, eyebrow, intro, updated, sections, site }: { title: string; eyebrow: string; intro: string; updated: string; sections: LegalSection[]; site: SiteInfo }) {
  return (
    <div className="container mx-auto px-3 pt-4 sm:px-4 lg:pt-6">
      <Breadcrumb items={[{ label: title }]} />
      <PageHero eyebrow={eyebrow} title={title} text={intro} Icon={FileText} />
      <article className="mx-auto mb-10 max-w-3xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
        <p className="mb-6 text-xs font-semibold uppercase tracking-wider text-gray-400">Last updated: {updated}</p>
        <div className="space-y-7">
          {sections.map((s, i) => (
            <section key={s.h}>
              <h2 className="text-lg font-extrabold text-gray-900">
                {i + 1}. {s.h}
              </h2>
              {s.p.map((block, k) =>
                Array.isArray(block) ? (
                  <ul key={k} className="mt-2 list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-gray-700">
                    {block.map((li) => (
                      <li key={li}>{li}</li>
                    ))}
                  </ul>
                ) : (
                  <p key={k} className="mt-2 text-[15px] leading-relaxed text-gray-700">
                    {block}
                  </p>
                ),
              )}
            </section>
          ))}
          <section className="rounded-xl bg-gray-50 p-5 text-sm text-gray-700">
            <h2 className="font-extrabold text-gray-900">Contact</h2>
            <p className="mt-1">
              {site.name} ({site.nameBn}) · Factory: {site.address} · Showroom: {site.showroom}
            </p>
            <p className="mt-1">
              Phone: <a href={`tel:${site.phoneIntl}`} className="font-semibold text-brand-700">{site.phone}</a> · Email:{" "}
              <a href={`mailto:${site.email}`} className="font-semibold text-brand-700">{site.email}</a>
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
