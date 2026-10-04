export type PopupTheme =
  | "halloween"
  | "dia_muertos"
  | "navidad"
  | "ano_nuevo"
  | "dia_reyes"
  | "dia_madre"
  | "dia_maestro"
  | "dia_nino"
  | "general";

export interface PopupSlide {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  badge?: string;
  linkUrl: string;
}

export interface PopupConfig {
  isActive: boolean;
  theme: PopupTheme;
  title: string;
  subtitle?: string;
  buttonText?: string;
  slides: PopupSlide[];
  autoPlayInterval: number; // in seconds (e.g. 4), 0 to disable
  displayFrequency: "always" | "once_session" | "once_day";
  updatedAt: string;
}
