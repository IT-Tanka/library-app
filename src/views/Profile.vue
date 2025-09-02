<template>
  <v-container>
    <v-card>
      <v-card-title>{{ $t('profile') }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="user.email" :label="$t('email')" readonly />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';

const { t } = useI18n({ useScope: 'global' });
const authStore = useAuthStore();

const user = ref({ email: '' });

onMounted(async () => {
  const profile = await authStore.getProfile();
  user.value = { email: profile.email || '' };
});
</script>
