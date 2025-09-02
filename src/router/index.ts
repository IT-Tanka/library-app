import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Home from '@/views/Home.vue';
import BooksList from '@/views/Books/List.vue';
import BookDetail from '@/views/Books/Detail.vue';
import AuthorsList from '@/views/Authors/List.vue';
import AuthorDetail from '@/views/Authors/Detail.vue';
import Profile from '@/views/Profile.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/books',
    name: 'Books',
    component: BooksList,
    meta: { requiresAuth: true },
  },
  {
    path: '/books/:id',
    name: 'BookDetail',
    component: BookDetail,
    meta: { requiresAuth: true },
  },
  {
    path: '/authors',
    name: 'Authors',
    component: AuthorsList,
    meta: { requiresAuth: true },
  },
  {
    path: '/authors/:id',
    name: 'AuthorDetail',
    component: AuthorDetail,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/', 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;