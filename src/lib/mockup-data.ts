export interface TShirtColor {
  name_en: string;
  name_es: string;
  hex: string;
}

export interface TShirtModel {
  id: '410c' | '410d' | '410n';
  name: string;
  tag: string;
  description: string;
  colors: TShirtColor[];
}

export interface MockupSceneConfig {
  id: 'scene_wood' | 'scene_workshop';
  name: string;
  subtitle: string;
  previewUrl: string;
  defaultPos: { x: number; y: number };
  defaultTilt: number; // Perspective tilt percentage (e.g. 2 for wood, 8 for workshop)
  defaultSkew: number;
  baseScaleFactor: number;
}

export const MOCKUP_SCENES: MockupSceneConfig[] = [
  {
    id: 'scene_wood',
    name: 'Mesa de Madera Rústica',
    subtitle: 'Fotografía cenital estética sobre madera natural',
    previewUrl: '/mockups/scene_wood/Black.jpg',
    defaultPos: { x: 512, y: 560 },
    defaultTilt: 2,
    defaultSkew: 0,
    baseScaleFactor: 0.45,
  },
  {
    id: 'scene_workshop',
    name: 'Taller DTF Profesional',
    subtitle: 'Vista de producción en taller con plancha térmica',
    previewUrl: '/mockups/scene_workshop/Black.jpg',
    defaultPos: { x: 505, y: 380 },
    defaultTilt: 8,
    defaultSkew: 0,
    baseScaleFactor: 0.38,
  },
];

