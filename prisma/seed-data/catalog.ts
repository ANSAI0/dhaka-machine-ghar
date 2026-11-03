// The DMG catalog: the owner's own products and photos (public/products). Loaded by `npm run db:seed`
// and scripts/sync-catalog.ts; afterwards the admin panel is the source of truth.
import type { Category, Product } from "../../src/lib/catalog";

export type SeedCategory = Omit<Category, "subcategories"> & { subcategories: { slug: string; name: string }[] };
export type SeedProduct = Omit<Product, "icon" | "offer">;

export const seedCategories: SeedCategory[] = [
  {
    "slug": "power-press",
    "name": "Power Press Machines",
    "nameBn": "পাওয়ার প্রেস মেশিন",
    "icon": "Factory",
    "subcategories": [
      {
        "slug": "channel-body",
        "name": "Channel Body Power Press"
      },
      {
        "slug": "bou-body",
        "name": "Bou Body (C-Frame) Power Press"
      },
      {
        "slug": "hydraulic",
        "name": "Hydraulic Press"
      }
    ]
  },
  {
    "slug": "workshop",
    "name": "Workshop Machines",
    "nameBn": "ওয়ার্কশপ মেশিন",
    "icon": "Cog",
    "subcategories": [
      {
        "slug": "shearing",
        "name": "Shearing Machines"
      },
      {
        "slug": "drill",
        "name": "Drill Machines"
      }
    ]
  },
  {
    "slug": "ac-stand",
    "name": "AC Stands",
    "nameBn": "এসি স্ট্যান্ড",
    "icon": "Wrench",
    "subcategories": [
      {
        "slug": "wall-stand",
        "name": "Wall Stand"
      },
      {
        "slug": "floor-stand",
        "name": "Floor Stand"
      },
      {
        "slug": "bulk",
        "name": "Bulk / By KG"
      }
    ]
  },
  {
    "slug": "hardware",
    "name": "Bolts & Hardware",
    "nameBn": "বোল্ট ও হার্ডওয়্যার",
    "icon": "CircuitBoard",
    "subcategories": [
      {
        "slug": "bolts",
        "name": "Anchor / Rawal Bolts"
      }
    ]
  }
];

