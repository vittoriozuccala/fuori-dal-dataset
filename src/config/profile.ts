import type { ImageMetadata } from 'astro';
import defaultAvatar from '../assets/profile.jpg';

/**
 * Allowed social entry keys in profile configuration.
 */
export type ProfileSocialKey = 'github' | 'x' | 'email' | 'website';

/**
 * One social link item rendered on `/about`.
 */
export interface ProfileSocialLink {
  key: ProfileSocialKey;
  label: string;
  url: string;
}

/**
 * Personal profile settings used by About page and article author schema.
 */
export interface ProfileConfig {
  /**
   * Optional avatar URL for About page and structured data.
   */
  avatar?: string | ImageMetadata;
  /**
   * Display name used across the site.
   */
  name: string;
  /**
   * Short headline/title shown on About page.
   */
  title: string;
  /**
   * Short bio text shown on About page and in schema.
   */
  bio: string;
  /**
   * Optional location text.
   */
  location?: string;
  /**
   * Optional contact email.
   */
  email?: string;
  /**
   * Personal GitHub profile URL (separate from repo URL).
   */
  githubProfileUrl: string;
  /**
   * Social links displayed in About page social row.
   */
  socials: ProfileSocialLink[];
}

export const profileConfig: ProfileConfig = {
  avatar: defaultAvatar,
  name: 'Vittorio Zuccalà',
  title: 'Tecnologia, automazione e intelligenza artificiale',
  bio: 'Vivo di automazione: agenti AI, script, VPS e domotica. Qui scrivo di informatica, intelligenza artificiale e della mia vita fuori dal dataset.',
  location: 'Settimo Torinese, Italia',
  email: 'vittorio.zuccala@gmail.com',
  githubProfileUrl: 'https://github.com/vittoriozuccala',
  socials: [
    { key: 'github', label: 'GitHub', url: 'https://github.com/vittoriozuccala' },
    { key: 'email', label: 'Email', url: 'mailto:vittorio.zuccala@gmail.com' },
  ],
};
