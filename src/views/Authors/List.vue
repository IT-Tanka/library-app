<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="6">
        <SearchBar v-model="searchQuery" />
      </v-col>
      <v-col cols="12" sm="6" class="text-right">
        <AddButton :label="$t('addAuthor')" @click="addAuthor" />
      </v-col>
    </v-row>

    <v-data-table :items="filteredAuthors" :headers="[{ title: $t('name'), key: 'name' }]" :page="page"
      :items-per-page="itemsPerPage" :server-items-length="filteredAuthors.length" @update:page="page = $event"
      @update:items-per-page="itemsPerPage = $event">
      <template #item="{ item }">
        <tr @click="goToAuthor(item.id)">
          <td>{{ item.name }}</td>
        </tr>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthorsStore } from '@/stores/authors';

import SearchBar from '@/components/SearchBar.vue';
import AddButton from '@/components/AddButton.vue';

interface Author {
  id: number;
  name: string;
}

const { t } = useI18n({ useScope: 'global' });
const authorsStore = useAuthorsStore();
const router = useRouter();

const searchQuery = ref('');
const page = ref(1);
const itemsPerPage = ref(10);

const filteredAuthors = computed(() =>
  authorsStore.authors.filter((author: Author) =>
    author.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

function goToAuthor(id: number) {
  router.push(`/authors/${id}`);
}

function addAuthor() {
  router.push('/authors/new');
}

onMounted(() => {
  authorsStore.fetchAuthors();
});
</script>

<style scoped>
@media (max-width: 600px) {
  :deep(.v-data-table-footer) {
    justify-content: center !important;
  }
}
</style>