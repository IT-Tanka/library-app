import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthorsStore } from './authors';

interface Book {
  id: number;
  title: string;
  authorId: number;
  note: string; 
}

interface BookWithAuthor extends Book {
  author?: { id: number; name: string };
}

export const useBooksStore = defineStore('books', () => {
  const books = ref<BookWithAuthor[]>([]);

  function saveToLocalStorage() {
    localStorage.setItem('books', JSON.stringify(books.value.map(b => ({ id: b.id, title: b.title, authorId: b.authorId, note: b.note }))));
  }

  async function initializeBooks() {
    const stored = localStorage.getItem('books');
    if (stored) {
      books.value = JSON.parse(stored);
      return;
    }
    try {
      const response = await fetch('/db.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      books.value = (data.books || []).map((b: any) => ({ ...b, note: b.note || '' }));
      saveToLocalStorage();
    } catch (error) {
      console.error('Failed to load db.json:', error);
      books.value = [
        { id: 1, title: 'Harry Potter', authorId: 1, note: '' },
        { id: 2, title: 'Game of Thrones', authorId: 2, note: '' },
      ];
      saveToLocalStorage();
    }
  }

  async function fetchBooks(): Promise<BookWithAuthor[]> {
    const authorsStore = useAuthorsStore();
    if (!authorsStore.authors.length) {
      await authorsStore.initializeAuthors();
    }
    books.value = books.value.map((book) => ({
      ...book,
      author: authorsStore.authors.find((a) => a.id === book.authorId),
    }));
    return books.value;
  }

  async function fetchBook(id: number): Promise<BookWithAuthor> {
    const book = books.value.find((b) => b.id === id);
    if (!book) {
      throw new Error('book_not_found');
    }
    const authorsStore = useAuthorsStore();
    return {
      ...book,
      author: authorsStore.authors.find((a) => a.id === book.authorId),
    };
  }

  async function createBook(book: { title: string; authorId: number; note: string }): Promise<BookWithAuthor> {
    const authorsStore = useAuthorsStore();
    if (!authorsStore.authors.find((a) => a.id === book.authorId)) {
      throw new Error('author_not_found');
    }
    const newId = books.value.length > 0 ? Math.max(...books.value.map((b) => b.id)) + 1 : 1;
    const newBook: BookWithAuthor = {
      id: newId,
      title: book.title,
      authorId: book.authorId,
      note: book.note,
      author: authorsStore.authors.find((a) => a.id === book.authorId),
    };
    books.value.push(newBook);
    saveToLocalStorage();
    return newBook;
  }

  async function updateBook(id: number, book: { title: string; authorId: number; note: string }): Promise<BookWithAuthor> {
    const authorsStore = useAuthorsStore();
    if (!authorsStore.authors.find((a) => a.id === book.authorId)) {
      throw new Error('author_not_found');
    }
    const index = books.value.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error('book_not_found');
    }
    books.value[index] = {
      id,
      title: book.title,
      authorId: book.authorId,
      note: book.note,
      author: authorsStore.authors.find((a) => a.id === book.authorId),
    };
    saveToLocalStorage();
    return books.value[index];
  }

  async function deleteBook(id: number) {
    const index = books.value.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error('book_not_found');
    }
    books.value.splice(index, 1);
    saveToLocalStorage();
  }

  return { books, initializeBooks, fetchBooks, fetchBook, createBook, updateBook, deleteBook };
});