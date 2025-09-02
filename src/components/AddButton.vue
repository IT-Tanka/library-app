<template>
  <v-btn color="primary" @click="$emit('click')" :disabled="props.disabled" class="mb-4">
    <v-icon v-if="isMobile">mdi-plus</v-icon>
    <span v-else>{{ props.label }}</span>
  </v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDisplay } from 'vuetify';

const props = defineProps<{
  label: string;
  disabled?: boolean;
}>();

defineEmits(['click']);

const { smAndDown } = useDisplay();
const isMobile = computed(() => smAndDown.value);
</script>
