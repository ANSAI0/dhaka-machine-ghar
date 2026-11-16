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
    "price": 270000,
    "image": "/products/channel-body-power-press-teal-yellow.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy channel body (H-frame) mechanical power press, built in our own factory — for punching, blanking, bending and forming sheet metal. Weight 1,500 kg, price ৳180 per kg.",
    "highlights": [
      "Price ৳180 per kg — weight 1,500 kg",
      "Strong two-pillar channel body frame",
      "Heavy flywheel with gear drive",
      "Adjustable stroke and ram for different dies",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Weight",
        "1,500 kg"
      ],
      [
        "Price rate",
        "৳180 per kg"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
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
    "price": 108000,
    "image": "/products/channel-body-power-press-sky-blue.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy channel body (H-frame) mechanical power press, built in our own factory — for punching, blanking, bending and forming sheet metal. Weight 600 kg, price ৳180 per kg.",
    "highlights": [
      "Price ৳180 per kg — weight 600 kg",
      "Strong two-pillar channel body frame",
      "Heavy flywheel with gear drive",
      "Adjustable stroke and ram for different dies",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Weight",
        "600 kg"
      ],
      [
        "Price rate",
        "৳180 per kg"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
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
    "price": 180000,
    "image": "/products/channel-body-power-press-green.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy channel body (H-frame) mechanical power press, built in our own factory — for punching, blanking, bending and forming sheet metal. Weight 1,000 kg, price ৳180 per kg.",
    "highlights": [
      "Price ৳180 per kg — weight 1,000 kg",
      "Strong two-pillar channel body frame",
      "Heavy flywheel with gear drive",
      "Adjustable stroke and ram for different dies",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Weight",
        "1,000 kg"
      ],
      [
        "Price rate",
        "৳180 per kg"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
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
    "price": 90000,
    "image": "/products/channel-body-power-press-teal-orange.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy channel body (H-frame) mechanical power press, built in our own factory — for punching, blanking, bending and forming sheet metal. Weight 500 kg, price ৳180 per kg.",
    "highlights": [
      "Price ৳180 per kg — weight 500 kg",
      "Strong two-pillar channel body frame",
      "Heavy flywheel with gear drive",
      "Adjustable stroke and ram for different dies",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Weight",
        "500 kg"
      ],
      [
        "Price rate",
        "৳180 per kg"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
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
    "price": 126000,
    "image": "/products/channel-body-power-press-bright-green.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy channel body (H-frame) mechanical power press, built in our own factory — for punching, blanking, bending and forming sheet metal. Weight 700 kg, price ৳180 per kg.",
    "highlights": [
      "Price ৳180 per kg — weight 700 kg",
      "Strong two-pillar channel body frame",
      "Heavy flywheel with gear drive",
      "Adjustable stroke and ram for different dies",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Weight",
        "700 kg"
      ],
      [
        "Price rate",
        "৳180 per kg"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
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
    "price": 90000,
    "image": "/products/channel-body-power-press-blue.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy channel body (H-frame) mechanical power press, built in our own factory — for punching, blanking, bending and forming sheet metal. Weight 500 kg, price ৳180 per kg.",
    "highlights": [
      "Price ৳180 per kg — weight 500 kg",
      "Strong two-pillar channel body frame",
      "Heavy flywheel with gear drive",
      "Adjustable stroke and ram for different dies",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Weight",
        "500 kg"
      ],
      [
        "Price rate",
        "৳180 per kg"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
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
    "price": 108000,
    "image": "/products/channel-body-power-press-steel-blue.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy channel body (H-frame) mechanical power press, built in our own factory — for punching, blanking, bending and forming sheet metal. Weight 600 kg, price ৳180 per kg.",
    "highlights": [
      "Price ৳180 per kg — weight 600 kg",
      "Strong two-pillar channel body frame",
      "Heavy flywheel with gear drive",
      "Adjustable stroke and ram for different dies",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Weight",
        "600 kg"
      ],
      [
        "Price rate",
        "৳180 per kg"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
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
    "price": 108000,
    "image": "/products/channel-body-power-press-motor-top-teal.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Channel body power press with the motor mounted on top and double gear drive — compact, heavy-duty and ready for continuous production work. Weight 600 kg, price ৳180 per kg.",
    "highlights": [
      "Price ৳180 per kg — weight 600 kg",
      "Top-mounted motor saves floor space",
      "Double gear drive for higher pressing force",
      "Strong two-pillar channel body frame",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Weight",
        "600 kg"
      ],
      [
        "Price rate",
        "৳180 per kg"
      ],
      [
        "Drive",
        "Top-mounted motor, double gear and flywheel"
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
    "price": 108000,
    "image": "/products/channel-body-power-press-motor-top-blue.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Channel body power press with the motor mounted on top and double gear drive — compact, heavy-duty and ready for continuous production work. Weight 600 kg, price ৳180 per kg.",
    "highlights": [
      "Price ৳180 per kg — weight 600 kg",
      "Top-mounted motor saves floor space",
      "Double gear drive for higher pressing force",
      "Strong two-pillar channel body frame",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Weight",
        "600 kg"
      ],
      [
        "Price rate",
        "৳180 per kg"
      ],
      [
        "Drive",
        "Top-mounted motor, double gear and flywheel"
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
    "name": "Channel Body Power Press — Grey & Orange",
    "nameBn": "চ্যানেল বডি পাওয়ার প্রেস — ধূসর ও কমলা",
    "category": "power-press",
    "subcategory": "channel-body",
    "condition": "new",
    "price": 108000,
    "image": "/products/bou-body-power-press-grey-orange.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Bou body (C-frame) mechanical power press with an open front — easy loading for punching, cutting and pressing small and medium parts. Weight 600 kg, price ৳180 per kg.",
    "highlights": [
      "Price ৳180 per kg — weight 600 kg",
      "Open-front C-frame for easy die setting and loading",
      "Heavy flywheel and gear drive",
      "Large working table with T-slots",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Bou body / C-frame mechanical power press"
      ],
      [
        "Weight",
        "600 kg"
      ],
      [
        "Price rate",
        "৳180 per kg"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
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
    "name": "Channel Body Power Press — Light Green, Motor Top",
    "nameBn": "চ্যানেল বডি পাওয়ার প্রেস — হালকা সবুজ, উপরে মোটর",
    "category": "power-press",
    "subcategory": "channel-body",
    "condition": "new",
    "price": 108000,
    "image": "/products/bou-body-power-press-light-green.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Bou body (C-frame) mechanical power press with an open front — easy loading for punching, cutting and pressing small and medium parts. Weight 600 kg, price ৳180 per kg.",
    "highlights": [
      "Price ৳180 per kg — weight 600 kg",
      "Open-front C-frame for easy die setting and loading",
      "Heavy flywheel and gear drive",
      "Large working table with T-slots",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Bou body / C-frame mechanical power press"
      ],
      [
        "Weight",
        "600 kg"
      ],
      [
        "Price rate",
        "৳180 per kg"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
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
    "price": 234000,
    "image": "/products/bou-body-power-press-green-wheel.webp",
    "brand": "DMG",
    "capacity": "35 Ton",
    "voltage": "",
    "short": "Bou body (C-frame) mechanical power press with an open front — easy loading for punching, cutting and pressing small and medium parts. Weight 1,300 kg, price ৳180 per kg.",
    "highlights": [
      "Price ৳180 per kg — weight 1,300 kg",
      "Capacity: 35 Ton",
      "Open-front C-frame for easy die setting and loading",
      "Heavy flywheel and gear drive",
      "Large working table with T-slots",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Bou body / C-frame mechanical power press"
      ],
      [
        "Weight",
        "1,300 kg"
      ],
      [
        "Price rate",
        "৳180 per kg"
      ],
      [
        "Capacity",
        "35 Ton"
      ],
      [
        "Drive",
        "Electric motor, belt, flywheel and gear"
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
    "price": 230000,
    "image": "/products/hydraulic-h-frame-press.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "H-frame hydraulic power press with its own power pack and pressure gauge — smooth, controlled force for pressing, bending and forming. Weight 1,000 kg, price ৳230 per kg.",
    "highlights": [
      "Price ৳230 per kg — weight 1,000 kg",
      "Rigid H-frame with hydraulic cylinder",
      "Hydraulic power pack with pressure gauge",
      "Smooth, adjustable pressing force",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "H-frame hydraulic press"
      ],
      [
        "Weight",
        "1,000 kg"
      ],
      [
        "Price rate",
        "৳230 per kg"
      ],
      [
        "Drive",
        "Electric motor and hydraulic power pack"
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
    "slug": "channel-body-power-press-15-ton-teal-orange",
    "name": "Channel Body Power Press — 15 Ton, Teal & Orange",
    "nameBn": "চ্যানেল বডি পাওয়ার প্রেস — ১৫ টন, টিল ও কমলা",
    "category": "power-press",
    "subcategory": "channel-body",
    "condition": "new",
    "price": 90000,
    "image": "/products/channel-body-power-press-15-ton-teal-orange.webp",
    "brand": "DMG",
    "capacity": "15 Ton",
    "voltage": "",
    "short": "15-ton channel body power press in teal with orange fittings. Weight 500 kg, price ৳180 per kg.",
    "highlights": [
      "Price ৳180 per kg — weight 500 kg",
      "Capacity: 15 Ton",
      "Rigid channel-body (H-frame) steel structure",
      "Flywheel and gear drive with foot-pedal clutch",
      "Made in DMG's own factory, Keraniganj",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Weight",
        "500 kg"
      ],
      [
        "Price rate",
        "৳180 per kg"
      ],
      [
        "Capacity",
        "15 Ton"
      ],
      [
        "Colour",
        "Teal with orange"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ]
    ],
    "featured": false
  },
  {
    "slug": "channel-body-power-press-green-red-700kg",
    "name": "Channel Body Power Press — Green & Red, 700 kg",
    "nameBn": "চ্যানেল বডি পাওয়ার প্রেস — সবুজ ও লাল, ৭০০ কেজি",
    "category": "power-press",
    "subcategory": "channel-body",
    "condition": "new",
    "price": 126000,
    "image": "/products/channel-body-power-press-green-red-700kg.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Channel body power press in bright green with red fittings and a steel ram guide. Weight 700 kg, price ৳180 per kg.",
    "highlights": [
      "Price ৳180 per kg — weight 700 kg",
      "Rigid channel-body (H-frame) steel structure",
      "Flywheel and gear drive with foot-pedal clutch",
      "Made in DMG's own factory, Keraniganj",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Weight",
        "700 kg"
      ],
      [
        "Price rate",
        "৳180 per kg"
      ],
      [
        "Colour",
        "Green with red"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ]
    ],
    "featured": false
  },
  {
    "slug": "channel-body-power-press-teal-orange-pair",
    "name": "Channel Body Power Press — Teal & Orange, 500 kg",
    "nameBn": "চ্যানেল বডি পাওয়ার প্রেস — টিল ও কমলা, ৫০০ কেজি",
    "category": "power-press",
    "subcategory": "channel-body",
    "condition": "new",
    "price": 90000,
    "image": "/products/channel-body-power-press-teal-orange-pair.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Compact channel body power press in teal with orange fittings (photo shows two units). Weight 500 kg, price ৳180 per kg.",
    "highlights": [
      "Price ৳180 per kg — weight 500 kg",
      "Rigid channel-body (H-frame) steel structure",
      "Flywheel and gear drive with foot-pedal clutch",
      "Made in DMG's own factory, Keraniganj",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Weight",
        "500 kg"
      ],
      [
        "Price rate",
        "৳180 per kg"
      ],
      [
        "Colour",
        "Teal with orange"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ]
    ],
    "featured": false
  },
  {
    "slug": "channel-body-power-press-1200kg",
    "name": "Heavy Channel Body Power Press — 1200 kg",
    "nameBn": "হেভি চ্যানেল বডি পাওয়ার প্রেস — ১২০০ কেজি",
    "category": "power-press",
    "subcategory": "channel-body",
    "condition": "new",
    "price": 216000,
    "image": "/products/channel-body-power-press-1200kg.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy channel body power press with a large gear wheel (photo shows it before painting). Weight 1,200 kg, price ৳180 per kg.",
    "highlights": [
      "Price ৳180 per kg — weight 1,200 kg",
      "Rigid channel-body (H-frame) steel structure",
      "Flywheel and gear drive with foot-pedal clutch",
      "Made in DMG's own factory, Keraniganj",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Weight",
        "1,200 kg"
      ],
      [
        "Price rate",
        "৳180 per kg"
      ],
      [
        "Colour",
        "Painted to your choice"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ]
    ],
    "featured": false
  },
  {
    "slug": "channel-body-power-press-dark-green-1000kg",
    "name": "Channel Body Power Press — Dark Green, 1000 kg",
    "nameBn": "চ্যানেল বডি পাওয়ার প্রেস — গাঢ় সবুজ, ১০০০ কেজি",
    "category": "power-press",
    "subcategory": "channel-body",
    "condition": "new",
    "price": 180000,
    "image": "/products/channel-body-power-press-dark-green-1000kg.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Channel body power press in dark green with red fittings, double flywheel and gear. Weight 1,000 kg, price ৳180 per kg.",
    "highlights": [
      "Price ৳180 per kg — weight 1,000 kg",
      "Rigid channel-body (H-frame) steel structure",
      "Flywheel and gear drive with foot-pedal clutch",
      "Made in DMG's own factory, Keraniganj",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Channel body (H-frame) mechanical power press"
      ],
      [
        "Weight",
        "1,000 kg"
      ],
      [
        "Price rate",
        "৳180 per kg"
      ],
      [
        "Colour",
        "Dark green with red"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ]
    ],
    "featured": false
  },
  {
    "slug": "hydraulic-press-safety-guard-800kg",
    "name": "Hydraulic Press with Safety Guard — 800 kg",
    "nameBn": "সেফটি গার্ড সহ হাইড্রোলিক প্রেস — ৮০০ কেজি",
    "category": "power-press",
    "subcategory": "hydraulic",
    "condition": "new",
    "price": 144000,
    "image": "/products/hydraulic-press-safety-guard-800kg.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Hydraulic press with mesh safety guards on both sides, for pressing and forming. Weight 800 kg, price ৳180 per kg.",
    "highlights": [
      "Price ৳180 per kg — weight 800 kg",
      "Hydraulic cylinder for smooth, controlled force",
      "Strong welded steel frame",
      "Made in DMG's own factory, Keraniganj",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Hydraulic press"
      ],
      [
        "Weight",
        "800 kg"
      ],
      [
        "Price rate",
        "৳180 per kg"
      ],
      [
        "Colour",
        "Teal"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ]
    ],
    "featured": false
  },
  {
    "slug": "hydraulic-forging-press-1500kg",
    "name": "Multi-Cylinder Hydraulic Press — 1500 kg",
    "nameBn": "মাল্টি-সিলিন্ডার হাইড্রোলিক প্রেস — ১৫০০ কেজি",
    "category": "power-press",
    "subcategory": "hydraulic",
    "condition": "new",
    "price": 345000,
    "image": "/products/hydraulic-forging-press-1500kg.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy multi-cylinder hydraulic press for forming work such as leaf springs. Weight 1,500 kg, price ৳230 per kg.",
    "highlights": [
      "Price ৳230 per kg — weight 1,500 kg",
      "Hydraulic cylinder for smooth, controlled force",
      "Strong welded steel frame",
      "Made in DMG's own factory, Keraniganj",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Hydraulic press"
      ],
      [
        "Weight",
        "1,500 kg"
      ],
      [
        "Price rate",
        "৳230 per kg"
      ],
      [
        "Colour",
        "Blue"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ]
    ],
    "featured": false
  },
  {
    "slug": "hydraulic-h-frame-press-800kg",
    "name": "Hydraulic H-Frame Press — 800 kg",
    "nameBn": "হাইড্রোলিক এইচ-ফ্রেম প্রেস — ৮০০ কেজি",
    "category": "power-press",
    "subcategory": "hydraulic",
    "condition": "new",
    "price": 184000,
    "image": "/products/hydraulic-h-frame-press-800kg.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "H-frame hydraulic press with a big cylinder (photo shows it before painting). Weight 800 kg, price ৳230 per kg.",
    "highlights": [
      "Price ৳230 per kg — weight 800 kg",
      "Hydraulic cylinder for smooth, controlled force",
      "Strong welded steel frame",
      "Made in DMG's own factory, Keraniganj",
      "Warranty and after-sales service from DMG"
    ],
    "specs": [
      [
        "Type",
        "Hydraulic press"
      ],
      [
        "Weight",
        "800 kg"
      ],
      [
        "Price rate",
        "৳230 per kg"
      ],
      [
        "Colour",
        "Painted to your choice"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
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
    "name": "Powder Coated Angle AC Stand — 3 mm, 40 inch",
    "nameBn": "পাউডার কোটিং এঙ্গেল এসি স্ট্যান্ড — ৩ মিমি, ৪০ ইঞ্চি",
    "category": "ac-stand",
    "subcategory": "wall-stand",
    "condition": "new",
    "price": 700,
    "image": "/products/dmg-ac-outdoor-stand.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Heavy 3 mm angle-iron AC outdoor stand with powder coating — 40 inch long, L-arm 12 or 20 inch, free size. ৳700 per set.",
    "highlights": [
      "Price ৳700 per set",
      "3 mm thick angle iron",
      "Length 40 inch; L-arm 12 inch or 20 inch",
      "Free size — fits most outdoor units",
      "Powder coated, DMG embossed"
    ],
    "specs": [
      [
        "Material",
        "3 mm angle iron, powder coated"
      ],
      [
        "Length",
        "40 inch"
      ],
      [
        "L-arm",
        "12 inch or 20 inch"
      ],
      [
        "Size",
        "Free size"
      ],
      [
        "Price",
        "৳700 per set"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ]
    ],
    "featured": true
  },
  {
    "slug": "dmg-ac-stand-box-pack",
    "name": "China AC Stand Set — with Join Nut & Royal Bolt",
    "nameBn": "চায়না এসি স্ট্যান্ড সেট — জয়েন নাট ও রয়েল বোল্ট সহ",
    "category": "ac-stand",
    "subcategory": "wall-stand",
    "condition": "new",
    "price": 500,
    "image": "/products/dmg-ac-stand-box-pack.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Ready-to-fit AC outdoor unit wall stand set, supplied with join nuts and royal (rawal) bolts — ৳500 per set.",
    "highlights": [
      "Price ৳500 per set",
      "Join nuts and royal bolts included",
      "Fits split AC outdoor units of all major brands",
      "Packed in DMG box",
      "Retail and wholesale"
    ],
    "specs": [
      [
        "Type",
        "Wall-mount AC outdoor unit stand (pair)"
      ],
      [
        "In the set",
        "2 stands, join nuts, royal bolts"
      ],
      [
        "Price",
        "৳500 per set"
      ],
      [
        "Packing",
        "DMG universal box"
      ]
    ],
    "featured": false
  },
  {
    "slug": "ac-floor-stand",
    "name": "Roof Chowki AC Stand (Chader Chouki)",
    "nameBn": "ছাদের চৌকি এসি স্ট্যান্ড",
    "category": "ac-stand",
    "subcategory": "floor-stand",
    "condition": "new",
    "price": 320,
    "image": "/products/ac-floor-stand.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Roof-top chowki stand that keeps the AC outdoor unit off the roof floor — ৳320 per set; powder coated ৳400 per set.",
    "highlights": [
      "Plain: ৳320 per set",
      "Powder coated: ৳400 per set",
      "Keeps the outdoor unit off the roof floor",
      "Strong steel, for roof or ground",
      "Retail and wholesale"
    ],
    "specs": [
      [
        "Type",
        "Roof / floor chowki stand for AC outdoor unit (pair)"
      ],
      [
        "Plain",
        "৳320 per set"
      ],
      [
        "Powder coated",
        "৳400 per set"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ]
    ],
    "featured": false
  },
  {
    "slug": "heavy-duty-ac-stand-red",
    "name": "Red & Black AC Stand (No Powder Coating)",
    "nameBn": "রেড ও ব্ল্যাক এসি স্ট্যান্ড (পাউডার কোটিং ছাড়া)",
    "category": "ac-stand",
    "subcategory": "wall-stand",
    "condition": "new",
    "price": 600,
    "image": "/products/heavy-duty-ac-stand-red.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Strong AC outdoor unit wall stand in red or black paint, without powder coating — ৳600 per set.",
    "highlights": [
      "Price ৳600 per set",
      "Red or black paint finish",
      "No powder coating — lower price",
      "Strong welded steel",
      "Retail and wholesale"
    ],
    "specs": [
      [
        "Type",
        "Wall-mount AC outdoor unit stand (pair)"
      ],
      [
        "Finish",
        "Red or black paint (no powder coating)"
      ],
      [
        "Price",
        "৳600 per set"
      ],
      [
        "Made in",
        "DMG own factory, Keraniganj, Dhaka"
      ]
    ],
    "featured": false
  },
  {
    "slug": "rawal-anchor-bolt",
    "name": "Royal Bolt (Rawal Anchor Bolt)",
    "nameBn": "রয়েল বোল্ট (রাওয়াল অ্যাঙ্কর বোল্ট)",
    "category": "hardware",
    "subcategory": "bolts",
    "condition": "new",
    "price": 11,
    "image": "/products/rawal-anchor-bolt.webp",
    "brand": "DMG",
    "capacity": "",
    "voltage": "",
    "short": "Anchor bolt for fixing AC stands to walls — Bangla chaki ৳11 per piece; imported chaki, blackened and tempered ৳13 per piece.",
    "highlights": [
      "Bangla chaki: ৳11 per piece",
      "Imported (bideshi) chaki, black and tempered: ৳13 per piece",
      "For fixing AC stands and brackets to walls",
      "Wholesale quantity available"
    ],
    "specs": [
      [
        "Type",
        "Expansion anchor (royal / rawal) bolt"
      ],
      [
        "Bangla chaki",
        "৳11 per piece"
      ],
      [
        "Imported chaki (black, tempered)",
        "৳13 per piece"
      ],
      [
        "Use",
        "Fixing AC stands and brackets to walls"
      ]
    ],
    "featured": false
  }
];
