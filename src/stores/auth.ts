import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useBooksStore } from './books';
import { useAuthorsStore } from './authors';

interface User {
  email: string;
  password: string;
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const user = ref<{ email: string } | null>(null);
  const router = useRouter();

  // Load users from localStorage
  const users = ref<User[]>(JSON.parse(localStorage.getItem('users') || '[]'));

  // Save users to localStorage
  const saveUsers = () => {
    localStorage.setItem('users', JSON.stringify(users.value));
  };

  async function register(email: string, password: string) {
    if (users.value.find((u) => u.email === email)) {
      throw new Error('user_already_exists');
    }
    users.value.push({ email, password });
    saveUsers();
    // Perform automatic login after registration
    isAuthenticated.value = true;
    user.value = { email };
    localStorage.setItem('auth', JSON.stringify({ email, isAuthenticated: true }));
    // Initialize user-specific data
    const booksStore = useBooksStore();
    const authorsStore = useAuthorsStore();
    await authorsStore.initializeAuthors(email);
    await booksStore.initializeBooks(email);
    // Redirect to books page
    await router.push('/books');
  }

  async function login(email: string, password: string) {
    const foundUser = users.value.find((u) => u.email === email && u.password === password);
    if (!foundUser) {
      throw new Error('invalid_credentials');
    }
    isAuthenticated.value = true;
    user.value = { email };
    localStorage.setItem('auth', JSON.stringify({ email, isAuthenticated: true }));
    // Initialize user-specific data
    const booksStore = useBooksStore();
    const authorsStore = useAuthorsStore();
    await authorsStore.initializeAuthors(email);
    await booksStore.initializeBooks(email);
    // Redirect to books page
    await router.push('/books');
  }

  function logout() {
    isAuthenticated.value = false;
    const email = user.value?.email;
    user.value = null;
    localStorage.removeItem('auth');
    // Clear user-specific data
    if (email) {
      localStorage.removeItem(`authors_${email}`);
      localStorage.removeItem(`books_${email}`);
    }
    const booksStore = useBooksStore();
    const authorsStore = useAuthorsStore();
    booksStore.$reset();
    authorsStore.$reset();
    // Redirect to home page
    router.push('/');
  }

  function initialize() {
    const authData = localStorage.getItem('auth');
    if (authData) {
      const { email, isAuthenticated: auth } = JSON.parse(authData);
      isAuthenticated.value = auth;
      user.value = { email };
      // Initialize user-specific data
      const booksStore = useBooksStore();
      const authorsStore = useAuthorsStore();
      authorsStore.initializeAuthors(email);
      booksStore.initializeBooks(email);
    }
  }

  // Stub for getProfile, returns the current user
  async function getProfile() {
    if (!isAuthenticated.value || !user.value) {
      throw new Error('not_authenticated');
    }
    return user.value;
  }

  return { isAuthenticated, user, register, login, logout, initialize, getProfile };
});