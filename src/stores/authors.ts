import { defineStore } from 'pinia';
import { ref } from 'vue';

interface Author {
  id: number;
  name: string;
  note: string; 
}

export const useAuthorsStore = defineStore('authors', () => {
  const authors = ref<Author[]>([]);

  function saveToLocalStorage(email: string) {
    localStorage.setItem(`authors_${email}`, JSON.stringify(authors.value));
  }

  async function initializeAuthors(email: string) {
    const stored = localStorage.getItem(`authors_${email}`);
    if (stored) {
      authors.value = JSON.parse(stored);
      return;
    }
    try {
      const response = await fetch('/db.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      authors.value = (data.authors || []).map((a: any) => ({ ...a, note: a.note || '' }));
      saveToLocalStorage(email);
    } catch (error) {
      console.error('Failed to load db.json:', error);
      authors.value = [
        { id: 1, name: 'J.K. Rowling', note: '' },
        { id: 2, name: 'George R.R. Martin', note: '' },
      ];
      saveToLocalStorage(email);
    }
  }

  async function fetchAuthors(): Promise<Author[]> {
    return authors.value;
  }

  async function fetchAuthor(id: number): Promise<Author> {
    const author = authors.value.find((a) => a.id === id);
    if (!author) {
      throw new Error('author_not_found');
    }
    return author;
  }

  async function createAuthor(author: { name: string; note: string }, email: string): Promise<Author> {
    const newId = authors.value.length > 0 ? Math.max(...authors.value.map((a) => a.id)) + 1 : 1;
    const newAuthor = { id: newId, name: author.name, note: author.note };
    authors.value.push(newAuthor);
    saveToLocalStorage(email);
    return newAuthor;
  }

  async function updateAuthor(id: number, author: { name: string; note: string }, email: string): Promise<Author> {
    const index = authors.value.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error('author_not_found');
    }
    authors.value[index] = { id, name: author.name, note: author.note };
    saveToLocalStorage(email);
    return authors.value[index];
  }

  async function deleteAuthor(id: number, email: string) {
    const index = authors.value.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error('author_not_found');
    }
    authors.value.splice(index, 1);
    saveToLocalStorage(email);
  }

  return { authors, initializeAuthors, fetchAuthors, fetchAuthor, createAuthor, updateAuthor, deleteAuthor };
});
