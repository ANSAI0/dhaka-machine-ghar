// Brand colours editable in Admin → Settings. Each is the "600" shade; lighter/darker shades are
// derived with CSS color-mix so the whole Tailwind palette (bg-brand-50 … text-brand-900) follows.

// Phones: "dark" = dark luxury (near-black + gold), "light" = clean white. Desktop is always light.
export type MobileStyle = "dark" | "light";
export type Theme = { brand: string; accent: string; steel: string; mobile: MobileStyle };
const colorKeys = ["brand", "accent", "steel"] as const;

// From the DMG logo — also the values hard-coded in globals.css.
export const themeDefaults: Theme = { brand: "#2e5e47", accent: "#98000f", steel: "#1570a8", mobile: "dark" };

export const isHex = (s: string) => /^#[0-9a-f]{6}$/i.test(s);

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// WCAG contrast of white text on this colour (buttons, nav bar, badges).
export const contrastWithWhite = (hex: string) => 1.05 / (luminance(hex) + 0.05);

// Lighter shades mix toward white, darker toward black.
const shades: Record<string, [number, "white" | "black"]> = {
  "50": [8, "white"],
  "100": [16, "white"],
  "200": [32, "white"],
  "500": [82, "white"],
  "700": [80, "black"],
  "800": [62, "black"],
  "900": [42, "black"],
};

export function themeCss(t: Theme): string {
  const changed = colorKeys.filter((k) => isHex(t[k]) && t[k].toLowerCase() !== themeDefaults[k]);
  if (!changed.length) return "";
  const vars = changed.flatMap((k) => [
    `--color-${k}-600:${t[k]}`,
    ...Object.entries(shades).map(([n, [pct, to]]) => `--color-${k}-${n}:color-mix(in oklab,${t[k]} ${pct}%,${to})`),
  ]);
  return `html:root{${vars.join(";")}}`;
}
