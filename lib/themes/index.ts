import { FadeTheme } from './types';

export const themes: FadeTheme[] = [
  {
    id: 'romantic-roses',
    name: 'Eternal Rose',
    description: 'Crimson petals drift through the air',
    background: '#0d0508',
    palette: {
      primary: '#e8184f',
      secondary: '#c41230',
      accent: '#ff6b8a',
    },
    themeEngine: {
      particleDensity: 'medium',
      motionBehavior: 'fall',
      backgroundLayer: 'gradient',
      emotionalIntensity: 'deep',
      particleShape: 'petal',
    },
    pacing: {
      introDelay: 1.2,
      typingSpeed: 80,
      pauseBetweenSteps: 1500,
    },
    previewGradient: 'linear-gradient(135deg, #0d0508 0%, #2d0a15 50%, #1a0510 100%)',
  },
  {
    id: 'magic-stars',
    name: 'Starfall',
    description: 'A constellation written just for you',
    background: '#04050f',
    palette: {
      primary: '#a78bfa',
      secondary: '#7c3aed',
      accent: '#c4b5fd',
    },
    themeEngine: {
      particleDensity: 'high',
      motionBehavior: 'drift',
      backgroundLayer: 'animated-gradient',
      emotionalIntensity: 'soft',
      particleShape: 'star',
    },
    pacing: {
      introDelay: 1.0,
      typingSpeed: 70,
      pauseBetweenSteps: 1200,
    },
    previewGradient: 'linear-gradient(135deg, #04050f 0%, #0d0b2a 50%, #080516 100%)',
  },
  {
    id: 'love-balloons',
    name: 'Float Away',
    description: 'Let your heart rise above',
    background: '#0a0a12',
    palette: {
      primary: '#f472b6',
      secondary: '#db2777',
      accent: '#fbbf24',
    },
    themeEngine: {
      particleDensity: 'low',
      motionBehavior: 'float',
      backgroundLayer: 'animated-gradient',
      emotionalIntensity: 'medium',
      particleShape: 'balloon',
    },
    pacing: {
      introDelay: 1.4,
      typingSpeed: 90,
      pauseBetweenSteps: 1800,
    },
    previewGradient: 'linear-gradient(135deg, #0a0a12 0%, #1a0a1a 50%, #120a1a 100%)',
  },
  {
    id: 'sunset-glow',
    name: 'Ember Dusk',
    description: 'Warm embers at the edge of night',
    background: '#0f0700',
    palette: {
      primary: '#f97316',
      secondary: '#dc2626',
      accent: '#fbbf24',
    },
    themeEngine: {
      particleDensity: 'medium',
      motionBehavior: 'pulse',
      backgroundLayer: 'gradient',
      emotionalIntensity: 'deep',
      particleShape: 'ember',
    },
    pacing: {
      introDelay: 1.3,
      typingSpeed: 85,
      pauseBetweenSteps: 1400,
    },
    previewGradient: 'linear-gradient(135deg, #0f0700 0%, #1f0f00 50%, #150800 100%)',
  },
  {
    id: 'galaxy-romance',
    name: 'Infinite',
    description: 'Lost in the cosmos, found in you',
    background: '#020408',
    palette: {
      primary: '#38bdf8',
      secondary: '#0ea5e9',
      accent: '#e879f9',
    },
    themeEngine: {
      particleDensity: 'high',
      motionBehavior: 'drift',
      backgroundLayer: 'animated-gradient',
      emotionalIntensity: 'deep',
      particleShape: 'circle',
    },
    pacing: {
      introDelay: 1.1,
      typingSpeed: 75,
      pauseBetweenSteps: 1300,
    },
    previewGradient: 'linear-gradient(135deg, #020408 0%, #050d1a 50%, #080210 100%)',
  },
];

export const getTheme = (id: string): FadeTheme =>
  themes.find((t) => t.id === id) ?? themes[0];
