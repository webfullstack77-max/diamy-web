// Catálogo Oficial Playerytees 2026 - Distribuidora Punto Textil
// Extraído de: CATÁLOGO PLAYERYTEES 2026.pdf, CARTA DE COLOR 2026.pdf y DPT PLAYERYTEES PRECIO PÚBLICO IVA.pdf
// Todos los precios incluyen el 16% de IVA (Vigencia Febrero 2026)

export interface CatalogColor {
  name: string;
  hex: string;
  isWhite?: boolean;
}

export interface SizePriceTier {
  menudeo: number; // 1 a 9 piezas
  mayoreo: number; // 10 piezas o más
}

export interface ModelPricing {
  standard: {
    white: SizePriceTier;
    colores: SizePriceTier;
  };
  plus2XL?: {
    white: SizePriceTier;
    colores: SizePriceTier;
  };
  plus3XL?: {
    white: SizePriceTier;
    colores: SizePriceTier;
  };
  plus4XL?: {
    white: SizePriceTier;
    colores: SizePriceTier;
  };
}

export type CatalogCategory = 'playeras' | 'polos' | 'ejecutivo' | 'outdoor';
export type CatalogGender = 'caballero' | 'dama' | 'kids' | 'unisex';

export interface PuntoTextilModel {
  id: string;
  styleCode: string;
  name: string;
  category: CatalogCategory;
  gender: CatalogGender;
  cutType: string;
  description: string;
  composition: string;
  weight: string;
  sizes: string[];
  boxPcs: string;
  colors: CatalogColor[];
  pricing: ModelPricing;
}

export const PUNTO_TEXTIL_CATEGORIES: { id: CatalogCategory; label: string; icon: string; count: number }[] = [
  { id: 'playeras', label: 'Playeras', icon: 'checkroom', count: 14 },
  { id: 'polos', label: 'Polos', icon: 'dry_cleaning', count: 14 },
  { id: 'ejecutivo', label: 'Ejecutivo / Camisas', icon: 'badge', count: 14 },
  { id: 'outdoor', label: 'Outdoor / Sudaderas', icon: 'snowboarding', count: 7 },
];

export const PUNTO_TEXTIL_SUPPLIER_INFO = {
  companyName: 'Distribuidora Punto Textil S.A. de C.V.',
  brand: 'Playerytees',
  website: 'puntotextil.com.mx',
  accounts: [
    {
      bank: 'BBVA Bancomer',
      company: 'Distribuidora Punto Textil S.A. de C.V.',
      account: '0199099832',
      clabe: '012650001990998326',
    },
    {
      bank: 'BBVA Bancomer (CIE)',
      company: 'Global Playerytees S.A. de C.V.',
      account: '0168771030',
      clabe: '012650001687710309',
      convenio: '1165224',
      referencia: '00067',
    },
    {
      bank: 'Santander',
      company: 'Global Playerytees S.A. de C.V.',
      account: '65503140806',
      clabe: '014650655031408064',
    },
  ],
};

