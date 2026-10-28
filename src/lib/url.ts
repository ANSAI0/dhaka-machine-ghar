// Public base URL for links sent outside the site (SMS, documents). Set SITE_URL in .env for production.
export const siteUrl = () => (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
