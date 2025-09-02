<template>
  <v-container>
    <v-card>
      <v-card-title>{{ isEditing ? (isViewMode ? $t('viewBook') : $t('editBook')) : $t('addBook') }}</v-card-title>
      <v-card-text>
        <v-form v-if="!isViewMode" @submit.prevent="saveBook">
          <v-text-field v-model="book.title" :label="$t('title')"
            :error-messages="v$.title.$errors.map((e: ErrorObject) => String(e.$message))" class="mb-4" />
          <v-select v-model="book.authorId"
            :items="authorsStore.authors.map((a: { id: number; name: string }) => ({ title: a.name, value: a.id }))"
            :label="$t('author')" :error-messages="v$.authorId.$errors.map((e: ErrorObject) => String(e.$message))"
            class="mb-4" />
          <v-textarea v-model="book.note" :label="$t('note')" class="mb-4" />
          <v-btn type="submit" :disabled="v$.$invalid || book.authorId === null" class="mr-2">{{ $t('save') }}</v-btn>
          <v-btn v-if="isEditing" color="error" @click="deleteBook" class="mr-2">{{ $t('delete') }}</v-btn>
          <v-btn @click="goBack">{{ $t('back') }}</v-btn>
        </v-form>
        <div v-else>
          <p class="mb-4"><strong>{{ $t('title') }}:</strong> {{ book.title }}</p>
          <p class="mb-4"><strong>{{ $t('author') }}:</strong> {{ selectedAuthor?.name || 'Unknown' }}</p>
          <p class="mb-4"><strong>{{ $t('note') }}:</strong> {{ book.note || $t('noNote') }}</p>
          <v-btn color="primary" @click="startEditing" class="mr-2">{{ $t('edit') }}</v-btn>
          <v-btn color="error" @click="deleteBook" class="mr-2">{{ $t('delete') }}</v-btn>
          <v-btn @click="goBack">{{ $t('back') }}</v-btn>
        </div>
      </v-card-text>
      <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
        {{ snackbarText }}
        <template #actions>
          <v-btn color="white" @click="snackbar = false">{{ $t('close') }}</v-btn>
        </template>
      </v-snackbar>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useBooksStore } from '@/stores/books';
import { useAuthorsStore } from '@/stores/authors';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import type { ErrorObject } from '@vuelidate/core';

interface Book {
  title: string;
  authorId: number | null;
  note: string;
}

const { t } = useI18n({ useScope: 'global' });
const route = useRoute();
const router = useRouter();
const booksStore = useBooksStore();
const authorsStore = useAuthorsStore();

const bookId = computed(() => Number(route.params.id));
const book = ref<Book>({ title: '', authorId: null, note: '' });
const isEditing = ref(route.params.id !== 'new');
const isViewMode = ref(true);
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('error');

const selectedAuthor = computed(() =>
  authorsStore.authors.find(a => a.id === book.value.authorId)
);

const rules = {
  title: { required: required },
  authorId: { required: required },
  // note optional
};

const v$ = useVuelidate(rules, book);

onMounted(async () => {
  await authorsStore.fetchAuthors();
  if (isEditing.value) {
    const fetchedBook = await booksStore.fetchBook(bookId.value);
    book.value = { title: fetchedBook.title, authorId: fetchedBook.author?.id ?? null, note: fetchedBook.note };
    isViewMode.value = true;
  } else {
    isViewMode.value = false;
  }
});

function startEditing() {
  isViewMode.value = false;
}

async function saveBook() {
  v$.value.$touch();
  if (v$.value.$invalid || book.value.authorId === null) return;

  try {
    const bookData = { title: book.value.title, authorId: book.value.authorId, note: book.value.note };
    if (isEditing.value) {
      await booksStore.updateBook(bookId.value, bookData);
    } else {
      await booksStore.createBook(bookData);
    }
    snackbarText.value = t('success.saved');
    snackbarColor.value = 'success';
    snackbar.value = true;
    isViewMode.value = true;
    if (!isEditing.value) {
      router.push('/books');
    }
  } catch {
    snackbarText.value = t('error.save_failed');
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
}

async function deleteBook() {
  try {
    await booksStore.deleteBook(bookId.value);
    router.push('/books');
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