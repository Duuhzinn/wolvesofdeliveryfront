import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wolvesofdelivery.app',
  appName: 'Wolves of Delivery',
  webDir: 'dist/wolvesofdelivery/browser',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    BackgroundRunner: {
      label: 'com.wolvesofdelivery.background',
      src: 'runner.js',
      event: 'backgroundFetch',
      repeat: true,
      interval: 1,
      autoStart: false,
    }
  }
};

export default config;