export const PUNTO_TEXTIL_MODELS: PuntoTextilModel[] = [
  {
    "id": "410c",
    "styleCode": "410C",
    "name": "Playera Cuello Redondo Caballero",
    "category": "playeras",
    "gender": "caballero",
    "cutType": "Manga Corta - Tubular",
    "description": "Playera clásica cuello redondo para caballero, confección tubular, costuras reforzadas en hombros y cuello. Ideal para estampado DTF y serigrafía.",
    "composition": "100% Algodón (Sport Grey: 90% Algodón - 10% Poliéster)",
    "weight": "185 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "boxPcs": "S-XL: 72 pzas | 2XL-3XL: 60 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Natural",
        "hex": "#F5F2EB",
        "isWhite": false
      },
      {
        "name": "Canary Yellow",
        "hex": "#FFD700",
        "isWhite": false
      },
      {
        "name": "Dusty Pink",
        "hex": "#D87093",
        "isWhite": false
      },
      {
        "name": "Pink",
        "hex": "#E91E63",
        "isWhite": false
      },
      {
        "name": "Coral",
        "hex": "#FF6F61",
        "isWhite": false
      },
      {
        "name": "Orange",
        "hex": "#F57C00",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Maroon",
        "hex": "#800000",
        "isWhite": false
      },
      {
        "name": "Mocha",
        "hex": "#6F4E37",
        "isWhite": false
      },
      {
        "name": "Kelly Green",
        "hex": "#2E7D32",
        "isWhite": false
      },
      {
        "name": "Island Reef",
        "hex": "#B0BEC5",
        "isWhite": false
      },
      {
        "name": "Military Green",
        "hex": "#4B5320",
        "isWhite": false
      },
      {
        "name": "Pacific Blue",
        "hex": "#008080",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Sport Grey",
        "hex": "#9E9E9E",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "Desert Khaki",
        "hex": "#C3B091",
        "isWhite": false
      },
      {
        "name": "Fuchsia",
        "hex": "#C2185B",
        "isWhite": false
      },
      {
        "name": "Purple",
        "hex": "#7B1FA2",
        "isWhite": false
      },
      {
        "name": "Grey Ash",
        "hex": "#A0A0A0",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 52.4,
          "mayoreo": 43.79
        },
        "colores": {
          "menudeo": 62.28,
          "mayoreo": 52.13
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 63.3,
          "mayoreo": 52.99
        },
        "colores": {
          "menudeo": 76.58,
          "mayoreo": 64.19
        }
      },
      "plus3XL": {
        "white": {
          "menudeo": 70.05,
          "mayoreo": 58.68
        },
        "colores": {
          "menudeo": 85.48,
          "mayoreo": 71.69
        }
      }
    }
  },
  {
    "id": "410d",
    "styleCode": "410D",
    "name": "Playera Cuello Redondo Dama",
    "category": "playeras",
    "gender": "dama",
    "cutType": "Manga Corta - Silueteada",
    "description": "Playera cuello redondo con corte silueteado femenino y cerrado de costados. Gran suavidad y excelente acabado para DTF.",
    "composition": "100% Algodón (Sport Grey: 90% Algodón - 10% Poliéster)",
    "weight": "185 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "S-2XL: 72 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Natural",
        "hex": "#F5F2EB",
        "isWhite": false
      },
      {
        "name": "Dusty Pink",
        "hex": "#D87093",
        "isWhite": false
      },
      {
        "name": "Coral",
        "hex": "#FF6F61",
        "isWhite": false
      },
      {
        "name": "Orange",
        "hex": "#F57C00",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Maroon",
        "hex": "#800000",
        "isWhite": false
      },
      {
        "name": "Island Reef",
        "hex": "#B0BEC5",
        "isWhite": false
      },
      {
        "name": "Pacific Blue",
        "hex": "#008080",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Sport Grey",
        "hex": "#9E9E9E",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "Canary Yellow",
        "hex": "#FFD700",
        "isWhite": false
      },
      {
        "name": "Pink",
        "hex": "#E91E63",
        "isWhite": false
      },
      {
        "name": "Fuchsia",
        "hex": "#C2185B",
        "isWhite": false
      },
      {
        "name": "Purple",
        "hex": "#7B1FA2",
        "isWhite": false
      },
      {
        "name": "Kelly Green",
        "hex": "#2E7D32",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Mocha",
        "hex": "#6F4E37",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 52.4,
          "mayoreo": 43.79
        },
        "colores": {
          "menudeo": 62.28,
          "mayoreo": 52.13
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 63.3,
          "mayoreo": 52.99
        },
        "colores": {
          "menudeo": 76.58,
          "mayoreo": 64.19
        }
      }
    }
  },
  {
    "id": "410n",
    "styleCode": "410N",
    "name": "Playera Cuello Redondo Kids",
    "category": "playeras",
    "gender": "kids",
    "cutType": "Manga Corta - Infantil",
    "description": "Playera cuello redondo infantil/juvenil con refuerzo en hombros y suavidad para pieles sensibles.",
    "composition": "100% Algodón (Sport Grey: 90% Algodón - 10% Poliéster)",
    "weight": "185 g/m²",
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL"
    ],
    "boxPcs": "XS-XL: 96 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Canary Yellow",
        "hex": "#FFD700",
        "isWhite": false
      },
      {
        "name": "Pink",
        "hex": "#E91E63",
        "isWhite": false
      },
      {
        "name": "Fuchsia",
        "hex": "#C2185B",
        "isWhite": false
      },
      {
        "name": "Purple",
        "hex": "#7B1FA2",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Kelly Green",
        "hex": "#2E7D32",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Sport Grey",
        "hex": "#9E9E9E",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "Natural",
        "hex": "#F5F2EB",
        "isWhite": false
      },
      {
        "name": "Dusty Pink",
        "hex": "#D87093",
        "isWhite": false
      },
      {
        "name": "Coral",
        "hex": "#FF6F61",
        "isWhite": false
      },
      {
        "name": "Orange",
        "hex": "#F57C00",
        "isWhite": false
      },
      {
        "name": "Island Reef",
        "hex": "#B0BEC5",
        "isWhite": false
      },
      {
        "name": "Pacific Blue",
        "hex": "#008080",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 35.46,
          "mayoreo": 29.5
        },
        "colores": {
          "menudeo": 42.0,
          "mayoreo": 35.02
        }
      }
    }
  },
  {
    "id": "410uls",
    "styleCode": "410 ULS",
    "name": "Playera Cuello Redondo Manga Larga Unisex",
    "category": "playeras",
    "gender": "unisex",
    "cutType": "Manga Larga - Puño acanalado",
    "description": "Playera 100% algodón manga larga unisex con puños rib acanalados. Ideal para temporadas frescas y uniformes de protección solar/trabajo.",
    "composition": "100% Algodón (Colores Seguridad: 50% Algodón - 50% Poliéster)",
    "weight": "185 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "S-XL: 60 pzas | 2XL: 48 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Safety Green",
        "hex": "#B9F73E",
        "isWhite": false
      },
      {
        "name": "Safety Orange",
        "hex": "#FF6700",
        "isWhite": false
      },
      {
        "name": "Sport Grey",
        "hex": "#9E9E9E",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 71.57,
          "mayoreo": 64.21
        },
        "colores": {
          "menudeo": 88.88,
          "mayoreo": 79.84
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 87.56,
          "mayoreo": 78.65
        },
        "colores": {
          "menudeo": 106.71,
          "mayoreo": 95.96
        }
      }
    }
  },
  {
    "id": "4000c",
    "styleCode": "4000 C",
    "name": "Playera Sublimable Caballero",
    "category": "playeras",
    "gender": "caballero",
    "cutType": "Manga Corta - Sublimación",
    "description": "Playera 100% poliéster tacto algodón desarrollada especialmente para sublimación full color en alta definición.",
    "composition": "100% Poliéster Tacto Suave",
    "weight": "160 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "S-2XL: 80 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 79.91,
          "mayoreo": 67.93
        },
        "colores": {
          "menudeo": 79.91,
          "mayoreo": 67.93
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 91.9,
          "mayoreo": 78.18
        },
        "colores": {
          "menudeo": 91.9,
          "mayoreo": 78.18
        }
      }
    }
  },
  {
    "id": "4000d",
    "styleCode": "4000 D",
    "name": "Playera Sublimable Dama",
    "category": "playeras",
    "gender": "dama",
    "cutType": "Manga Corta - Sublimación Silueteada",
    "description": "Playera sublimable corte silueteado femenino tacto algodón, colores nítidos y sin encogimiento.",
    "composition": "100% Poliéster Tacto Suave",
    "weight": "160 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "S-2XL: 100 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 79.91,
          "mayoreo": 67.93
        },
        "colores": {
          "menudeo": 79.91,
          "mayoreo": 67.93
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 91.9,
          "mayoreo": 78.18
        },
        "colores": {
          "menudeo": 91.9,
          "mayoreo": 78.18
        }
      }
    }
  },
  {
    "id": "4000n",
    "styleCode": "4000 N",
    "name": "Playera Sublimable Kids",
    "category": "playeras",
    "gender": "kids",
    "cutType": "Manga Corta - Sublimación Infantil",
    "description": "Playera infantil para sublimación 100% poliéster tacto algodón.",
    "composition": "100% Poliéster",
    "weight": "160 g/m²",
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL"
    ],
    "boxPcs": "XS-XL: 140 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 53.39,
          "mayoreo": 45.25
        },
        "colores": {
          "menudeo": 53.39,
          "mayoreo": 45.25
        }
      }
    }
  },
  {
    "id": "950c",
    "styleCode": "950 C",
    "name": "Playera Deportiva Poliéster Caballero",
    "category": "playeras",
    "gender": "caballero",
    "cutType": "Manga Corta - Dry Fit",
    "description": "Playera deportiva de microfibra de poliéster de secado rápido, transpirable y ligera.",
    "composition": "100% Poliéster",
    "weight": "150 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "S-2XL: 60 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Fluor Yellow",
        "hex": "#E6FF00",
        "isWhite": false
      },
      {
        "name": "Fluor Lime",
        "hex": "#76FF03",
        "isWhite": false
      },
      {
        "name": "Irish Green",
        "hex": "#009B48",
        "isWhite": false
      },
      {
        "name": "Green MX",
        "hex": "#006847",
        "isWhite": false
      },
      {
        "name": "Electric Blue",
        "hex": "#0070BA",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Coral Red",
        "hex": "#E53935",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Fuchsia",
        "hex": "#C2185B",
        "isWhite": false
      },
      {
        "name": "Fluor Orange",
        "hex": "#FF5500",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "Laurel",
        "hex": "#798071",
        "isWhite": false
      },
      {
        "name": "Grey Blue",
        "hex": "#5C6F84",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 111.41,
          "mayoreo": 97.86
        },
        "colores": {
          "menudeo": 121.38,
          "mayoreo": 106.66
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 128.48,
          "mayoreo": 112.92
        },
        "colores": {
          "menudeo": 141.72,
          "mayoreo": 124.6
        }
      }
    }
  },
  {
    "id": "950d",
    "styleCode": "950 D",
    "name": "Playera Deportiva Poliéster Dama",
    "category": "playeras",
    "gender": "dama",
    "cutType": "Manga Corta - Dry Fit Silueteada",
    "description": "Playera deportiva de secado rápido silueteada para dama con cuello atlético.",
    "composition": "100% Poliéster",
    "weight": "150 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "S-2XL: 100 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Fluor Yellow",
        "hex": "#E6FF00",
        "isWhite": false
      },
      {
        "name": "Fluor Lime",
        "hex": "#76FF03",
        "isWhite": false
      },
      {
        "name": "Irish Green",
        "hex": "#009B48",
        "isWhite": false
      },
      {
        "name": "Green MX",
        "hex": "#006847",
        "isWhite": false
      },
      {
        "name": "Electric Blue",
        "hex": "#0070BA",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Coral Red",
        "hex": "#E53935",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Fuchsia",
        "hex": "#C2185B",
        "isWhite": false
      },
      {
        "name": "Fluor Orange",
        "hex": "#FF5500",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "Laurel",
        "hex": "#798071",
        "isWhite": false
      },
      {
        "name": "Grey Blue",
        "hex": "#5C6F84",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 111.41,
          "mayoreo": 97.86
        },
        "colores": {
          "menudeo": 121.38,
          "mayoreo": 106.66
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 128.48,
          "mayoreo": 112.92
        },
        "colores": {
          "menudeo": 141.72,
          "mayoreo": 124.6
        }
      }
    }
  },
  {
    "id": "950cl",
    "styleCode": "950 CL",
    "name": "Playera Deportiva ML Caballero",
    "category": "playeras",
    "gender": "caballero",
    "cutType": "Manga Larga - Dry Fit",
    "description": "Playera deportiva manga larga con protección y tejido de alto rendimiento transpirable.",
    "composition": "100% Poliéster",
    "weight": "150 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "S-2XL: 60 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Fluor Yellow",
        "hex": "#E6FF00",
        "isWhite": false
      },
      {
        "name": "Electric Blue",
        "hex": "#0070BA",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "Irish Green",
        "hex": "#009B48",
        "isWhite": false
      },
      {
        "name": "Fluor Orange",
        "hex": "#FF5500",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 128.36,
          "mayoreo": 112.81
        },
        "colores": {
          "menudeo": 140.66,
          "mayoreo": 123.67
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 149.71,
          "mayoreo": 131.65
        },
        "colores": {
          "menudeo": 166.08,
          "mayoreo": 146.1
        }
      }
    }
  },
  {
    "id": "950n",
    "styleCode": "950 N",
    "name": "Playera Deportiva Kids",
    "category": "playeras",
    "gender": "kids",
    "cutType": "Manga Corta - Dry Fit Infantil",
    "description": "Playera deportiva para niños ligera y fresca, ideal para uniformes escolares y deportivos.",
    "composition": "100% Poliéster",
    "weight": "150 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "boxPcs": "S-XL: 140 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Fluor Yellow",
        "hex": "#E6FF00",
        "isWhite": false
      },
      {
        "name": "Fluor Lime",
        "hex": "#76FF03",
        "isWhite": false
      },
      {
        "name": "Irish Green",
        "hex": "#009B48",
        "isWhite": false
      },
      {
        "name": "Green MX",
        "hex": "#006847",
        "isWhite": false
      },
      {
        "name": "Electric Blue",
        "hex": "#0070BA",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Coral Red",
        "hex": "#E53935",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Fuchsia",
        "hex": "#C2185B",
        "isWhite": false
      },
      {
        "name": "Fluor Orange",
        "hex": "#FF5500",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "Laurel",
        "hex": "#798071",
        "isWhite": false
      },
      {
        "name": "Grey Blue",
        "hex": "#5C6F84",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 82.44,
          "mayoreo": 72.29
        },
        "colores": {
          "menudeo": 87.6,
          "mayoreo": 76.85
        }
      }
    }
  },
  {
    "id": "960u",
    "styleCode": "960U",
    "name": "Playera Deportiva Poliéster Unisex",
    "category": "playeras",
    "gender": "unisex",
    "cutType": "Manga Corta - Atlético",
    "description": "Playera deportiva con paneles en combinación y colores lisos con ajuste atlético ergonómico.",
    "composition": "100% Poliéster",
    "weight": "150 g/m²",
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "XS-2XL: 60 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Grey",
        "hex": "#757575",
        "isWhite": false
      },
      {
        "name": "Green MX",
        "hex": "#006847",
        "isWhite": false
      },
      {
        "name": "Paprika",
        "hex": "#C0392B",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Cobalt",
        "hex": "#0047AB",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Brown",
        "hex": "#5D4037",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "Brown/Grey",
        "hex": "#6D4C41",
        "isWhite": false
      },
      {
        "name": "Charcoal/Grey",
        "hex": "#546E7A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 147.21,
          "mayoreo": 124.65
        },
        "colores": {
          "menudeo": 151.4,
          "mayoreo": 128.19
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 163.0,
          "mayoreo": 138.01
        },
        "colores": {
          "menudeo": 168.15,
          "mayoreo": 142.37
        }
      }
    }
  },
  {
    "id": "970c",
    "styleCode": "970 C",
    "name": "Playera Deportiva Poliéster Caballero",
    "category": "playeras",
    "gender": "caballero",
    "cutType": "Manga Corta - Dry Fit Pesado",
    "description": "Playera deportiva premium con gramaje de 160g de textura suave y gran resistencia.",
    "composition": "100% Poliéster",
    "weight": "160 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "S-2XL: 60 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "Irish Green",
        "hex": "#009B48",
        "isWhite": false
      },
      {
        "name": "Green MX",
        "hex": "#006847",
        "isWhite": false
      },
      {
        "name": "Coral Red",
        "hex": "#E53935",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Heather Royal Blue",
        "hex": "#2E5B88",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Heather Navy Blue",
        "hex": "#28385E",
        "isWhite": false
      },
      {
        "name": "Deep Blue",
        "hex": "#0A235C",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 114.85,
          "mayoreo": 100.89
        },
        "colores": {
          "menudeo": 124.31,
          "mayoreo": 109.24
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 132.56,
          "mayoreo": 116.52
        },
        "colores": {
          "menudeo": 145.38,
          "mayoreo": 127.83
        }
      }
    }
  },
  {
    "id": "970d",
    "styleCode": "970 D",
    "name": "Playera Deportiva Poliéster Dama",
    "category": "playeras",
    "gender": "dama",
    "cutType": "Manga Corta - Dry Fit Pesado Silueteada",
    "description": "Playera deportiva corte dama premium 160g silueteada con ajuste atlético estilizado.",
    "composition": "100% Poliéster",
    "weight": "160 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "S-2XL: 100 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "Irish Green",
        "hex": "#009B48",
        "isWhite": false
      },
      {
        "name": "Green MX",
        "hex": "#006847",
        "isWhite": false
      },
      {
        "name": "Coral Red",
        "hex": "#E53935",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Heather Royal Blue",
        "hex": "#2E5B88",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Heather Navy Blue",
        "hex": "#28385E",
        "isWhite": false
      },
      {
        "name": "Deep Blue",
        "hex": "#0A235C",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 114.85,
          "mayoreo": 100.89
        },
        "colores": {
          "menudeo": 124.31,
          "mayoreo": 109.24
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 132.56,
          "mayoreo": 116.52
        },
        "colores": {
          "menudeo": 145.38,
          "mayoreo": 127.83
        }
      }
    }
  },
  {
    "id": "600c",
    "styleCode": "600 C",
    "name": "Polo Cardado Caballero",
    "category": "polos",
    "gender": "caballero",
    "cutType": "Manga Corta - 3 Botones",
    "description": "Camisa polo piqué cardado de 230g, 3 botones al tono, cuello y puños tejidos, construcción tubular con refuerzo en hombros.",
    "composition": "50% Algodón - 50% Poliéster (Sport Grey: 90% Algodón - 10% Poliéster)",
    "weight": "230 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "S-XL: 40 pzas | 2XL: 30 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Yellow Haze",
        "hex": "#FFF59D",
        "isWhite": false
      },
      {
        "name": "Orange",
        "hex": "#F57C00",
        "isWhite": false
      },
      {
        "name": "Pink",
        "hex": "#E91E63",
        "isWhite": false
      },
      {
        "name": "Fuchsia",
        "hex": "#C2185B",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Heather Burgundy",
        "hex": "#581845",
        "isWhite": false
      },
      {
        "name": "Maroon",
        "hex": "#800000",
        "isWhite": false
      },
      {
        "name": "Purple",
        "hex": "#7B1FA2",
        "isWhite": false
      },
      {
        "name": "Kelly Green",
        "hex": "#2E7D32",
        "isWhite": false
      },
      {
        "name": "Light Blue",
        "hex": "#87CEEB",
        "isWhite": false
      },
      {
        "name": "Coastal Blue",
        "hex": "#4682B4",
        "isWhite": false
      },
      {
        "name": "Turquoise",
        "hex": "#20B2AA",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Heather Navy Blue",
        "hex": "#28385E",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Sport Grey",
        "hex": "#9E9E9E",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Heather Black",
        "hex": "#2B2B2B",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 149.1,
          "mayoreo": 132.88
        },
        "colores": {
          "menudeo": 172.89,
          "mayoreo": 154.07
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 176.51,
          "mayoreo": 157.3
        },
        "colores": {
          "menudeo": 207.82,
          "mayoreo": 185.17
        }
      }
    }
  },
  {
    "id": "600d",
    "styleCode": "600 D",
    "name": "Polo Cardado Dama",
    "category": "polos",
    "gender": "dama",
    "cutType": "Manga Corta - 4 Botones Silueteada",
    "description": "Camisa polo piqué cardado dama, corte silueteado, 4 botones al tono y cuello tejido con refuerzo.",
    "composition": "50% Algodón - 50% Poliéster (Sport Grey: 90% Algodón - 10% Poliéster)",
    "weight": "230 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "S-XL: 50 pzas | 2XL: 30 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Yellow Haze",
        "hex": "#FFF59D",
        "isWhite": false
      },
      {
        "name": "Orange",
        "hex": "#F57C00",
        "isWhite": false
      },
      {
        "name": "Pink",
        "hex": "#E91E63",
        "isWhite": false
      },
      {
        "name": "Fuchsia",
        "hex": "#C2185B",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Heather Burgundy",
        "hex": "#581845",
        "isWhite": false
      },
      {
        "name": "Maroon",
        "hex": "#800000",
        "isWhite": false
      },
      {
        "name": "Purple",
        "hex": "#7B1FA2",
        "isWhite": false
      },
      {
        "name": "Kelly Green",
        "hex": "#2E7D32",
        "isWhite": false
      },
      {
        "name": "Light Blue",
        "hex": "#87CEEB",
        "isWhite": false
      },
      {
        "name": "Coastal Blue",
        "hex": "#4682B4",
        "isWhite": false
      },
      {
        "name": "Turquoise",
        "hex": "#20B2AA",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Heather Navy Blue",
        "hex": "#28385E",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Sport Grey",
        "hex": "#9E9E9E",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Heather Black",
        "hex": "#2B2B2B",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 130.79,
          "mayoreo": 116.59
        },
        "colores": {
          "menudeo": 149.56,
          "mayoreo": 133.3
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 144.54,
          "mayoreo": 128.82
        },
        "colores": {
          "menudeo": 167.11,
          "mayoreo": 148.92
        }
      }
    }
  },
  {
    "id": "600cl",
    "styleCode": "600 CL",
    "name": "Polo Cardado Manga Larga Caballero",
    "category": "polos",
    "gender": "caballero",
    "cutType": "Manga Larga - 3 Botones",
    "description": "Camisa polo piqué cardado manga larga con puños elásticos y cerrado de costados.",
    "composition": "50% Algodón - 50% Poliéster",
    "weight": "230 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "S-2XL: 30 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Kelly Green",
        "hex": "#2E7D32",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Sport Grey",
        "hex": "#9E9E9E",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 198.69,
          "mayoreo": 169.12
        },
        "colores": {
          "menudeo": 223.0,
          "mayoreo": 189.79
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 238.43,
          "mayoreo": 200.22
        },
        "colores": {
          "menudeo": 267.63,
          "mayoreo": 224.72
        }
      }
    }
  },
  {
    "id": "600dl",
    "styleCode": "600 DL",
    "name": "Polo Cardado Manga Larga Dama",
    "category": "polos",
    "gender": "dama",
    "cutType": "Manga Larga - 4 Botones Silueteada",
    "description": "Camisa polo piqué cardado manga larga silueteada para dama con puños tejidos.",
    "composition": "50% Algodón - 50% Poliéster",
    "weight": "230 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "S-2XL: 40 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Kelly Green",
        "hex": "#2E7D32",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Sport Grey",
        "hex": "#9E9E9E",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 176.34,
          "mayoreo": 152.08
        },
        "colores": {
          "menudeo": 197.9,
          "mayoreo": 170.65
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 198.99,
          "mayoreo": 171.61
        },
        "colores": {
          "menudeo": 223.34,
          "mayoreo": 192.59
        }
      }
    }
  },
  {
    "id": "700c",
    "styleCode": "700 C",
    "name": "Polo Peinado Caballero",
    "category": "polos",
    "gender": "caballero",
    "cutType": "Manga Corta - Peinado Premium",
    "description": "Camisa polo piqué peinado suave de alta gama con costuras reforzadas y caída elegante.",
    "composition": "50% Algodón - 50% Poliéster Peinado",
    "weight": "230 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "S-2XL: 40 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Aqua",
        "hex": "#00CED1",
        "isWhite": false
      },
      {
        "name": "Coastal Blue",
        "hex": "#4682B4",
        "isWhite": false
      },
      {
        "name": "Turquoise",
        "hex": "#20B2AA",
        "isWhite": false
      },
      {
        "name": "Kelly Green",
        "hex": "#2E7D32",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Purple",
        "hex": "#7B1FA2",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Sport Grey",
        "hex": "#9E9E9E",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 181.24,
          "mayoreo": 157.06
        },
        "colores": {
          "menudeo": 203.4,
          "mayoreo": 176.25
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 228.19,
          "mayoreo": 197.04
        },
        "colores": {
          "menudeo": 256.13,
          "mayoreo": 221.15
        }
      }
    }
  },
  {
    "id": "700d",
    "styleCode": "700 D",
    "name": "Polo Peinado Dama",
    "category": "polos",
    "gender": "dama",
    "cutType": "Manga Corta - Peinado Silueteada",
    "description": "Camisa polo piqué peinado silueteada de máxima suavidad para dama.",
    "composition": "50% Algodón - 50% Poliéster Peinado",
    "weight": "230 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "S-2XL: 50 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Aqua",
        "hex": "#00CED1",
        "isWhite": false
      },
      {
        "name": "Coastal Blue",
        "hex": "#4682B4",
        "isWhite": false
      },
      {
        "name": "Turquoise",
        "hex": "#20B2AA",
        "isWhite": false
      },
      {
        "name": "Kelly Green",
        "hex": "#2E7D32",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Purple",
        "hex": "#7B1FA2",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Sport Grey",
        "hex": "#9E9E9E",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 145.82,
          "mayoreo": 128.94
        },
        "colores": {
          "menudeo": 163.63,
          "mayoreo": 144.67
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 161.31,
          "mayoreo": 141.01
        },
        "colores": {
          "menudeo": 181.02,
          "mayoreo": 158.22
        }
      }
    }
  },
  {
    "id": "900c",
    "styleCode": "900 C",
    "name": "Polo Poliéster Sport Caballero",
    "category": "polos",
    "gender": "caballero",
    "cutType": "Manga Corta - Piqué Poliéster",
    "description": "Polo 100% poliéster deportivo piqué de 200g, cerrado de costados y triple pespunte. Tallas hasta 4XL.",
    "composition": "100% Poliéster",
    "weight": "200 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
      "4XL"
    ],
    "boxPcs": "S-2XL: 50 pzas | 3XL-4XL: 40 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Cool Yellow",
        "hex": "#FFF176",
        "isWhite": false
      },
      {
        "name": "Orange",
        "hex": "#F57C00",
        "isWhite": false
      },
      {
        "name": "Aqua",
        "hex": "#00CED1",
        "isWhite": false
      },
      {
        "name": "Heather Royal Blue",
        "hex": "#2E5B88",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Cobalt",
        "hex": "#0047AB",
        "isWhite": false
      },
      {
        "name": "Heather Navy Blue",
        "hex": "#28385E",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Green MX",
        "hex": "#006847",
        "isWhite": false
      },
      {
        "name": "Olive",
        "hex": "#556B2F",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Scarlet Red",
        "hex": "#C62828",
        "isWhite": false
      },
      {
        "name": "Maroon",
        "hex": "#800000",
        "isWhite": false
      },
      {
        "name": "Oxford Grey",
        "hex": "#616161",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "Cotton Pink",
        "hex": "#FFB6C1",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 195.85,
          "mayoreo": 170.65
        },
        "colores": {
          "menudeo": 211.27,
          "mayoreo": 184.1
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 220.87,
          "mayoreo": 192.59
        },
        "colores": {
          "menudeo": 240.03,
          "mayoreo": 209.15
        }
      },
      "plus4XL": {
        "white": {
          "menudeo": 236.67,
          "mayoreo": 206.2
        },
        "colores": {
          "menudeo": 258.13,
          "mayoreo": 224.91
        }
      }
    }
  },
  {
    "id": "900d",
    "styleCode": "900 D",
    "name": "Polo Poliéster Sport Dama",
    "category": "polos",
    "gender": "dama",
    "cutType": "Manga Corta - Piqué Silueteada",
    "description": "Polo 100% poliéster deportivo piqué para dama silueteada, secado rápido.",
    "composition": "100% Poliéster",
    "weight": "200 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
      "4XL"
    ],
    "boxPcs": "S-4XL: 50 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Cool Yellow",
        "hex": "#FFF176",
        "isWhite": false
      },
      {
        "name": "Orange",
        "hex": "#F57C00",
        "isWhite": false
      },
      {
        "name": "Aqua",
        "hex": "#00CED1",
        "isWhite": false
      },
      {
        "name": "Heather Royal Blue",
        "hex": "#2E5B88",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Cobalt",
        "hex": "#0047AB",
        "isWhite": false
      },
      {
        "name": "Heather Navy Blue",
        "hex": "#28385E",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Green MX",
        "hex": "#006847",
        "isWhite": false
      },
      {
        "name": "Olive",
        "hex": "#556B2F",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Scarlet Red",
        "hex": "#C62828",
        "isWhite": false
      },
      {
        "name": "Maroon",
        "hex": "#800000",
        "isWhite": false
      },
      {
        "name": "Oxford Grey",
        "hex": "#616161",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "Cotton Pink",
        "hex": "#FFB6C1",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 195.85,
          "mayoreo": 170.65
        },
        "colores": {
          "menudeo": 211.27,
          "mayoreo": 184.1
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 220.87,
          "mayoreo": 192.59
        },
        "colores": {
          "menudeo": 240.03,
          "mayoreo": 209.15
        }
      },
      "plus4XL": {
        "white": {
          "menudeo": 236.67,
          "mayoreo": 206.2
        },
        "colores": {
          "menudeo": 258.13,
          "mayoreo": 224.91
        }
      }
    }
  },
  {
    "id": "900cl",
    "styleCode": "900 CL",
    "name": "Polo Poliéster Sport ML Caballero",
    "category": "polos",
    "gender": "caballero",
    "cutType": "Manga Larga - Sport Poliéster",
    "description": "Polo deportivo 100% poliéster manga larga con puños al tono y acabado impecable.",
    "composition": "100% Poliéster",
    "weight": "200 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
      "4XL"
    ],
    "boxPcs": "S-2XL: 40 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Oxford Grey",
        "hex": "#616161",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 229.87,
          "mayoreo": 200.32
        },
        "colores": {
          "menudeo": 249.5,
          "mayoreo": 217.41
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 263.5,
          "mayoreo": 229.62
        },
        "colores": {
          "menudeo": 292.88,
          "mayoreo": 255.22
        }
      },
      "plus4XL": {
        "white": {
          "menudeo": 275.99,
          "mayoreo": 240.5
        },
        "colores": {
          "menudeo": 303.97,
          "mayoreo": 264.88
        }
      }
    }
  },
  {
    "id": "900dl",
    "styleCode": "900 DL",
    "name": "Polo Poliéster Sport ML Dama",
    "category": "polos",
    "gender": "dama",
    "cutType": "Manga Larga - Sport Poliéster Dama",
    "description": "Polo deportivo manga larga silueteado para dama 100% poliéster.",
    "composition": "100% Poliéster",
    "weight": "200 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "S-2XL: 40 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Oxford Grey",
        "hex": "#616161",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 229.87,
          "mayoreo": 200.32
        },
        "colores": {
          "menudeo": 249.5,
          "mayoreo": 217.41
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 263.5,
          "mayoreo": 229.62
        },
        "colores": {
          "menudeo": 292.88,
          "mayoreo": 255.22
        }
      }
    }
  },
  {
    "id": "901c",
    "styleCode": "901 C",
    "name": "Polo Poliéster Piqué Elastano Caballero",
    "category": "polos",
    "gender": "caballero",
    "cutType": "Manga Corta - Stretch Premium",
    "description": "Polo moderno de alta elasticidad (5.5% elastano) que brinda comodidad superior y ajuste atlético elegante.",
    "composition": "94.5% Poliéster - 5.5% Elastano",
    "weight": "190 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "S-2XL: 50 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Lavender",
        "hex": "#BA68C8",
        "isWhite": false
      },
      {
        "name": "Mineral Green",
        "hex": "#5F8575",
        "isWhite": false
      },
      {
        "name": "Light Olive",
        "hex": "#708238",
        "isWhite": false
      },
      {
        "name": "Sunset Pink",
        "hex": "#FF6B8B",
        "isWhite": false
      },
      {
        "name": "Green MX",
        "hex": "#006847",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Cobalt",
        "hex": "#0047AB",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Purple",
        "hex": "#7B1FA2",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 224.18,
          "mayoreo": 197.94
        },
        "colores": {
          "menudeo": 242.02,
          "mayoreo": 213.68
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 251.62,
          "mayoreo": 222.16
        },
        "colores": {
          "menudeo": 273.64,
          "mayoreo": 241.58
        }
      }
    }
  },
  {
    "id": "901d",
    "styleCode": "901 D",
    "name": "Polo Poliéster Piqué Elastano Dama",
    "category": "polos",
    "gender": "dama",
    "cutType": "Manga Corta - Stretch Silueteada",
    "description": "Polo piqué con elastano silueteada para dama, tacto ultra cómodo y ajuste perfecto.",
    "composition": "94.5% Poliéster - 5.5% Elastano",
    "weight": "190 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "S-2XL: 60 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Lavender",
        "hex": "#BA68C8",
        "isWhite": false
      },
      {
        "name": "Mineral Green",
        "hex": "#5F8575",
        "isWhite": false
      },
      {
        "name": "Light Olive",
        "hex": "#708238",
        "isWhite": false
      },
      {
        "name": "Sunset Pink",
        "hex": "#FF6B8B",
        "isWhite": false
      },
      {
        "name": "Green MX",
        "hex": "#006847",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Cobalt",
        "hex": "#0047AB",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Purple",
        "hex": "#7B1FA2",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 224.18,
          "mayoreo": 197.94
        },
        "colores": {
          "menudeo": 242.02,
          "mayoreo": 213.68
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 251.62,
          "mayoreo": 222.16
        },
        "colores": {
          "menudeo": 273.64,
          "mayoreo": 241.58
        }
      }
    }
  },
  {
    "id": "902u",
    "styleCode": "902U",
    "name": "Polo Poliéster Waffle Unisex",
    "category": "polos",
    "gender": "unisex",
    "cutType": "Manga Corta - Tejido Waffle",
    "description": "Polo con textura waffle nido de abeja transpirable, disponible en tonos lisos y combinados bi-tono.",
    "composition": "100% Poliéster",
    "weight": "180 g/m²",
    "sizes": [
      "2XS",
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "2XS-2XL: 50 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "White/Grey",
        "hex": "#E0E0E0",
        "isWhite": false
      },
      {
        "name": "Pink/Grey",
        "hex": "#F8BBD0",
        "isWhite": false
      },
      {
        "name": "Red/Grey",
        "hex": "#E57373",
        "isWhite": false
      },
      {
        "name": "Green MX/Grey",
        "hex": "#81C784",
        "isWhite": false
      },
      {
        "name": "Royal Blue/Grey",
        "hex": "#64B5F6",
        "isWhite": false
      },
      {
        "name": "Navy Blue/Grey",
        "hex": "#455A64",
        "isWhite": false
      },
      {
        "name": "Oxford Grey/Black",
        "hex": "#37474F",
        "isWhite": false
      },
      {
        "name": "Black/Grey",
        "hex": "#333333",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 192.87,
          "mayoreo": 168.52
        },
        "colores": {
          "menudeo": 198.77,
          "mayoreo": 173.67
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 215.23,
          "mayoreo": 188.05
        },
        "colores": {
          "menudeo": 222.61,
          "mayoreo": 194.49
        }
      }
    }
  },
  {
    "id": "903u",
    "styleCode": "903U",
    "name": "Polo Poliéster Micro Waffle Unisex",
    "category": "polos",
    "gender": "unisex",
    "cutType": "Manga Corta - Micro Waffle Técnico",
    "description": "Polo técnico con textura micro waffle, mezcla nailon y elastano ultra sedoso y fresco.",
    "composition": "70% Nailon – 30% Elastano",
    "weight": "200 g/m²",
    "sizes": [
      "2XS",
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "2XS-2XL: 50 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Cool Grey",
        "hex": "#8C9BA5",
        "isWhite": false
      },
      {
        "name": "Beige",
        "hex": "#D2B48C",
        "isWhite": false
      },
      {
        "name": "Light Olive",
        "hex": "#708238",
        "isWhite": false
      },
      {
        "name": "Jade Green",
        "hex": "#00A86B",
        "isWhite": false
      },
      {
        "name": "Steel Blue",
        "hex": "#4682B4",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Terracotta",
        "hex": "#C04000",
        "isWhite": false
      },
      {
        "name": "Iron Blue",
        "hex": "#3A4B5C",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 336.16,
          "mayoreo": 284.62
        },
        "colores": {
          "menudeo": 345.74,
          "mayoreo": 292.72
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 372.24,
          "mayoreo": 315.15
        },
        "colores": {
          "menudeo": 384.02,
          "mayoreo": 325.12
        }
      }
    }
  },
  {
    "id": "6000c",
    "styleCode": "6000 C",
    "name": "Camisa Gabardina MC Caballero",
    "category": "ejecutivo",
    "gender": "caballero",
    "cutType": "Manga Corta - Gabardina",
    "description": "Camisa de gabardina de uso rudo y corporativo manga corta, resistente y de fácil planchado.",
    "composition": "50% Algodón - 50% Poliéster",
    "weight": "160 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
      "4XL"
    ],
    "boxPcs": "S-2XL: 35 pzas | 3XL-4XL: 30 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Light Blue",
        "hex": "#87CEEB",
        "isWhite": false
      },
      {
        "name": "Coastal Blue",
        "hex": "#4682B4",
        "isWhite": false
      },
      {
        "name": "Khaki",
        "hex": "#BDB76B",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Maroon",
        "hex": "#800000",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 304.81,
          "mayoreo": 284.96
        },
        "colores": {
          "menudeo": 332.26,
          "mayoreo": 317.61
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 342.25,
          "mayoreo": 317.61
        },
        "colores": {
          "menudeo": 370.35,
          "mayoreo": 355.42
        }
      },
      "plus4XL": {
        "white": {
          "menudeo": 358.16,
          "mayoreo": 331.41
        },
        "colores": {
          "menudeo": 386.45,
          "mayoreo": 399.1
        }
      }
    }
  },
  {
    "id": "6000d",
    "styleCode": "6000 D",
    "name": "Camisa Gabardina MC Dama",
    "category": "ejecutivo",
    "gender": "dama",
    "cutType": "Manga Corta - Gabardina Silueteada",
    "description": "Camisa de gabardina manga corta para dama con pinzas y corte silueteado.",
    "composition": "50% Algodón - 50% Poliéster",
    "weight": "160 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
      "4XL"
    ],
    "boxPcs": "S-2XL: 40 pzas | 3XL-4XL: 35 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Light Blue",
        "hex": "#87CEEB",
        "isWhite": false
      },
      {
        "name": "Coastal Blue",
        "hex": "#4682B4",
        "isWhite": false
      },
      {
        "name": "Khaki",
        "hex": "#BDB76B",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Maroon",
        "hex": "#800000",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 304.81,
          "mayoreo": 284.96
        },
        "colores": {
          "menudeo": 332.26,
          "mayoreo": 317.61
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 342.25,
          "mayoreo": 317.61
        },
        "colores": {
          "menudeo": 370.35,
          "mayoreo": 355.42
        }
      },
      "plus4XL": {
        "white": {
          "menudeo": 358.16,
          "mayoreo": 331.41
        },
        "colores": {
          "menudeo": 386.45,
          "mayoreo": 399.1
        }
      }
    }
  },
  {
    "id": "6000cl",
    "styleCode": "6000 CL",
    "name": "Camisa Gabardina ML Caballero",
    "category": "ejecutivo",
    "gender": "caballero",
    "cutType": "Manga Larga - Gabardina",
    "description": "Camisa de gabardina manga larga ejecutiva con botones y puños ajustables.",
    "composition": "50% Algodón - 50% Poliéster",
    "weight": "160 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
      "4XL"
    ],
    "boxPcs": "S-2XL: 35 pzas | 3XL-4XL: 30 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Light Blue",
        "hex": "#87CEEB",
        "isWhite": false
      },
      {
        "name": "Coastal Blue",
        "hex": "#4682B4",
        "isWhite": false
      },
      {
        "name": "Khaki",
        "hex": "#BDB76B",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Maroon",
        "hex": "#800000",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 379.71,
          "mayoreo": 325.63
        },
        "colores": {
          "menudeo": 408.07,
          "mayoreo": 349.94
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 407.16,
          "mayoreo": 349.16
        },
        "colores": {
          "menudeo": 439.27,
          "mayoreo": 376.69
        }
      },
      "plus4XL": {
        "white": {
          "menudeo": 424.1,
          "mayoreo": 363.68
        },
        "colores": {
          "menudeo": 458.84,
          "mayoreo": 393.46
        }
      }
    }
  },
  {
    "id": "6000dl",
    "styleCode": "6000 DL",
    "name": "Camisa Gabardina ML Dama",
    "category": "ejecutivo",
    "gender": "dama",
    "cutType": "Manga Larga - Gabardina Silueteada",
    "description": "Camisa de gabardina manga larga silueteada con pinzas frontales y traseras.",
    "composition": "50% Algodón - 50% Poliéster",
    "weight": "160 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
      "4XL"
    ],
    "boxPcs": "S-2XL: 40 pzas | 3XL-4XL: 35 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Light Blue",
        "hex": "#87CEEB",
        "isWhite": false
      },
      {
        "name": "Coastal Blue",
        "hex": "#4682B4",
        "isWhite": false
      },
      {
        "name": "Khaki",
        "hex": "#BDB76B",
        "isWhite": false
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Maroon",
        "hex": "#800000",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 379.71,
          "mayoreo": 325.63
        },
        "colores": {
          "menudeo": 408.07,
          "mayoreo": 349.94
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 407.16,
          "mayoreo": 349.16
        },
        "colores": {
          "menudeo": 439.27,
          "mayoreo": 376.69
        }
      },
      "plus4XL": {
        "white": {
          "menudeo": 424.1,
          "mayoreo": 363.68
        },
        "colores": {
          "menudeo": 458.84,
          "mayoreo": 393.46
        }
      }
    }
  },
  {
    "id": "6001c",
    "styleCode": "6001 C",
    "name": "Camisa Oxford MC Caballero",
    "category": "ejecutivo",
    "gender": "caballero",
    "cutType": "Manga Corta - Oxford",
    "description": "Camisa Oxford manga corta de textura clásica con botón en cuello.",
    "composition": "60% Algodón - 40% Poliéster",
    "weight": "155 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
      "4XL"
    ],
    "boxPcs": "S-2XL: 35 pzas | 3XL-4XL: 30 pzas",
    "colors": [
      {
        "name": "White Oxford",
        "hex": "#F0F4F8",
        "isWhite": true
      },
      {
        "name": "Pink Oxford",
        "hex": "#FAD2E1",
        "isWhite": false
      },
      {
        "name": "Navy Blue Oxford",
        "hex": "#202E44",
        "isWhite": false
      },
      {
        "name": "Black Oxford",
        "hex": "#2A2A2A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 337.29,
          "mayoreo": 289.27
        },
        "colores": {
          "menudeo": 337.29,
          "mayoreo": 289.27
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 376.57,
          "mayoreo": 322.94
        },
        "colores": {
          "menudeo": 376.57,
          "mayoreo": 322.94
        }
      },
      "plus4XL": {
        "white": {
          "menudeo": 393.22,
          "mayoreo": 337.21
        },
        "colores": {
          "menudeo": 393.22,
          "mayoreo": 337.21
        }
      }
    }
  },
  {
    "id": "6001d",
    "styleCode": "6001 D",
    "name": "Camisa Oxford MC Dama",
    "category": "ejecutivo",
    "gender": "dama",
    "cutType": "Manga Corta - Oxford Silueteada",
    "description": "Camisa Oxford manga corta silueteada para dama.",
    "composition": "60% Algodón - 40% Poliéster",
    "weight": "155 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
      "4XL"
    ],
    "boxPcs": "S-2XL: 40 pzas | 3XL-4XL: 35 pzas",
    "colors": [
      {
        "name": "White Oxford",
        "hex": "#F0F4F8",
        "isWhite": true
      },
      {
        "name": "Pink Oxford",
        "hex": "#FAD2E1",
        "isWhite": false
      },
      {
        "name": "Navy Blue Oxford",
        "hex": "#202E44",
        "isWhite": false
      },
      {
        "name": "Black Oxford",
        "hex": "#2A2A2A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 337.29,
          "mayoreo": 289.27
        },
        "colores": {
          "menudeo": 337.29,
          "mayoreo": 289.27
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 376.57,
          "mayoreo": 322.94
        },
        "colores": {
          "menudeo": 376.57,
          "mayoreo": 322.94
        }
      },
      "plus4XL": {
        "white": {
          "menudeo": 393.22,
          "mayoreo": 337.21
        },
        "colores": {
          "menudeo": 393.22,
          "mayoreo": 337.21
        }
      }
    }
  },
  {
    "id": "6001cl",
    "styleCode": "6001 CL",
    "name": "Camisa Oxford ML Caballero",
    "category": "ejecutivo",
    "gender": "caballero",
    "cutType": "Manga Larga - Oxford",
    "description": "Camisa Oxford manga larga ejecutiva de alto gramaje y prestancia.",
    "composition": "60% Algodón - 40% Poliéster",
    "weight": "155 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
      "4XL"
    ],
    "boxPcs": "S-2XL: 35 pzas | 3XL-4XL: 30 pzas",
    "colors": [
      {
        "name": "White Oxford",
        "hex": "#F0F4F8",
        "isWhite": true
      },
      {
        "name": "Pink Oxford",
        "hex": "#FAD2E1",
        "isWhite": false
      },
      {
        "name": "Navy Blue Oxford",
        "hex": "#202E44",
        "isWhite": false
      },
      {
        "name": "Black Oxford",
        "hex": "#2A2A2A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 385.87,
          "mayoreo": 330.91
        },
        "colores": {
          "menudeo": 385.87,
          "mayoreo": 330.91
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 414.12,
          "mayoreo": 355.13
        },
        "colores": {
          "menudeo": 414.12,
          "mayoreo": 355.13
        }
      },
      "plus4XL": {
        "white": {
          "menudeo": 431.64,
          "mayoreo": 370.14
        },
        "colores": {
          "menudeo": 431.64,
          "mayoreo": 370.14
        }
      }
    }
  },
  {
    "id": "6001dl",
    "styleCode": "6001 DL",
    "name": "Camisa Oxford ML Dama",
    "category": "ejecutivo",
    "gender": "dama",
    "cutType": "Manga Larga - Oxford Silueteada",
    "description": "Camisa Oxford manga larga silueteada para dama.",
    "composition": "60% Algodón - 40% Poliéster",
    "weight": "155 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
      "4XL"
    ],
    "boxPcs": "S-2XL: 40 pzas | 3XL-4XL: 35 pzas",
    "colors": [
      {
        "name": "White Oxford",
        "hex": "#F0F4F8",
        "isWhite": true
      },
      {
        "name": "Pink Oxford",
        "hex": "#FAD2E1",
        "isWhite": false
      },
      {
        "name": "Navy Blue Oxford",
        "hex": "#202E44",
        "isWhite": false
      },
      {
        "name": "Black Oxford",
        "hex": "#2A2A2A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 385.87,
          "mayoreo": 330.91
        },
        "colores": {
          "menudeo": 385.87,
          "mayoreo": 330.91
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 414.12,
          "mayoreo": 355.13
        },
        "colores": {
          "menudeo": 414.12,
          "mayoreo": 355.13
        }
      },
      "plus4XL": {
        "white": {
          "menudeo": 431.64,
          "mayoreo": 370.14
        },
        "colores": {
          "menudeo": 431.64,
          "mayoreo": 370.14
        }
      }
    }
  },
  {
    "id": "6002c",
    "styleCode": "6002 C",
    "name": "Camisa Cuadros y Rayas MC Caballero",
    "category": "ejecutivo",
    "gender": "caballero",
    "cutType": "Manga Corta - Cuadros y Rayas",
    "description": "Camisa casual formal con patrones contemporáneos de cuadros y rayas finas.",
    "composition": "55% Algodón - 45% Poliéster",
    "weight": "115 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
      "4XL"
    ],
    "boxPcs": "S-2XL: 35 pzas | 3XL-4XL: 30 pzas",
    "colors": [
      {
        "name": "Plaid Royal Blue",
        "hex": "#2563EB",
        "isWhite": false
      },
      {
        "name": "Plaid Coral",
        "hex": "#FB7185",
        "isWhite": false
      },
      {
        "name": "Navy Blue Stripes",
        "hex": "#1E293B",
        "isWhite": false
      },
      {
        "name": "Light Blue Stripes",
        "hex": "#7DD3FC",
        "isWhite": false
      },
      {
        "name": "Mint Stripes",
        "hex": "#6EE7B7",
        "isWhite": false
      },
      {
        "name": "Pink Stripes",
        "hex": "#F472B6",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 372.82,
          "mayoreo": 319.73
        },
        "colores": {
          "menudeo": 372.82,
          "mayoreo": 319.73
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 415.94,
          "mayoreo": 356.68
        },
        "colores": {
          "menudeo": 415.94,
          "mayoreo": 356.68
        }
      },
      "plus4XL": {
        "white": {
          "menudeo": 433.34,
          "mayoreo": 371.6
        },
        "colores": {
          "menudeo": 433.34,
          "mayoreo": 371.6
        }
      }
    }
  },
  {
    "id": "6002cl",
    "styleCode": "6002 CL",
    "name": "Camisa Cuadros y Rayas ML Caballero",
    "category": "ejecutivo",
    "gender": "caballero",
    "cutType": "Manga Larga - Cuadros y Rayas",
    "description": "Camisa manga larga de cuadros y rayas finas de excelente acabado.",
    "composition": "55% Algodón - 45% Poliéster",
    "weight": "115 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
      "4XL"
    ],
    "boxPcs": "S-2XL: 35 pzas | 3XL-4XL: 30 pzas",
    "colors": [
      {
        "name": "Plaid Royal Blue",
        "hex": "#2563EB",
        "isWhite": false
      },
      {
        "name": "Plaid Coral",
        "hex": "#FB7185",
        "isWhite": false
      },
      {
        "name": "Navy Blue Stripes",
        "hex": "#1E293B",
        "isWhite": false
      },
      {
        "name": "Light Blue Stripes",
        "hex": "#7DD3FC",
        "isWhite": false
      },
      {
        "name": "Mint Stripes",
        "hex": "#6EE7B7",
        "isWhite": false
      },
      {
        "name": "Pink Stripes",
        "hex": "#F472B6",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 423.92,
          "mayoreo": 363.53
        },
        "colores": {
          "menudeo": 423.92,
          "mayoreo": 363.53
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 454.8,
          "mayoreo": 389.99
        },
        "colores": {
          "menudeo": 454.8,
          "mayoreo": 389.99
        }
      },
      "plus4XL": {
        "white": {
          "menudeo": 486.16,
          "mayoreo": 416.87
        },
        "colores": {
          "menudeo": 486.16,
          "mayoreo": 416.87
        }
      }
    }
  },
  {
    "id": "6004c",
    "styleCode": "6004 C",
    "name": "Camisa de Cuadros MC Caballero",
    "category": "ejecutivo",
    "gender": "caballero",
    "cutType": "Manga Corta - Micro Cuadros",
    "description": "Camisa con filamento y elastano de máxima frescura antiarrugas.",
    "composition": "96% Poliéster Filamento - 4% Elastano",
    "weight": "110 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
      "4XL"
    ],
    "boxPcs": "S-2XL: 35 pzas | 3XL-4XL: 30 pzas",
    "colors": [
      {
        "name": "Plaid Light Blue",
        "hex": "#90CAF9",
        "isWhite": false
      },
      {
        "name": "Plaid Pink",
        "hex": "#F48FB1",
        "isWhite": false
      },
      {
        "name": "Plaid Orange",
        "hex": "#FFB74D",
        "isWhite": false
      },
      {
        "name": "Plaid Yellow-Navy Blue",
        "hex": "#FFD54F",
        "isWhite": false
      },
      {
        "name": "Plaid Navy Blue",
        "hex": "#1E3A8A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 336.42,
          "mayoreo": 288.53
        },
        "colores": {
          "menudeo": 336.42,
          "mayoreo": 288.53
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 375.51,
          "mayoreo": 322.03
        },
        "colores": {
          "menudeo": 375.51,
          "mayoreo": 322.03
        }
      },
      "plus4XL": {
        "white": {
          "menudeo": 392.06,
          "mayoreo": 336.22
        },
        "colores": {
          "menudeo": 392.06,
          "mayoreo": 336.22
        }
      }
    }
  },
  {
    "id": "6004cl",
    "styleCode": "6004 CL",
    "name": "Camisa de Cuadros ML Caballero",
    "category": "ejecutivo",
    "gender": "caballero",
    "cutType": "Manga Larga - Micro Cuadros",
    "description": "Camisa manga larga con filamento de poliéster y elastano.",
    "composition": "96% Poliéster Filamento - 4% Elastano",
    "weight": "110 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
      "4XL"
    ],
    "boxPcs": "S-2XL: 35 pzas | 3XL-4XL: 30 pzas",
    "colors": [
      {
        "name": "Plaid Light Blue",
        "hex": "#90CAF9",
        "isWhite": false
      },
      {
        "name": "Plaid Pink",
        "hex": "#F48FB1",
        "isWhite": false
      },
      {
        "name": "Plaid Orange",
        "hex": "#FFB74D",
        "isWhite": false
      },
      {
        "name": "Plaid Yellow-Navy Blue",
        "hex": "#FFD54F",
        "isWhite": false
      },
      {
        "name": "Plaid Navy Blue",
        "hex": "#1E3A8A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 384.81,
          "mayoreo": 330.0
        },
        "colores": {
          "menudeo": 384.81,
          "mayoreo": 330.0
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 412.94,
          "mayoreo": 354.11
        },
        "colores": {
          "menudeo": 412.94,
          "mayoreo": 354.11
        }
      },
      "plus4XL": {
        "white": {
          "menudeo": 430.34,
          "mayoreo": 369.03
        },
        "colores": {
          "menudeo": 430.34,
          "mayoreo": 369.03
        }
      }
    }
  },
  {
    "id": "6500c",
    "styleCode": "6500 C",
    "name": "Camisa de Trabajo MC",
    "category": "ejecutivo",
    "gender": "unisex",
    "cutType": "Manga Corta - Trabajo Pesado",
    "description": "Camisa de trabajo industrial 180g con doble bolsillo frontal y resistencia superior a lavados rudos.",
    "composition": "65% Algodón - 35% Poliéster",
    "weight": "180 g/m²",
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "boxPcs": "XS-2XL: 40 pzas | 3XL: 35 pzas",
    "colors": [
      {
        "name": "Silver",
        "hex": "#C0C0C0",
        "isWhite": false
      },
      {
        "name": "Khaki",
        "hex": "#BDB76B",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 325.17,
          "mayoreo": 278.88
        },
        "colores": {
          "menudeo": 325.17,
          "mayoreo": 278.88
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 360.12,
          "mayoreo": 308.84
        },
        "colores": {
          "menudeo": 360.12,
          "mayoreo": 308.84
        }
      },
      "plus3XL": {
        "white": {
          "menudeo": 372.73,
          "mayoreo": 319.65
        },
        "colores": {
          "menudeo": 372.73,
          "mayoreo": 319.65
        }
      }
    }
  },
  {
    "id": "6500cl",
    "styleCode": "6500 CL",
    "name": "Camisa de Trabajo ML",
    "category": "ejecutivo",
    "gender": "unisex",
    "cutType": "Manga Larga - Trabajo Pesado",
    "description": "Camisa de trabajo industrial manga larga 180g con bolsillos con solapa.",
    "composition": "65% Algodón - 35% Poliéster",
    "weight": "180 g/m²",
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL"
    ],
    "boxPcs": "XS-2XL: 40 pzas | 3XL: 35 pzas",
    "colors": [
      {
        "name": "Silver",
        "hex": "#C0C0C0",
        "isWhite": false
      },
      {
        "name": "Khaki",
        "hex": "#BDB76B",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 368.61,
          "mayoreo": 316.12
        },
        "colores": {
          "menudeo": 368.61,
          "mayoreo": 316.12
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 402.6,
          "mayoreo": 345.25
        },
        "colores": {
          "menudeo": 402.6,
          "mayoreo": 345.25
        }
      },
      "plus3XL": {
        "white": {
          "menudeo": 416.81,
          "mayoreo": 357.43
        },
        "colores": {
          "menudeo": 416.81,
          "mayoreo": 357.43
        }
      }
    }
  },
  {
    "id": "7100u",
    "styleCode": "7100U",
    "name": "Camisa Deportiva Manga Larga Unisex",
    "category": "outdoor",
    "gender": "unisex",
    "cutType": "Manga Larga - Outdoor Confort",
    "description": "Camisa de aventura/outdoor de secado rápido con protección solar UV y tejido flexible.",
    "composition": "86% Poliéster – 14% Elastano",
    "weight": "170 g/m²",
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "XS-2XL: 24 pzas",
    "colors": [
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Olive",
        "hex": "#556B2F",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Beige",
        "hex": "#D2B48C",
        "isWhite": false
      },
      {
        "name": "Natural",
        "hex": "#F5F2EB",
        "isWhite": false
      },
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 413.97,
          "mayoreo": 364.24
        },
        "colores": {
          "menudeo": 413.97,
          "mayoreo": 364.24
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 443.45,
          "mayoreo": 390.26
        },
        "colores": {
          "menudeo": 443.45,
          "mayoreo": 390.26
        }
      }
    }
  },
  {
    "id": "8000u",
    "styleCode": "8000U",
    "name": "Chaleco de Nailon Unisex",
    "category": "outdoor",
    "gender": "unisex",
    "cutType": "Chaleco Acolchado",
    "description": "Chaleco térmico de nailon con relleno sintético ultra ligero y bolsillos con cremallera.",
    "composition": "100% Nailon (Relleno Poliéster)",
    "weight": "Térmico Acolchado",
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "XS-2XL: 24 pzas",
    "colors": [
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Olive",
        "hex": "#556B2F",
        "isWhite": false
      },
      {
        "name": "Maroon",
        "hex": "#800000",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 459.58,
          "mayoreo": 404.49
        },
        "colores": {
          "menudeo": 459.58,
          "mayoreo": 404.49
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 494.84,
          "mayoreo": 435.6
        },
        "colores": {
          "menudeo": 494.84,
          "mayoreo": 435.6
        }
      }
    }
  },
  {
    "id": "8001u",
    "styleCode": "8001U",
    "name": "Chaleco Softshell Unisex",
    "category": "outdoor",
    "gender": "unisex",
    "cutType": "Chaleco Softshell Tricapa",
    "description": "Chaleco softshell tricapa con membrana rompevientos e interior micropolar suave.",
    "composition": "100% Poliéster Tricapa Softshell",
    "weight": "300 g/m²",
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "XS-2XL: 18 pzas",
    "colors": [
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Forest Green",
        "hex": "#1E4620",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 573.51,
          "mayoreo": 505.01
        },
        "colores": {
          "menudeo": 573.51,
          "mayoreo": 505.01
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 617.54,
          "mayoreo": 543.86
        },
        "colores": {
          "menudeo": 617.54,
          "mayoreo": 543.86
        }
      }
    }
  },
  {
    "id": "8002u",
    "styleCode": "8002U",
    "name": "Chamarra Softshell Unisex",
    "category": "outdoor",
    "gender": "unisex",
    "cutType": "Chamarra Softshell Tricapa",
    "description": "Chamarra técnica softshell impermeable y rompevientos con forro polar interior.",
    "composition": "100% Poliéster Tricapa Softshell",
    "weight": "300 g/m²",
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "XS-2XL: 12 pzas",
    "colors": [
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Forest Green",
        "hex": "#1E4620",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 799.41,
          "mayoreo": 704.33
        },
        "colores": {
          "menudeo": 799.41,
          "mayoreo": 704.33
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 860.81,
          "mayoreo": 758.51
        },
        "colores": {
          "menudeo": 860.81,
          "mayoreo": 758.51
        }
      }
    }
  },
  {
    "id": "8100u",
    "styleCode": "8100U",
    "name": "Chaleco Softshell Reciclado Unisex",
    "category": "outdoor",
    "gender": "unisex",
    "cutType": "Chaleco Softshell Eco",
    "description": "Chaleco ecológico elaborado con hilo de poliéster 100% reciclado tricapa.",
    "composition": "100% Poliéster Tricapa Reciclado",
    "weight": "300 g/m²",
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "XS-2XL: 18 pzas",
    "colors": [
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 799.41,
          "mayoreo": 704.33
        },
        "colores": {
          "menudeo": 799.41,
          "mayoreo": 704.33
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 860.81,
          "mayoreo": 758.51
        },
        "colores": {
          "menudeo": 860.81,
          "mayoreo": 758.51
        }
      }
    }
  },
  {
    "id": "8101u",
    "styleCode": "8101U",
    "name": "Chamarra Softshell Reciclada Unisex",
    "category": "outdoor",
    "gender": "unisex",
    "cutType": "Chamarra Softshell Eco",
    "description": "Chamarra sustentable de alto rendimiento con fibra reciclada y elastano.",
    "composition": "88% Poliéster Tricapa Reciclado - 12% Elastano",
    "weight": "300 g/m²",
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "XS-2XL: 12 pzas",
    "colors": [
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 1071.32,
          "mayoreo": 944.25
        },
        "colores": {
          "menudeo": 1071.32,
          "mayoreo": 944.25
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 1153.63,
          "mayoreo": 1016.89
        },
        "colores": {
          "menudeo": 1153.63,
          "mayoreo": 1016.89
        }
      }
    }
  },
  {
    "id": "9000u",
    "styleCode": "9000U",
    "name": "Sudadera de Poliéster Unisex",
    "category": "outdoor",
    "gender": "unisex",
    "cutType": "Sudadera Deportiva",
    "description": "Sudadera deportiva de microfelpa 100% poliéster cálida y transpirable con capucha y bolsa canguro.",
    "composition": "100% Poliéster",
    "weight": "240 g/m²",
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "boxPcs": "S-2XL: 18 pzas",
    "colors": [
      {
        "name": "White",
        "hex": "#FFFFFF",
        "isWhite": true
      },
      {
        "name": "Red",
        "hex": "#D32F2F",
        "isWhite": false
      },
      {
        "name": "Royal Blue",
        "hex": "#1565C0",
        "isWhite": false
      },
      {
        "name": "Navy Blue",
        "hex": "#1A2942",
        "isWhite": false
      },
      {
        "name": "Charcoal",
        "hex": "#424242",
        "isWhite": false
      },
      {
        "name": "Black",
        "hex": "#1A1A1A",
        "isWhite": false
      }
    ],
    "pricing": {
      "standard": {
        "white": {
          "menudeo": 298.7,
          "mayoreo": 241.82
        },
        "colores": {
          "menudeo": 306.63,
          "mayoreo": 248.23
        }
      },
      "plus2XL": {
        "white": {
          "menudeo": 328.45,
          "mayoreo": 265.88
        },
        "colores": {
          "menudeo": 338.08,
          "mayoreo": 273.67
        }
      }
    }
  }
];

