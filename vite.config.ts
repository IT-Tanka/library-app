// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueI18n from '@intlify/unplugin-vue-i18n/vite';
import vuetify from 'vite-plugin-vuetify'; // Предполагаю, что вы добавили этот плагин для Vuetify
import path from 'path';

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }), // Для корректной работы Vuetify
    vueI18n({
      include: [path.resolve(__dirname, 'src/i18n/**')], // Изменено на src/i18n/**
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});