import {defineConfig} from 'vite';

export default defineConfig({
  base:'./', // Capacitor ve dosyadan açılış için göreli yollar
  test:{include:['testler/**/*.test.js'],environment:'node'}
});
