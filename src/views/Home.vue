<template>
  <v-container class="d-flex justify-center" style="min-height: 420px">
    <v-card width="400" class="mt-12">
      <v-tabs v-model="activeTab" color="primary">
        <v-tab value="login">{{ $t('login') }}</v-tab>
        <v-tab value="register">{{ $t('register') }}</v-tab>
      </v-tabs>

      <v-card-text>
        <v-alert
          v-if="error"
          type="error"
          class="mb-4"
          :closable="true"
          :icon="false"
          @update:modelValue="error = null"
        >
          {{ error }}
        </v-alert>

        <!-- Login form -->
        <v-form v-if="activeTab === 'login'" @submit.prevent="login">
          <v-text-field
            v-model="loginForm.email"
            :label="$t('email')"
            :rules="[rules.required, rules.email]"
          />
          <v-text-field
            v-model="loginForm.password"
            :label="$t('password')"
            type="password"
            :rules="[rules.required]"
          />
          <v-btn type="submit" color="primary" block>{{ $t('login') }}</v-btn>
        </v-form>

        <!-- Registration form -->
        <v-form v-else @submit.prevent="register">
          <v-text-field
            v-model="registerForm.email"
            :label="$t('email')"
            :rules="[rules.required, rules.email]"
          />
          <v-text-field
            v-model="registerForm.password"
            :label="$t('password')"
            type="password"
            :rules="[rules.required, rules.minLength]"
          />
          <v-text-field
            v-model="registerForm.confirmPassword"
            :label="$t('confirmPassword')"
            type="password"
            :rules="[rules.required, rules.sameAsPassword]"
          />
          <v-btn type="submit" color="primary" block>{{ $t('register') }}</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref('login');
const error = ref<string | null>(null);

const loginForm = ref({
  email: '',
  password: '',
});

const registerForm = ref({
  email: '',
  password: '',
  confirmPassword: '',
});

const rules = {
  required: (value: string) => !!value || t('validation.required'),
  email: (value: string) => /.+@.+\..+/.test(value) || t('validation.email'),
  minLength: (value: string) => value.length >= 6 || t('validation.minLength', { length: 6 }),
  sameAsPassword: (value: string) => value === registerForm.value.password || t('validation.sameAsPassword'),
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/books');
  }
});

watch(activeTab, () => {
  error.value = null; // Clear the error when switching tabs
});

const login = async () => {
  error.value = null;
  try {
    await authStore.login(loginForm.value.email, loginForm.value.password);
    router.push('/books');
  } catch (err: any) {
    error.value = t(`error.${err.message}`) || t('error.login_failed');
  }
};

const register = async () => {
  error.value = null;
  try {
    await authStore.register(registerForm.value.email, registerForm.value.password);
    router.push('/books');
  } catch (err: any) {
    error.value = t(`error.${err.message}`) || t('error.register_failed');
  }
};
</script>