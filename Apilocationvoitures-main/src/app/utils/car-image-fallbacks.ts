import { Car } from "../types";

const MODEL_IMAGE_FALLBACKS: Record<string, string[]> = {
  "hyundai:tucson": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/2021_Hyundai_Tucson_%28NX4%29_1.6_T-GDi_HEV.jpg/800px-2021_Hyundai_Tucson_%28NX4%29_1.6_T-GDi_HEV.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Hyundai_Tucson_NX4_IMG_3872.jpg/800px-Hyundai_Tucson_NX4_IMG_3872.jpg"
  ],
  "honda:civic": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/2017_Honda_Civic_SR_VTEC_CVT_1.0_Front.jpg/800px-2017_Honda_Civic_SR_VTEC_CVT_1.0_Front.jpg"
  ],
  "toyota:rav4": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/2018_Toyota_RAV4_Excel_HEV_CVT_2.5_Front.jpg/800px-2018_Toyota_RAV4_Excel_HEV_CVT_2.5_Front.jpg"
  ],
  "peugeot:208": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/2014_Peugeot_308_Active_e-HDi_115_1.6.jpg/800px-2014_Peugeot_308_Active_e-HDi_115_1.6.jpg"
  ]
};

const MAKE_IMAGE_FALLBACKS: Record<string, string[]> = {
  toyota: [
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=1000"
  ],
  hyundai: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/2021_Hyundai_Tucson_%28NX4%29_1.6_T-GDi_HEV.jpg/800px-2021_Hyundai_Tucson_%28NX4%29_1.6_T-GDi_HEV.jpg"
  ],
  honda: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/2017_Honda_Civic_SR_VTEC_CVT_1.0_Front.jpg/800px-2017_Honda_Civic_SR_VTEC_CVT_1.0_Front.jpg"
  ],
  peugeot: [
    "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=1000"
  ],
  mercedes: [
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1000"
  ],
  renault: [
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1000"
  ]
};

const CATEGORY_IMAGE_FALLBACKS: Record<string, string[]> = {
  suv: [
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=1000"
  ],
  berline: [
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000"
  ],
  citadine: [
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000"
  ]
};

export function getCarImageFallbacks(car: Pick<Car, "make" | "model" | "category" | "images">) {
  const makeKey = car.make.toLowerCase();
  const modelKey = `${makeKey}:${car.model.toLowerCase()}`;
  const categoryKey = car.category.toLowerCase();

  return [
    ...car.images.slice(1),
    ...(MODEL_IMAGE_FALLS_BACKS_SAFE(modelKey)),
    ...(MAKE_IMAGE_FALLBACKS[makeKey] || []),
    ...(CATEGORY_IMAGE_FALLBACKS[categoryKey] || [])
  ];
}

function MODEL_IMAGE_FALLS_BACKS_SAFE(key: string) {
  return MODEL_IMAGE_FALLBACKS[key] || [];
}
