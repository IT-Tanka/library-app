<template>
    <v-text-field density="compact" :model-value="props.modelValue"
        @update:model-value="emit('update:modelValue', $event)" :label="label || $t('search')"
        prepend-inner-icon="mdi-magnify" :disabled="props.disabled" variant="solo" />
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
    modelValue: string;
    label?: string;
    disabled?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);
</script>
