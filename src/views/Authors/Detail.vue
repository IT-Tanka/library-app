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
          <v-btn type="submit" :disabled="v$.$invalid" class="mr-2">{{ $t('save') }}</v-btn>
          <v-btn v-if="isEditing" color="error" @click="deleteAuthor" class="mr-2">{{ $t('delete') }}</v-btn>
          <v-btn @click="goBack">{{ $t('back') }}</v-btn>
        </v-form>
        <div v-else>
          <p class="mb-4"><strong>{{ $t('name') }}:</strong> {{ author.name }}</p>
          <p class="mb-4"><strong>{{ $t('note') }}:</strong> {{ author.note || $t('noNote') }}</p>
          <v-btn color="primary" @click="startEditing" class="mr-2">{{ $t('edit') }}</v-btn>
          <v-btn color="error" @click="deleteAuthor" class="mr-2">{{ $t('delete') }}</v-btn>
          <v-btn @click="goBack">{{ $t('back') }}</v-btn>
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
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthorsStore } from '@/stores/authors';
import { useBooksStore } from '@/stores/books';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import type { ErrorObject } from '@vuelidate/core';

interface Author {
  name: string;
  note: string;
}

const { t } = useI18n({ useScope: 'global' });
const route = useRoute();
const router = useRouter();
const authorsStore = useAuthorsStore();
const booksStore = useBooksStore();

const authorId = computed(() => Number(route.params.id));
const author = ref<Author>({ name: '', note: '' });
const isEditing = ref(route.params.id !== 'new');
const isViewMode = ref(true);
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('error');

const rules = {
  name: { required: required },
  // note optional
};

const v$ = useVuelidate(rules, author);

const authorBooks = computed(() =>
  booksStore.books.filter(book => book.authorId === authorId.value)
);

onMounted(async () => {
  await booksStore.fetchBooks();
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
    if (isEditing.value) {
      await authorsStore.updateAuthor(authorId.value, author.value);
    } else {
      await authorsStore.createAuthor(author.value);
    }
    snackbarText.value = t('success.saved');
    snackbarColor.value = 'success';
    snackbar.value = true;
    isViewMode.value = true;
    if (!isEditing.value) {
      router.push('/authors');
    }
  } catch {
    snackbarText.value = t('error.save_failed');
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
}

async function deleteAuthor() {
  try {
    await authorsStore.deleteAuthor(authorId.value);
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