// price 0 = "price on request" (set real prices in Admin → Products).
export const seedProducts: SeedProduct[] = [
  {
    "slug": "channel-body-power-press-teal-yellow",
    "name": "Channel Body Power Press — Teal & Yellow",
    "nameBn": "চ্যানেল বডি পাওয়ার প্রেস — টিল ও হলুদ",
    "category": "power-press",
    "subcategory": "channel-body",
    "condition": "new",
    "price": 0,
    "image": "/products/channel-body-power-press-teal-yellow.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy channel body (H-frame) mechanical power press, built in our own factory — for punching, blanking, bending and forming sheet metal.",
    "highlights": [
      "Strong two-pillar channel body frame",
      "Heavy flywheel with gear drive",
      "Adjustable stroke and ram for different dies",
      "Tonnage and size made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Teal with yellow gear"
      ]
    ],
    "featured": true
  },
  {
    "slug": "channel-body-power-press-sky-blue",
    "name": "Channel Body Power Press — Sky Blue",
    "nameBn": "চ্যানেল বডি পাওয়ার প্রেস — আকাশি",
    "category": "power-press",
    "subcategory": "channel-body",
    "condition": "new",
    "price": 0,
    "image": "/products/channel-body-power-press-sky-blue.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy channel body (H-frame) mechanical power press, built in our own factory — for punching, blanking, bending and forming sheet metal.",
    "highlights": [
      "Strong two-pillar channel body frame",
      "Heavy flywheel with gear drive",
      "Adjustable stroke and ram for different dies",
      "Tonnage and size made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Sky blue"
      ]
    ],
    "featured": true
  },
  {
    "slug": "channel-body-power-press-green",
    "name": "Channel Body Power Press — Green",
    "nameBn": "চ্যানেল বডি পাওয়ার প্রেস — সবুজ",
    "category": "power-press",
    "subcategory": "channel-body",
    "condition": "new",
    "price": 0,
    "image": "/products/channel-body-power-press-green.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy channel body (H-frame) mechanical power press, built in our own factory — for punching, blanking, bending and forming sheet metal.",
    "highlights": [
      "Strong two-pillar channel body frame",
      "Heavy flywheel with gear drive",
      "Adjustable stroke and ram for different dies",
      "Tonnage and size made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Green with red fittings"
      ]
    ],
    "featured": false
  },
  {
    "slug": "channel-body-power-press-teal-orange",
    "name": "Channel Body Power Press — Teal & Orange",
    "nameBn": "চ্যানেল বডি পাওয়ার প্রেস — টিল ও কমলা",
    "category": "power-press",
    "subcategory": "channel-body",
    "condition": "new",
    "price": 0,
    "image": "/products/channel-body-power-press-teal-orange.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy channel body (H-frame) mechanical power press, built in our own factory — for punching, blanking, bending and forming sheet metal.",
    "highlights": [
      "Strong two-pillar channel body frame",
      "Heavy flywheel with gear drive",
      "Adjustable stroke and ram for different dies",
      "Tonnage and size made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Teal with orange fittings"
      ]
    ],
    "featured": false
  },
  {
    "slug": "channel-body-power-press-bright-green",
    "name": "Channel Body Power Press — Bright Green",
    "nameBn": "চ্যানেল বডি পাওয়ার প্রেস — উজ্জ্বল সবুজ",
    "category": "power-press",
    "subcategory": "channel-body",
    "condition": "new",
    "price": 0,
    "image": "/products/channel-body-power-press-bright-green.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy channel body (H-frame) mechanical power press, built in our own factory — for punching, blanking, bending and forming sheet metal.",
    "highlights": [
      "Strong two-pillar channel body frame",
      "Heavy flywheel with gear drive",
      "Adjustable stroke and ram for different dies",
      "Tonnage and size made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Bright green"
      ]
    ],
    "featured": true
  },
  {
    "slug": "channel-body-power-press-blue",
    "name": "Channel Body Power Press — Blue",
    "nameBn": "চ্যানেল বডি পাওয়ার প্রেস — নীল",
    "category": "power-press",
    "subcategory": "channel-body",
    "condition": "new",
    "price": 0,
    "image": "/products/channel-body-power-press-blue.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy channel body (H-frame) mechanical power press, built in our own factory — for punching, blanking, bending and forming sheet metal.",
    "highlights": [
      "Strong two-pillar channel body frame",
      "Heavy flywheel with gear drive",
      "Adjustable stroke and ram for different dies",
      "Tonnage and size made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Blue"
      ]
    ],
    "featured": false
  },
  {
    "slug": "channel-body-power-press-mint",
    "name": "Channel Body Power Press — Mint Green",
    "nameBn": "চ্যানেল বডি পাওয়ার প্রেস — মিন্ট সবুজ",
    "category": "power-press",
    "subcategory": "channel-body",
    "condition": "new",
    "price": 0,
    "image": "/products/channel-body-power-press-mint.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy channel body (H-frame) mechanical power press, built in our own factory — for punching, blanking, bending and forming sheet metal.",
    "highlights": [
      "Strong two-pillar channel body frame",
      "Heavy flywheel with gear drive",
      "Adjustable stroke and ram for different dies",
      "Tonnage and size made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Mint green with red fittings"
      ]
    ],
    "featured": false
  },
  {
    "slug": "channel-body-power-press-steel-blue",
    "name": "Channel Body Power Press — Steel Blue",
    "nameBn": "চ্যানেল বডি পাওয়ার প্রেস — স্টিল ব্লু",
    "category": "power-press",
    "subcategory": "channel-body",
    "condition": "new",
    "price": 0,
    "image": "/products/channel-body-power-press-steel-blue.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy channel body (H-frame) mechanical power press, built in our own factory — for punching, blanking, bending and forming sheet metal.",
    "highlights": [
      "Strong two-pillar channel body frame",
      "Heavy flywheel with gear drive",
      "Adjustable stroke and ram for different dies",
      "Tonnage and size made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Steel blue"
      ]
    ],
    "featured": false
  },
  {
    "slug": "channel-body-power-press-green-orange-gear",
    "name": "Channel Body Power Press — Green & Orange",
    "nameBn": "চ্যানেল বডি পাওয়ার প্রেস — সবুজ ও কমলা",
    "category": "power-press",
    "subcategory": "channel-body",
    "condition": "new",
    "price": 0,
    "image": "/products/channel-body-power-press-green-orange-gear.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy channel body (H-frame) mechanical power press, built in our own factory — for punching, blanking, bending and forming sheet metal.",
    "highlights": [
      "Strong two-pillar channel body frame",
      "Heavy flywheel with gear drive",
      "Adjustable stroke and ram for different dies",
      "Tonnage and size made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Green with orange gear"
      ]
    ],
    "featured": false
  },
  {
    "slug": "heavy-duty-channel-body-power-press",
    "name": "Heavy Duty Channel Body Power Press",
    "nameBn": "হেভি ডিউটি চ্যানেল বডি পাওয়ার প্রেস",
    "category": "power-press",
    "subcategory": "channel-body",
    "condition": "new",
    "price": 0,
    "image": "/products/heavy-duty-channel-body-power-press.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Large, heavy duty channel body power press with a multi-groove pulley and big gear — for high-tonnage punching and forming.",
    "highlights": [
      "Strong two-pillar channel body frame",
      "Heavy flywheel with gear drive",
      "Adjustable stroke and ram for different dies",
      "Tonnage and size made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Green with red pulley"
      ]
    ],
    "featured": true
  },
  {
    "slug": "heavy-duty-channel-body-power-press-grey",
    "name": "Heavy Duty Channel Body Power Press — Grey",
    "nameBn": "হেভি ডিউটি চ্যানেল বডি পাওয়ার প্রেস — ধূসর",
    "category": "power-press",
    "subcategory": "channel-body",
    "condition": "new",
    "price": 0,
    "image": "/products/heavy-duty-channel-body-power-press-grey.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy duty channel body power press with a large multi-groove pulley and gear drive — built for long production runs.",
    "highlights": [
      "Strong two-pillar channel body frame",
      "Heavy flywheel with gear drive",
      "Adjustable stroke and ram for different dies",
      "Tonnage and size made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Grey with red pulley and gear"
      ]
    ],
    "featured": false
  },
  {
    "slug": "channel-body-power-press-motor-top-teal",
    "name": "Channel Body Power Press with Top Motor — Teal",
    "nameBn": "টপ মোটর চ্যানেল বডি পাওয়ার প্রেস — টিল",
    "category": "power-press",
    "subcategory": "channel-body",
    "condition": "new",
    "price": 0,
    "image": "/products/channel-body-power-press-motor-top-teal.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Channel body power press with the motor mounted on top and double gear drive — compact, heavy-duty and ready for continuous production work.",
    "highlights": [
      "Top-mounted motor saves floor space",
      "Double gear drive for higher pressing force",
      "Strong two-pillar channel body frame",
      "Tonnage made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Drive",
        "Top-mounted motor, double gear and flywheel"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Teal"
      ]
    ],
    "featured": true
  },
  {
    "slug": "channel-body-power-press-motor-top-blue",
    "name": "Channel Body Power Press with Top Motor — Blue",
    "nameBn": "টপ মোটর চ্যানেল বডি পাওয়ার প্রেস — নীল",
    "category": "power-press",
    "subcategory": "channel-body",
    "condition": "new",
    "price": 0,
    "image": "/products/channel-body-power-press-motor-top-blue.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Channel body power press with the motor mounted on top and double gear drive — compact, heavy-duty and ready for continuous production work.",
    "highlights": [
      "Top-mounted motor saves floor space",
      "Double gear drive for higher pressing force",
      "Strong two-pillar channel body frame",
      "Tonnage made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Drive",
        "Top-mounted motor, double gear and flywheel"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Blue"
      ]
    ],
    "featured": false
  },
  {
    "slug": "bou-body-power-press-green-red",
    "name": "Bou Body Power Press — Green & Red",
    "nameBn": "বউ বডি পাওয়ার প্রেস — সবুজ ও লাল",
    "category": "power-press",
    "subcategory": "bou-body",
    "condition": "new",
    "price": 0,
    "image": "/products/bou-body-power-press-green-red.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Bou body (C-frame) mechanical power press with an open front — easy loading for punching, cutting and pressing small and medium parts.",
    "highlights": [
      "Open-front C-frame for easy die setting and loading",
      "Heavy flywheel and gear drive",
      "Large working table with T-slots",
      "Tonnage made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Bou body / C-frame mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Green with red gear"
      ]
    ],
    "featured": true
  },
  {
    "slug": "bou-body-power-press-grey-orange",
    "name": "Bou Body Power Press — Grey & Orange",
    "nameBn": "বউ বডি পাওয়ার প্রেস — ধূসর ও কমলা",
    "category": "power-press",
    "subcategory": "bou-body",
    "condition": "new",
    "price": 0,
    "image": "/products/bou-body-power-press-grey-orange.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Bou body (C-frame) mechanical power press with an open front — easy loading for punching, cutting and pressing small and medium parts.",
    "highlights": [
      "Open-front C-frame for easy die setting and loading",
      "Heavy flywheel and gear drive",
      "Large working table with T-slots",
      "Tonnage made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Bou body / C-frame mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Grey with orange gear"
      ]
    ],
    "featured": true
  },
  {
    "slug": "bou-body-power-press-green-black",
    "name": "Bou Body Power Press — Green & Black",
    "nameBn": "বউ বডি পাওয়ার প্রেস — সবুজ ও কালো",
    "category": "power-press",
    "subcategory": "bou-body",
    "condition": "new",
    "price": 0,
    "image": "/products/bou-body-power-press-green-black.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Bou body (C-frame) mechanical power press with an open front — easy loading for punching, cutting and pressing small and medium parts.",
    "highlights": [
      "Open-front C-frame for easy die setting and loading",
      "Heavy flywheel and gear drive",
      "Large working table with T-slots",
      "Tonnage made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Bou body / C-frame mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Green with black gear"
      ]
    ],
    "featured": false
  },
  {
    "slug": "bou-body-power-press-lime",
    "name": "Bou Body Power Press — Lime Green",
    "nameBn": "বউ বডি পাওয়ার প্রেস — লাইম সবুজ",
    "category": "power-press",
    "subcategory": "bou-body",
    "condition": "new",
    "price": 0,
    "image": "/products/bou-body-power-press-lime.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Bou body (C-frame) mechanical power press with an open front — easy loading for punching, cutting and pressing small and medium parts.",
    "highlights": [
      "Open-front C-frame for easy die setting and loading",
      "Heavy flywheel and gear drive",
      "Large working table with T-slots",
      "Tonnage made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Bou body / C-frame mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Lime green with red-yellow pulley"
      ]
    ],
    "featured": true
  },
  {
    "slug": "bou-body-power-press-open-table",
    "name": "Bou Body Power Press — Open Front Table",
    "nameBn": "বউ বডি পাওয়ার প্রেস — খোলা টেবিল",
    "category": "power-press",
    "subcategory": "bou-body",
    "condition": "new",
    "price": 0,
    "image": "/products/bou-body-power-press-open-table.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Bou body (C-frame) mechanical power press with an open front — easy loading for punching, cutting and pressing small and medium parts.",
    "highlights": [
      "Open-front C-frame for easy die setting and loading",
      "Heavy flywheel and gear drive",
      "Large working table with T-slots",
      "Tonnage made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Bou body / C-frame mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Green with red pulley"
      ]
    ],
    "featured": false
  },
  {
    "slug": "bou-body-power-press-teal-yellow",
    "name": "Bou Body Power Press — Teal & Yellow",
    "nameBn": "বউ বডি পাওয়ার প্রেস — টিল ও হলুদ",
    "category": "power-press",
    "subcategory": "bou-body",
    "condition": "new",
    "price": 0,
    "image": "/products/bou-body-power-press-teal-yellow.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Bou body (C-frame) mechanical power press with an open front — easy loading for punching, cutting and pressing small and medium parts.",
    "highlights": [
      "Open-front C-frame for easy die setting and loading",
      "Heavy flywheel and gear drive",
      "Large working table with T-slots",
      "Tonnage made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Bou body / C-frame mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Teal with yellow pulley"
      ]
    ],
    "featured": false
  },
  {
    "slug": "bou-body-power-press-sky-blue",
    "name": "Bou Body Power Press — Sky Blue",
    "nameBn": "বউ বডি পাওয়ার প্রেস — আকাশি",
    "category": "power-press",
    "subcategory": "bou-body",
    "condition": "new",
    "price": 0,
    "image": "/products/bou-body-power-press-sky-blue.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Bou body (C-frame) mechanical power press with an open front — easy loading for punching, cutting and pressing small and medium parts.",
    "highlights": [
      "Open-front C-frame for easy die setting and loading",
      "Heavy flywheel and gear drive",
      "Large working table with T-slots",
      "Tonnage made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Bou body / C-frame mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Sky blue"
      ]
    ],
    "featured": false
  },
  {
    "slug": "bou-body-power-press-blue",
    "name": "Bou Body Power Press — Blue",
    "nameBn": "বউ বডি পাওয়ার প্রেস — নীল",
    "category": "power-press",
    "subcategory": "bou-body",
    "condition": "new",
    "price": 0,
    "image": "/products/bou-body-power-press-blue.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Bou body (C-frame) mechanical power press with an open front — easy loading for punching, cutting and pressing small and medium parts.",
    "highlights": [
      "Open-front C-frame for easy die setting and loading",
      "Heavy flywheel and gear drive",
      "Large working table with T-slots",
      "Tonnage made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Bou body / C-frame mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Blue"
      ]
    ],
    "featured": false
  },
  {
    "slug": "bou-body-power-press-light-green",
    "name": "Bou Body Power Press — Light Green",
    "nameBn": "বউ বডি পাওয়ার প্রেস — হালকা সবুজ",
    "category": "power-press",
    "subcategory": "bou-body",
    "condition": "new",
    "price": 0,
    "image": "/products/bou-body-power-press-light-green.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Bou body (C-frame) mechanical power press with an open front — easy loading for punching, cutting and pressing small and medium parts.",
    "highlights": [
      "Open-front C-frame for easy die setting and loading",
      "Heavy flywheel and gear drive",
      "Large working table with T-slots",
      "Tonnage made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Bou body / C-frame mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Light green"
      ]
    ],
    "featured": false
  },
  {
    "slug": "bou-body-power-press-green-wheel",
    "name": "Bou Body Power Press — Green",
    "nameBn": "বউ বডি পাওয়ার প্রেস — সবুজ",
    "category": "power-press",
    "subcategory": "bou-body",
    "condition": "new",
    "price": 0,
    "image": "/products/bou-body-power-press-green-wheel.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Bou body (C-frame) mechanical power press with an open front — easy loading for punching, cutting and pressing small and medium parts.",
    "highlights": [
      "Open-front C-frame for easy die setting and loading",
      "Heavy flywheel and gear drive",
      "Large working table with T-slots",
      "Tonnage made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Bou body / C-frame mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Green with black flywheel"
      ]
    ],
    "featured": false
  },
  {
    "slug": "bou-body-power-press-big-gear",
    "name": "Bou Body Power Press — Big Gear",
    "nameBn": "বউ বডি পাওয়ার প্রেস — বড় গিয়ার",
    "category": "power-press",
    "subcategory": "bou-body",
    "condition": "new",
    "price": 0,
    "image": "/products/bou-body-power-press-big-gear.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Bou body (C-frame) mechanical power press with an open front — easy loading for punching, cutting and pressing small and medium parts.",
    "highlights": [
      "Open-front C-frame for easy die setting and loading",
      "Heavy flywheel and gear drive",
      "Large working table with T-slots",
      "Tonnage made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Bou body / C-frame mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Green with red parts"
      ]
    ],
    "featured": false
  },
  {
    "slug": "bou-body-power-press-olive",
    "name": "Bou Body Power Press — Olive",
    "nameBn": "বউ বডি পাওয়ার প্রেস — জলপাই",
    "category": "power-press",
    "subcategory": "bou-body",
    "condition": "new",
    "price": 0,
    "image": "/products/bou-body-power-press-olive.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Bou body (C-frame) mechanical power press with an open front — easy loading for punching, cutting and pressing small and medium parts.",
    "highlights": [
      "Open-front C-frame for easy die setting and loading",
      "Heavy flywheel and gear drive",
      "Large working table with T-slots",
      "Tonnage made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Bou body / C-frame mechanical power press"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Olive green"
      ]
    ],
    "featured": false
  },
  {
    "slug": "double-gear-bou-body-power-press",
    "name": "Double Gear Bou Body Power Press",
    "nameBn": "ডাবল গিয়ার বউ বডি পাওয়ার প্রেস",
    "category": "power-press",
    "subcategory": "bou-body",
    "condition": "new",
    "price": 0,
    "image": "/products/double-gear-bou-body-power-press.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Double gear bou body (C-frame) power press — two gear stages for extra pressing force on heavier punching and forming jobs.",
    "highlights": [
      "Open-front C-frame for easy die setting and loading",
      "Heavy flywheel and gear drive",
      "Large working table with T-slots",
      "Tonnage made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Bou body / C-frame mechanical power press"
      ],
      [
        "Drive",
        "Motor, flywheel and double gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Grey-blue with orange gears"
      ]
    ],
    "featured": true
  },
  {
    "slug": "double-gear-bou-body-power-press-green",
    "name": "Double Gear Bou Body Power Press — Green",
    "nameBn": "ডাবল গিয়ার বউ বডি পাওয়ার প্রেস — সবুজ",
    "category": "power-press",
    "subcategory": "bou-body",
    "condition": "new",
    "price": 0,
    "image": "/products/double-gear-bou-body-power-press-green.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Double gear bou body (C-frame) power press — two gear stages for extra pressing force on heavier punching and forming jobs.",
    "highlights": [
      "Open-front C-frame for easy die setting and loading",
      "Heavy flywheel and gear drive",
      "Large working table with T-slots",
      "Tonnage made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Bou body / C-frame mechanical power press"
      ],
      [
        "Drive",
        "Motor, flywheel and double gear"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Green"
      ]
    ],
    "featured": false
  },
  {
    "slug": "hydraulic-h-frame-press",
    "name": "Hydraulic Power Press — H-Frame",
    "nameBn": "হাইড্রোলিক পাওয়ার প্রেস — এইচ ফ্রেম",
    "category": "power-press",
    "subcategory": "hydraulic",
    "condition": "new",
    "price": 0,
    "image": "/products/hydraulic-h-frame-press.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "H-frame hydraulic power press with its own power pack and pressure gauge — smooth, controlled force for pressing, bending and forming.",
    "highlights": [
      "Rigid H-frame with hydraulic cylinder",
      "Hydraulic power pack with pressure gauge",
      "Smooth, adjustable pressing force",
      "Tonnage made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "H-frame hydraulic press"
      ],
      [
        "Drive",
        "Electric motor and hydraulic power pack"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Teal green"
      ]
    ],
    "featured": true
  },
  {
    "slug": "hydraulic-c-frame-press",
    "name": "Hydraulic C-Frame Press",
    "nameBn": "হাইড্রোলিক সি-ফ্রেম প্রেস",
    "category": "power-press",
    "subcategory": "hydraulic",
    "condition": "new",
    "price": 0,
    "image": "/products/hydraulic-c-frame-press.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Open-front C-frame hydraulic press — easy access from three sides for punching, pressing and assembly work.",
    "highlights": [
      "Open-front C-frame body",
      "Hydraulic cylinder with pressure lines",
      "Quiet, smooth operation",
      "Tonnage made to your order",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "C-frame hydraulic press"
      ],
      [
        "Drive",
        "Hydraulic power pack"
      ],
      [
        "Capacity",
        "Made to order (tonnage as you need)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Teal"
      ]
    ],
    "featured": false
  },
  {
    "slug": "mechanical-shearing-machine",
    "name": "Mechanical Sheet Shearing Machine",
    "nameBn": "মেকানিক্যাল শিট শেয়ারিং মেশিন",
    "category": "workshop",
    "subcategory": "shearing",
    "condition": "new",
    "price": 0,
    "image": "/products/mechanical-shearing-machine.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Flywheel-driven mechanical shearing machine for straight cutting of MS and GI sheet.",
    "highlights": [
      "Straight, clean sheet cutting",
      "Heavy flywheel drive",
      "Hold-down clamps for steady cuts",
      "Size made to your order"
    ],
    "specs": [
      [
        "Type",
        "Mechanical sheet shearing machine"
      ],
      [
        "Drive",
        "Motor and flywheel"
      ],
      [
        "Cutting length",
        "As per order"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Green with orange blade guard"
      ]
    ],
    "featured": false
  },
  {
    "slug": "pillar-drill-machine",
    "name": "Pillar Drill Machine",
    "nameBn": "পিলার ড্রিল মেশিন",
    "category": "workshop",
    "subcategory": "drill",
    "condition": "new",
    "price": 0,
    "image": "/products/pillar-drill-machine.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy pillar drill machine for drilling holes in steel parts, brackets and stands — used daily in our own workshop.",
    "highlights": [
      "Rigid pillar and base",
      "Adjustable work table",
      "Belt-driven spindle with speed steps",
      "Ideal for brackets and fabrication work"
    ],
    "specs": [
      [
        "Type",
        "Pillar drill machine"
      ],
      [
        "Drive",
        "Electric motor, belt"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ]
    ],
    "featured": false
  },
  {
    "slug": "dmg-ac-outdoor-stand",
    "name": "DMG AC Outdoor Unit Stand (Wall Bracket)",
    "nameBn": "ডিএমজি এসি আউটডোর স্ট্যান্ড (ওয়াল ব্র্যাকেট)",
    "category": "ac-stand",
    "subcategory": "wall-stand",
    "condition": "new",
    "price": 0,
    "image": "/products/dmg-ac-outdoor-stand.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Pair of strong DMG wall brackets for the outdoor unit (ODU) of split ACs — supplied with rawal bolts, nuts and washers.",
    "highlights": [
      "Universal — fits split AC outdoor units of all major brands",
      "Thick steel with powder coating",
      "Comes with rawal bolts, nuts and washers",
      "DMG embossed, made in our factory",
      "Retail and wholesale; also sold by KG"
    ],
    "specs": [
      [
        "Type",
        "Wall-mount AC outdoor unit stand (pair)"
      ],
      [
        "Material",
        "Steel, powder coated"
      ],
      [
        "In the pack",
        "2 brackets, rawal bolts, nuts, washers"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Off-white"
      ]
    ],
    "featured": true
  },
  {
    "slug": "dmg-ac-stand-box-pack",
    "name": "DMG AC Stand — Universal Box Pack",
    "nameBn": "ডিএমজি এসি স্ট্যান্ড — ইউনিভার্সাল বক্স প্যাক",
    "category": "ac-stand",
    "subcategory": "wall-stand",
    "condition": "new",
    "price": 0,
    "image": "/products/dmg-ac-stand-box-pack.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "DMG universal AC outdoor stand in its retail box — a full set with rawal bolts, nuts and washers, ready for the shop shelf.",
    "highlights": [
      "Retail box with full fitting kit",
      "Universal fit for split AC outdoor units",
      "Good for dealers and AC installers",
      "Wholesale prices for bulk orders"
    ],
    "specs": [
      [
        "Type",
        "AC outdoor unit stand, boxed set"
      ],
      [
        "In the box",
        "2 brackets, rawal bolts, nuts, washers"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ]
    ],
    "featured": false
  },
  {
    "slug": "ac-floor-stand",
    "name": "AC Floor Stand (Ground Stand)",
    "nameBn": "এসি ফ্লোর স্ট্যান্ড (গ্রাউন্ড স্ট্যান্ড)",
    "category": "ac-stand",
    "subcategory": "floor-stand",
    "condition": "new",
    "price": 0,
    "image": "/products/ac-floor-stand.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Pair of U-shaped floor stands that keep the AC outdoor unit off the roof or ground — with rubber pads and fixing bolts.",
    "highlights": [
      "For roof-top or ground installation",
      "Rubber pads reduce vibration",
      "Rust-resistant powder coating",
      "Fixing bolts included"
    ],
    "specs": [
      [
        "Type",
        "Floor / ground stand for AC outdoor unit (pair)"
      ],
      [
        "Material",
        "Steel, powder coated"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Off-white"
      ]
    ],
    "featured": false
  },
  {
    "slug": "heavy-duty-ac-stand-red",
    "name": "Heavy Duty AC Stand — Red Oxide",
    "nameBn": "হেভি ডিউটি এসি স্ট্যান্ড — রেড অক্সাইড",
    "category": "ac-stand",
    "subcategory": "wall-stand",
    "condition": "new",
    "price": 0,
    "image": "/products/heavy-duty-ac-stand-red.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy duty welded AC stand with red oxide primer — for big outdoor units and commercial AC installations.",
    "highlights": [
      "Welded heavy angle frame",
      "Red oxide anti-rust primer",
      "For large and commercial AC units",
      "Size made to order"
    ],
    "specs": [
      [
        "Type",
        "Heavy duty welded AC stand"
      ],
      [
        "Finish",
        "Red oxide primer"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Red oxide"
      ]
    ],
    "featured": false
  },
  {
    "slug": "ac-stand-bulk-by-kg",
    "name": "AC Stand — Bulk (Sold by KG)",
    "nameBn": "এসি স্ট্যান্ড — পাইকারি (কেজি হিসেবে)",
    "category": "ac-stand",
    "subcategory": "bulk",
    "condition": "new",
    "price": 0,
    "image": "/products/ac-stand-bulk-by-kg.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Galvanized AC stand brackets in bulk, sold by weight (KG) — for dealers, AC shops and installers.",
    "highlights": [
      "Sold by KG at wholesale price",
      "Galvanized steel brackets",
      "Ready stock in our factory",
      "Delivery all over Bangladesh"
    ],
    "specs": [
      [
        "Type",
        "AC stand brackets, bulk"
      ],
      [
        "Sold by",
        "Weight (KG)"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ],
      [
        "Colour",
        "Galvanized"
      ]
    ],
    "featured": false
  },
  {
    "slug": "rawal-anchor-bolt",
    "name": "Rawal Bolt (Anchor Bolt) for AC Stand",
    "nameBn": "রাওয়াল বোল্ট (অ্যাঙ্কর বোল্ট)",
    "category": "hardware",
    "subcategory": "bolts",
    "condition": "new",
    "price": 0,
    "image": "/products/rawal-anchor-bolt.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Expansion rawal (anchor) bolts with nut and washer for fixing AC stands and brackets to brick or concrete walls.",
    "highlights": [
      "Expansion sleeve grips brick and concrete",
      "With nut and washer",
      "Sold per piece or in bulk"
    ],
    "specs": [
      [
        "Type",
        "Expansion anchor (rawal) bolt"
      ],
      [
        "Use",
        "Fixing AC stands and brackets to walls"
      ]
    ],
    "featured": false
  }
];
