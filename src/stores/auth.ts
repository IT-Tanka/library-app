import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useBooksStore } from './books';
import { useAuthorsStore } from './authors';

// Interface for user data structure
interface User {
  email: string;
  password: string;
}

export const useAuthStore = defineStore('auth', () => {
  // Reactive state for authentication status
  const isAuthenticated = ref(false);
  // Reactive state for current user
  const user = ref<{ email: string } | null>(null);
  // Router instance for navigation
  const router = useRouter();

  // Load users from localStorage, default to empty array if none exist
  const users = ref<User[]>(JSON.parse(localStorage.getItem('users') || '[]'));

  // Save users to localStorage
  const saveUsers = () => {
    localStorage.setItem('users', JSON.stringify(users.value));
  };

  // Register a new user
  async function register(email: string, password: string) {
    // Check if user already exists
    if (users.value.find((u) => u.email === email)) {
      throw new Error('user_already_exists'); // Matches translation key in uk.json/en.json
    }

    try {
      // Add new user to users array
      users.value.push({ email, password });
      saveUsers();

      // Set authentication state
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
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error('register_failed'); // Matches translation key
    }
  }

  // Log in an existing user
  async function login(email: string, password: string) {
    // Find user with matching credentials
    const foundUser = users.value.find((u) => u.email === email && u.password === password);
    if (!foundUser) {
      throw new Error('invalid_credentials'); // Matches translation key
    }

    try {
      // Set authentication state
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
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('login_failed'); // Matches translation key
    }
  }

  // Log out the current user
  async function logout() {
    // Store current user email before clearing
    const email = user.value?.email;

    // Clear authentication state
    isAuthenticated.value = false;
    user.value = null;
    localStorage.removeItem('auth');


    // Reset Pinia stores
    const booksStore = useBooksStore();
    const authorsStore = useAuthorsStore();
    booksStore.books = [];
    authorsStore.authors = [];

    // Redirect to home page (login/register)
    try {
      // Use replace to avoid adding to browser history
      if (router.currentRoute.value.meta.requiresAuth) {
        await router.replace('/');
      } else {
        await router.push('/');
      }
    } catch (error) {
      console.error('Navigation to home page failed:', error);
      // Fallback to hard redirect if Vue Router fails
      window.location.href = '/';
      throw new Error('navigation_failed'); // New translation key for navigation error
    }
  }

  // Initialize authentication state from localStorage
  function initialize() {
    const authData = localStorage.getItem('auth');
    if (authData) {
      try {
        const { email, isAuthenticated: auth } = JSON.parse(authData);
        isAuthenticated.value = auth;
        user.value = { email };

        // Initialize user-specific data
        const booksStore = useBooksStore();
        const authorsStore = useAuthorsStore();
        authorsStore.initializeAuthors(email);
        booksStore.initializeBooks(email);
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
        throw new Error('auth_init_failed'); // New translation key for initialization error
      }
    }
  }

  // Get current user profile
  async function getProfile() {
    if (!isAuthenticated.value || !user.value) {
      throw new Error('not_authenticated'); // Matches translation key
    }
    return user.value;
  }

  return { isAuthenticated, user, register, login, logout, initialize, getProfile };
});