export const PLAYERYTEES_MODELS: Record<'410c' | '410d' | '410n', TShirtModel> = {
  '410c': {
    id: '410c',
    name: 'Caballero',
    tag: 'Playerytees 410C',
    description: 'Corte clásico unisex de alto gramaje 100% algodón pre-encogido',
    colors: [
      { name_en: 'White', name_es: 'Blanco', hex: '#FFFFFF' },
      { name_en: 'Natural', name_es: 'Natural', hex: '#ECE4D0' },
      { name_en: 'Canary Yellow', name_es: 'Amarillo Canario', hex: '#F9BA15' },
      { name_en: 'Dusty Pink', name_es: 'Palo de Rosa', hex: '#C9828A' },
      { name_en: 'Coral', name_es: 'Coral', hex: '#E95A62' },
      { name_en: 'Orange', name_es: 'Naranja', hex: '#F15423' },
      { name_en: 'Red', name_es: 'Rojo', hex: '#C81824' },
      { name_en: 'Maroon', name_es: 'Marrón / Tinto', hex: '#601824' },
      { name_en: 'Mocha', name_es: 'Moca', hex: '#584234' },
      { name_en: 'Kelly Green', name_es: 'Verde Manzana', hex: '#1DA649' },
      { name_en: 'Island Reef', name_es: 'Verde Arrecife', hex: '#4EBFA9' },
      { name_en: 'Military Green', name_es: 'Verde Militar', hex: '#414C38' },
      { name_en: 'Pacific Blue', name_es: 'Azul Pacífico', hex: '#89CDE3' },
      { name_en: 'Royal Blue', name_es: 'Azul Rey', hex: '#15479E' },
      { name_en: 'Navy Blue', name_es: 'Azul Marino', hex: '#182C4B' },
      { name_en: 'Sport Grey', name_es: 'Gris Jaspe', hex: '#B5B8B9' },
      { name_en: 'Charcoal', name_es: 'Carbón', hex: '#3E4143' },
      { name_en: 'Black', name_es: 'Negro', hex: '#1A1A1A' },
      { name_en: 'Desert Khaki', name_es: 'Caqui Safari', hex: '#C2B294' },
      { name_en: 'Pink', name_es: 'Rosa', hex: '#F3A9C1' },
      { name_en: 'Fuchsia', name_es: 'Fucsia', hex: '#CF2478' },
      { name_en: 'Purple', name_es: 'Púrpura', hex: '#6C2D7E' },
      { name_en: 'Grey Ash', name_es: 'Gris Ceniza', hex: '#686D74' }
    ]
  },
  '410d': {
    id: '410d',
    name: 'Dama',
    tag: 'Playerytees 410D',
    description: 'Corte silueta femenina entallada, suave y con gran caída',
    colors: [
      { name_en: 'White', name_es: 'Blanco', hex: '#FFFFFF' },
      { name_en: 'Natural', name_es: 'Natural', hex: '#ECE4D0' },
      { name_en: 'Dusty Pink', name_es: 'Palo de Rosa', hex: '#C9828A' },
      { name_en: 'Coral', name_es: 'Coral', hex: '#E95A62' },
      { name_en: 'Orange', name_es: 'Naranja', hex: '#F15423' },
      { name_en: 'Red', name_es: 'Rojo', hex: '#C81824' },
      { name_en: 'Maroon', name_es: 'Marrón / Tinto', hex: '#601824' },
      { name_en: 'Island Reef', name_es: 'Verde Arrecife', hex: '#4EBFA9' },
      { name_en: 'Pacific Blue', name_es: 'Azul Pacífico', hex: '#89CDE3' },
      { name_en: 'Navy Blue', name_es: 'Azul Marino', hex: '#182C4B' },
      { name_en: 'Sport Grey', name_es: 'Gris Jaspe', hex: '#B5B8B9' },
      { name_en: 'Black', name_es: 'Negro', hex: '#1A1A1A' },
      { name_en: 'Canary Yellow', name_es: 'Amarillo Canario', hex: '#F9BA15' },
      { name_en: 'Pink', name_es: 'Rosa', hex: '#F3A9C1' },
      { name_en: 'Fuchsia', name_es: 'Fucsia', hex: '#CF2478' },
      { name_en: 'Purple', name_es: 'Púrpura', hex: '#6C2D7E' },
      { name_en: 'Kelly Green', name_es: 'Verde Manzana', hex: '#1DA649' },
      { name_en: 'Royal Blue', name_es: 'Azul Rey', hex: '#15479E' },
      { name_en: 'Mocha', name_es: 'Moca', hex: '#584234' }
    ]
  },
  '410n': {
    id: '410n',
    name: 'Niños / Juvenil',
    tag: 'Playerytees 410N',
    description: 'Corte infantil de gran durabilidad y colores vivos para los peques',
    colors: [
      { name_en: 'White', name_es: 'Blanco', hex: '#FFFFFF' },
      { name_en: 'Canary Yellow', name_es: 'Amarillo Canario', hex: '#F9BA15' },
      { name_en: 'Pink', name_es: 'Rosa', hex: '#F3A9C1' },
      { name_en: 'Fuchsia', name_es: 'Fucsia', hex: '#CF2478' },
      { name_en: 'Purple', name_es: 'Púrpura', hex: '#6C2D7E' },
      { name_en: 'Red', name_es: 'Rojo', hex: '#C81824' },
      { name_en: 'Kelly Green', name_es: 'Verde Manzana', hex: '#1DA649' },
      { name_en: 'Royal Blue', name_es: 'Azul Rey', hex: '#15479E' },
      { name_en: 'Navy Blue', name_es: 'Azul Marino', hex: '#182C4B' },
      { name_en: 'Sport Grey', name_es: 'Gris Jaspe', hex: '#B5B8B9' },
      { name_en: 'Black', name_es: 'Negro', hex: '#1A1A1A' },
      { name_en: 'Natural', name_es: 'Natural', hex: '#ECE4D0' },
      { name_en: 'Dusty Pink', name_es: 'Palo de Rosa', hex: '#C9828A' },
      { name_en: 'Coral', name_es: 'Coral', hex: '#E95A62' },
      { name_en: 'Orange', name_es: 'Naranja', hex: '#F15423' },
      { name_en: 'Island Reef', name_es: 'Verde Arrecife', hex: '#4EBFA9' },
      { name_en: 'Pacific Blue', name_es: 'Azul Pacífico', hex: '#89CDE3' }
    ]
  }
};

/**
 * Returns the path to the static scene background image for a given scene and color.
 */
export function getMockupSceneImagePath(sceneId: 'scene_wood' | 'scene_workshop', colorEn: string): string {
  const safeName = colorEn.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `/mockups/${sceneId}/${safeName}.jpg`;
}
