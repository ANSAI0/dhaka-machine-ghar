// Wide Wikimedia Commons photos used as home-page backgrounds (credited on the image itself).
export const heroImages = {
  sparks: { src: "/hero/sparks.webp", credit: "Lacholazarovphotos · CC BY 4.0 · Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:A_song_of_fire_and_metal.jpg" },
  welding: { src: "/hero/welding.webp", credit: "Uğur Gürcüoğlu · CC0 · Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Welder_in_a_workshop_(Unsplash).jpg" },
  lathe: { src: "/hero/lathe.webp", credit: "David English · CC BY-SA 4.0 · Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Turning_on_a_Mandrel.jpg" },
  workshop: { src: "/hero/workshop.webp", credit: "Marathon · CC BY-SA 2.0 · Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:The_machine_shop_at_Crossness_-_geograph.org.uk_-_6134595.jpg" },
  hall: { src: "/hero/lathe-hall.webp", credit: "Hilda Raphael · CC0 · Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Mechanical_engineering_workshop_at_Arusha_Technical_College,_Tanzania.jpg" },
} as const;

// Looping hero clip (12 s, muted) cut from a CC0 Commons video.
export const heroVideo = {
  src: "/hero/lathe-drill.mp4",
  poster: "/hero/lathe-drill-poster.webp",
  credit: "Musicaloris · CC0 · Wikimedia Commons",
  source: "https://commons.wikimedia.org/wiki/File:Drilling_a_gear_wheel_on_a_turning_machine.WebM",
};

// The DMG factory video on the company YouTube channel (phone hero).
export const dmgVideo = { id: "LCpMgWpwfMI", url: "https://www.youtube.com/watch?v=LCpMgWpwfMI" };
