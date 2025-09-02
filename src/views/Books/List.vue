<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="6">
        <SearchBar v-model="searchQuery" :disabled="loading" />
      </v-col>
      <v-col cols="12" sm="6" class="text-right">
        <AddButton :label="$t('addBook')" @click="addBook" :disabled="loading" />
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
    <v-progress-linear v-if="loading" indeterminate color="primary" />

    <v-data-table v-else :items="filteredBooks" :headers="[
      { title: $t('title'), key: 'title' },
      { title: $t('author'), key: 'author.name' },
    ]" :page="page" :items-per-page="itemsPerPage" :server-items-length="filteredBooks.length"
      @update:page="page = $event" @update:items-per-page="itemsPerPage = $event">
      <template #item="{ item }">
        <tr @click="goToBook(item.id)">
          <td>{{ item.title }}</td>
          <td>{{ item.author?.name || 'Unknown' }}</td>
        </tr>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useBooksStore } from '@/stores/books';
import { useAuthorsStore } from '@/stores/authors';

import SearchBar from '@/components/SearchBar.vue';
import AddButton from '@/components/AddButton.vue';

const { t } = useI18n({ useScope: 'global' });
const booksStore = useBooksStore();
const authorsStore = useAuthorsStore();
const router = useRouter();

const searchQuery = ref('');
const page = ref(1);
const itemsPerPage = ref(10);
const error = ref<string | null>(null);
const loading = ref(false);

const filteredBooks = computed(() => {
  return booksStore.books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

watch(filteredBooks, () => {
  if (page.value > Math.ceil(filteredBooks.value.length / itemsPerPage.value)) {
    page.value = 1; // Reset to the first page if the current page is unavailable
  }
});

function goToBook(id: number) {
  router.push(`/books/${id}`);
}

function addBook() {
  router.push('/books/new');
}

onMounted(async () => {
  loading.value = true;
  try {
    await authorsStore.initializeAuthors();
    await booksStore.initializeBooks();
    await booksStore.fetchBooks();
  } catch (err: any) {
    error.value = t(`error.${err.message}`) || t('error.load_failed');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
@media (max-width: 600px) {
  :deep(.v-data-table-footer) {
    justify-content: center !important;
  }
}
</style>