/**
 * Calcula el precio unitario exacto para un modelo, color y talla según el tipo de precio (menudeo o mayoreo)
 */
export function calculateUnitPrice(
  model: PuntoTextilModel,
  colorName: string,
  size: string,
  pricingTier: 'menudeo' | 'mayoreo'
): number {
  const isWhite = colorName.trim().toLowerCase() === 'white' || colorName.trim().toLowerCase() === 'white oxford';
  const sizeNormalized = size.toUpperCase().trim();

  // Tallas 4XL / 3XL-4XL
  if (['4XL', '3XL-4XL'].includes(sizeNormalized) && model.pricing.plus4XL) {
    const tier = isWhite ? model.pricing.plus4XL.white : model.pricing.plus4XL.colores;
    return tier[pricingTier];
  }

  // Tallas 3XL
  if (['3XL'].includes(sizeNormalized)) {
    if (model.pricing.plus3XL) {
      const tier = isWhite ? model.pricing.plus3XL.white : model.pricing.plus3XL.colores;
      return tier[pricingTier];
    }
    if (model.pricing.plus4XL) {
      const tier = isWhite ? model.pricing.plus4XL.white : model.pricing.plus4XL.colores;
      return tier[pricingTier];
    }
  }

  // Tallas 2XL
  if (['2XL'].includes(sizeNormalized) && model.pricing.plus2XL) {
    const tier = isWhite ? model.pricing.plus2XL.white : model.pricing.plus2XL.colores;
    return tier[pricingTier];
  }

  // Tallas estándar (XS, S, M, L, XL, 2XS)
  const standardTier = isWhite ? model.pricing.standard.white : model.pricing.standard.colores;
  return standardTier[pricingTier];
}
