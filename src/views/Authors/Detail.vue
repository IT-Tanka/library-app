<template>
  <v-container>
    <v-card>
      <v-card-title>{{ isEditing ? (isViewMode ? $t('viewAuthor') : $t('editAuthor')) : $t('addAuthor')
        }}</v-card-title>
      <v-card-text>
        <v-form v-if="!isViewMode" @submit.prevent="saveAuthor">
          <v-text-field v-model="author.name" :label="$t('name')"
            :error-messages="v$.name.$errors.map((e: ErrorObject) => String(e.$message))" class="mb-4" />
          <v-textarea v-model="author.note" :label="$t('note')" class="mb-4" />
          <v-btn type="submit" :disabled="v$.$invalid" class="mr-2">
            <v-icon v-if="isMobile">mdi-content-save</v-icon>
            <span v-else>{{ $t('save') }}</span>
          </v-btn>
          <v-btn v-if="isEditing" color="error" @click="confirmDeleteAuthor" class="mr-2">
            <v-icon v-if="isMobile">mdi-delete</v-icon>
            <span v-else>{{ $t('delete') }}</span>
          </v-btn>
          <v-btn @click="goBack">
            <v-icon v-if="isMobile">mdi-arrow-left</v-icon>
            <span v-else>{{ $t('back') }}</span>
          </v-btn>
        </v-form>
        <div v-else>
          <p class="mb-4"><strong>{{ $t('name') }}:</strong> {{ author.name }}</p>
          <p class="mb-4"><strong>{{ $t('note') }}:</strong> {{ author.note || $t('noNote') }}</p>
          <v-btn color="primary" @click="startEditing" class="mr-2">
            <v-icon v-if="isMobile">mdi-pencil</v-icon>
            <span v-else>{{ $t('edit') }}</span>
          </v-btn>
          <v-btn color="error" @click="confirmDeleteAuthor" class="mr-2">
            <v-icon v-if="isMobile">mdi-delete</v-icon>
            <span v-else>{{ $t('delete') }}</span>
          </v-btn>
          <v-btn @click="goBack">
            <v-icon v-if="isMobile">mdi-arrow-left</v-icon>
            <span v-else>{{ $t('back') }}</span>
          </v-btn>
        </div>
        <v-divider class="my-4" />
        <v-card-subtitle>{{ $t('booksByAuthor') }}</v-card-subtitle>
        <v-list>
          <v-list-item v-for="book in authorBooks" :key="book.id" :to="`/books/${book.id}`">
            {{ book.title }}
          </v-list-item>
          <v-list-item v-if="authorBooks.length === 0">{{ $t('noBooks') }}</v-list-item>
        </v-list>
      </v-card-text>
      <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
        {{ snackbarText }}
        <template #actions>
          <v-btn color="white" @click="snackbar = false">{{ $t('close') }}</v-btn>
        </template>
      </v-snackbar>
      <v-dialog v-model="deleteDialog" max-width="300">
        <v-card>
          <v-card-title>{{ $t('delete') }}?</v-card-title>
          <v-card-actions>
            <v-btn color="error" @click="deleteAuthor">{{ $t('delete') }}</v-btn>
            <v-btn @click="deleteDialog = false">{{ $t('close') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthorsStore } from '@/stores/authors';
import { useBooksStore } from '@/stores/books';
import { useAuthStore } from '@/stores/auth';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import type { ErrorObject } from '@vuelidate/core';
import { useDisplay } from 'vuetify';

interface Author {
  name: string;
  note: string;
}

const { t } = useI18n({ useScope: 'global' });
const route = useRoute();
const router = useRouter();
const authorsStore = useAuthorsStore();
const booksStore = useBooksStore();
const authStore = useAuthStore();
const { smAndDown } = useDisplay();

const authorId = computed(() => Number(route.params.id));
const author = ref<Author>({ name: '', note: '' });
const isEditing = ref(route.params.id !== 'new');
const isViewMode = ref(true);
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('error');
const deleteDialog = ref(false);
const isMobile = computed(() => smAndDown.value);

const rules = {
  name: { required: required },
  // note optional
};

const v$ = useVuelidate(rules, author);

const authorBooks = computed(() =>
  booksStore.books.filter(book => book.authorId === authorId.value)
);

onMounted(async () => {
  await booksStore.fetchBooks(authStore.user?.email || '');
  if (isEditing.value) {
    const fetchedAuthor = await authorsStore.fetchAuthor(authorId.value);
    author.value = { name: fetchedAuthor.name, note: fetchedAuthor.note };
    isViewMode.value = true;
  } else {
    isViewMode.value = false;
  }
});

function startEditing() {
  isViewMode.value = false;
}

async function saveAuthor() {
  v$.value.$touch();
  if (v$.value.$invalid) return;

  try {
    let savedAuthor;
    if (isEditing.value) {
      savedAuthor = await authorsStore.updateAuthor(authorId.value, author.value, authStore.user?.email || '');
    } else {
      savedAuthor = await authorsStore.createAuthor(author.value, authStore.user?.email || '');
      router.replace(`/authors/${savedAuthor.id}`);
      isEditing.value = true;
    }
    snackbarText.value = t('success.saved');
    snackbarColor.value = 'success';
    snackbar.value = true;
    isViewMode.value = true;
  } catch {
    snackbarText.value = t('error.save_failed');
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
}

function confirmDeleteAuthor() {
  deleteDialog.value = true;
}

async function deleteAuthor() {
  deleteDialog.value = false;
  try {
    await authorsStore.deleteAuthor(authorId.value, authStore.user?.email || '');
    router.push('/authors');
  } catch {
    snackbarText.value = t('error.delete_failed');
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
}

function goBack() {
  router.back();
}
</script>