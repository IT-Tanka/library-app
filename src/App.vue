<template>
  <v-app>
    <!-- Navigation bar -->
    <v-app-bar app color="primary" dark>
      <v-container class="app-container d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <!-- Menu icon only on mobile -->
          <v-app-bar-nav-icon v-if="isAuthenticated && isMobile" @click.stop="drawer = !drawer" />
          <v-toolbar-title class="app-title">
            {{ t('app_title') }}
          </v-toolbar-title>
        </div>
        <div class="d-flex align-center">
          <!-- Logout button -->
          <v-btn v-if="isAuthenticated" text class="mr-2" @click="logout">
            <v-icon v-if="isMobile">mdi-logout</v-icon>
            <span v-else>{{ t('logout') }}</span>
          </v-btn>
          <!-- Language switcher -->
          <div class="lang-switcher">
            <LanguageSwitcher :label="''" />
          </div>
        </div>
      </v-container>
    </v-app-bar>

    <!-- Main content -->
    <v-main>
      <v-container class="app-container" fluid>
        <v-row>
          <!-- Side menu inside container on large screens -->
          <v-col v-if="isAuthenticated && !isMobile" cols="12" md="3">
            <v-card class="nav-card">
              <v-list density="comfortable">
                <v-list-item v-for="item in navItems" :key="item.path" :to="item.path" link
                  :exact="item.path === '/' ? true : false" active-class="active-link">
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>

          <!-- Content -->
          <v-col :cols="isAuthenticated && !isMobile ? 9 : 12">
            <router-view />
          </v-col>

          <!-- Temporary side menu for mobile -->
          <v-navigation-drawer v-if="isAuthenticated && isMobile" v-model="drawer" temporary width="220">
            <v-list density="comfortable">
              <v-list-item v-for="item in navItems" :key="item.path" :to="item.path" link
                :exact="item.path === '/' ? true : false" active-class="active-link">
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-navigation-drawer>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';

const { t } = useI18n();
const authStore = useAuthStore();
const router = useRouter();
const { mdAndUp } = useDisplay();

const drawer = ref(false);
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isMobile = computed(() => !mdAndUp.value);

const navItems = computed(() => [
  { title: t('nav.books'), path: '/books', exact: false },
  { title: t('nav.authors'), path: '/authors', exact: false },
  { title: t('nav.profile'), path: '/profile', exact: false },
]);

async function logout() {
  await authStore.logout();
  router.push('/');
}
</script>

<style scoped>
.v-main {
  padding-top: 64px;
  background-color: rgba(250, 240, 230, 0.489);
}

@media (max-width: 600px) {
  .v-main {
    padding-top: 56px;
  }

  .app-title {
    font-size: 18px !important;
    white-space: normal !important;
    text-overflow: unset !important;
  }
}

/* Container width limitation */
.app-container {
  max-width: 1440px;
  margin: 0 auto;
}

/* Language switcher */
.lang-switcher {
  width: 90px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* Active link highlighting */
.active-link {
  background-color: rgba(255, 255, 255, 0.2) !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: bold;
}

/* Styles for navigation card on large screens */
.nav-card {
  background: rgb(var(--v-theme-surface));
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
}
</style>