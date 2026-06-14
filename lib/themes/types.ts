export interface ThemeEngineConfig {
  particleDensity: 'low' | 'medium' | 'high';
  motionBehavior: 'drift' | 'pulse' | 'float' | 'fall';
  backgroundLayer: 'gradient' | 'noise' | 'animated-gradient';
  emotionalIntensity: 'soft' | 'medium' | 'deep';
  particleShape: 'petal' | 'star' | 'balloon' | 'ember' | 'circle' | 'bear' | 'emoji' | 'money' | 'birthday-balloon';
}

export interface FadeTheme {
  id: string;
  name: string;
  description: string;
  background: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  themeEngine: ThemeEngineConfig;
  pacing: {
    introDelay: number;
    typingSpeed: number;
    pauseBetweenSteps: number;
  };
  previewGradient: string;
  signOff: string;
  brandFooter: string;
}
