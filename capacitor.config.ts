import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wolvesofdelivery.app',
  appName: 'Wolves of Delivery',
  webDir: 'dist/wolvesofdelivery/browser',
  server: {
    androidScheme: 'https'
  }
};

export default config;