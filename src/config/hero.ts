import defaultBackground from '../assets/blog-placeholder-1.webp';

/**
 * Hero copy and background settings for one page.
 */
export interface HeroSectionConfig {
  /**
   * Main hero headline text.
   */
  text: string;
  /**
   * Optional hero subtitle text.
   */
  subtitle?: string;
  /**
   * Hero background image URL.
   */
  backgroundImage: string;
}

/**
 * Centralized hero configuration for all top-level pages and post fallback.
 */
export interface HeroConfig {
  home: HeroSectionConfig;
  blog: HeroSectionConfig;
  tags: HeroSectionConfig;
  about: HeroSectionConfig;
  /**
   * Default hero image shared by all article pages.
   */
  postDefaultBackground: string;
}

export const heroConfig: HeroConfig = {
  home: {
    text: 'Fuori dal Dataset',
    subtitle: 'Diario, informatica e intelligenza artificiale. Appunti di un uomo che vive fuori dal dataset.',
    backgroundImage: defaultBackground.src,
  },
  blog: {
    text: 'Tutti i post',
    subtitle: 'L\'archivio della mia scrittura.',
    backgroundImage: defaultBackground.src,
  },
  tags: {
    text: 'Tag',
    subtitle: 'Esplora per argomento.',
    backgroundImage: defaultBackground.src,
  },
  about: {
    text: 'Chi sono',
    subtitle: 'Introduzione e contatti.',
    backgroundImage: defaultBackground.src,
  },
  postDefaultBackground: defaultBackground.src,
};
