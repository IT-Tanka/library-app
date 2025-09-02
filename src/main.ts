import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import vuetify from './plugins/vuetify';
import { createI18n } from 'vue-i18n';
import messages from '@intlify/unplugin-vue-i18n/messages';
import { useAuthStore } from './stores/auth';

const savedLocale = localStorage.getItem('locale') ?? 'en';

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages,
  globalInjection: true,
});

const app = createApp(App);
app.use(vuetify);
app.use(router);
app.use(createPinia());

const authStore = useAuthStore();
authStore.initialize();

app.use(i18n);
app.mount('#app');