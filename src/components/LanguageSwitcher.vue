<template>
  <v-select 
    v-model="locale" 
    :items="locales" 
    :label="label" 
    density="compact" 
    hide-details 
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed, watch, onMounted } from 'vue';

const props = defineProps<{ label?: string }>();

const { locale, availableLocales } = useI18n({ useScope: 'global' });

const locales = computed(() =>
  availableLocales.map((l) => ({ title: l.toUpperCase(), value: l }))
);

onMounted(() => {
  const savedLocale = localStorage.getItem('locale');
  if (savedLocale && availableLocales.includes(savedLocale)) {
    locale.value = savedLocale;
  }
});

watch(locale, (newLocale) => {
  localStorage.setItem('locale', newLocale);
});
</script>
