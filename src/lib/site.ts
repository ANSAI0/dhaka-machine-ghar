// Business profile. Contact details, advance % and warranty terms are editable in
// Admin → Settings (stored in the DB); these values are the defaults until then.
// Read them with getSite() on the server or useSite() in client components.

export const brand = {
  name: "Dhaka Machine Ghar",
  nameBn: "ঢাকা মেশিন ঘর",
  tagline: "Power Press Manufacturer & Workshop Machinery Supplier",
};

export type EditableSite = {
  address: string;
  showroom: string;
  phone: string; // as displayed, e.g. 01712-808790
  whatsapp: string; // local number for WhatsApp; empty = same as phone
  email: string;
  facebook: string;
  youtube: string;
  hours: string;
  mapQuery: string; // Google Maps search text or "lat,lng"
  advancePercent: number;
  warrantyNewMonths: number;
  warrantyReconMonths: number;
};

export const siteDefaults: EditableSite = {
  address: "Sarighat, Aintha, Keraniganj, Dhaka, Bangladesh",
  showroom: "Dholaikhal, Dhaka",
  phone: "01712-808790",
  whatsapp: "",
  email: "dhakamachineghar@yahoo.com",
  facebook: "https://www.facebook.com/dhakamachineghar/",
  youtube: "https://www.youtube.com/@MDSHARIF-gn4ot",
  hours: "শনি – বৃহস্পতি, সকাল ৯টা – রাত ৮টা",
  mapQuery: "Aintha, Keraniganj, Dhaka",
  advancePercent: 20,
  warrantyNewMonths: 12,
  warrantyReconMonths: 6,
};

export type SiteInfo = typeof brand & EditableSite & { phoneIntl: string; whatsappIntl: string };

const intl = (local: string) => {
  const d = local.replace(/\D/g, "");
  return d.startsWith("880") ? d : `88${d}`;
};

export function buildSite(e: EditableSite): SiteInfo {
  return { ...brand, ...e, phoneIntl: `+${intl(e.phone)}`, whatsappIntl: intl(e.whatsapp || e.phone) };
}

export const formatBDT = (n: number) => "৳" + n.toLocaleString("en-IN");
