import { defineStore } from 'pinia';
import { ref } from 'vue';

interface User {
  email: string;
  password: string;
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const user = ref<{ email: string } | null>(null);

  // Загрузка пользователей из localStorage
  const users = ref<User[]>(JSON.parse(localStorage.getItem('users') || '[]'));

  // Сохранение пользователей в localStorage
  const saveUsers = () => {
    localStorage.setItem('users', JSON.stringify(users.value));
  };

  async function register(email: string, password: string) {
    if (users.value.find((u) => u.email === email)) {
      throw new Error('user_already_exists');
    }
    users.value.push({ email, password });
    saveUsers();
  }

  async function login(email: string, password: string) {
    const foundUser = users.value.find((u) => u.email === email && u.password === password);
    if (!foundUser) {
      throw new Error('invalid_credentials');
    }
    isAuthenticated.value = true;
    user.value = { email };
    localStorage.setItem('auth', JSON.stringify({ email, isAuthenticated: true }));
  }

  function logout() {
    isAuthenticated.value = false;
    user.value = null;
    localStorage.removeItem('auth');
  }

  function initialize() {
    const authData = localStorage.getItem('auth');
    if (authData) {
      const { email, isAuthenticated: auth } = JSON.parse(authData);
      isAuthenticated.value = auth;
      user.value = { email };
    }
  }

  // Заглушка для getProfile, возвращающая текущего пользователя
  async function getProfile() {
    if (!isAuthenticated.value || !user.value) {
      throw new Error('not_authenticated');
    }
    return user.value;
  }

  return { isAuthenticated, user, register, login, logout, initialize, getProfile };
});
