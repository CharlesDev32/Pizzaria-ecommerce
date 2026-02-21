export interface StoreSettingsColors {
  navy: string;
  navy2: string;
  red: string;
  red2: string;
  yellow: string;
  gray: string;
  white: string;
}

export interface StoreBannerSettings {
  enabled: boolean;
  textTop: string;
  textBottom: string;
  subtitle: string;
  imageUrl: string;
  sideImageUrl: string;
  imageOpacity: number;
  height: number;
  overlayColor: string;
  overlayOpacity: number;
  fontFamily: string;
  fontSize: number;
  wordColors: string[];
}

export interface StoreSettings {
  brandName: string;
  showBrandName: boolean;
  logoUrl: string;
  logoSize: number;
  heroImageUrl: string;
  backgroundImageUrl: string;
  backgroundImageOpacity: number;
  colors: StoreSettingsColors;
  fontBody: string;
  fontHeading: string;
  banner: StoreBannerSettings;
}

export const FONT_BODY_OPTIONS = [
  'Poppins',
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Nunito',
] as const;

export const FONT_HEADING_OPTIONS = [
  'Bebas Neue',
  'Anton',
  'Montserrat Extra Bold',
  'Montserrat',
  'Oswald',
  'Raleway',
  'Playfair Display',
] as const;

export const BANNER_FONT_OPTIONS = [
  'Oswald',
  'Montserrat',
  'Anton',
  'Bebas Neue',
  'Poppins',
  'Nunito',
  'Open Sans',
  'Lato',
] as const;

const FONT_FAMILY_ALIASES: Record<string, string> = {
  'Montserrat Extra Bold': 'Montserrat',
};

export function resolveFontFamily(font: string): string {
  return FONT_FAMILY_ALIASES[font] ?? font;
}

export function resolveHeadingFontWeight(font: string): number {
  return font === 'Montserrat Extra Bold' ? 800 : 700;
}

export const DEFAULT_SETTINGS: StoreSettings = {
  brandName: 'Sabor Express',
  showBrandName: false,
  logoUrl: '/brand/logo.svg',
  logoSize: 52,
  heroImageUrl: '/brand/hero.svg',
  backgroundImageUrl: '',
  backgroundImageOpacity: 10,
  colors: {
    navy: '#090807',
    navy2: '#19100F',
    red: '#D0121F',
    red2: '#A60D18',
    yellow: '#F2DDBC',
    gray: '#D3C2AA',
    white: '#FFF7EA',
  },
  fontBody: 'Nunito',
  fontHeading: 'Oswald',
  banner: {
    enabled: true,
    textTop: 'Fome?',
    textBottom: 'Pede que chega rápido.',
    subtitle: 'Seu pedido em poucos cliques, com entrega por bairro e agendamento.',
    imageUrl: '',
    sideImageUrl: '',
    imageOpacity: 34,
    height: 230,
    overlayColor: '#090807',
    overlayOpacity: 58,
    fontFamily: 'Oswald',
    fontSize: 44,
    wordColors: ['#F2DDBC', '#FFF7EA', '#D0121F', '#F2DDBC', '#FFF7EA', '#D3C2AA'],
  },
};
