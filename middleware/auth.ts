export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore();

    if (authStore.token && to.path === '/') {
        return navigateTo('/appointments');
    }

    if (!authStore.token && to.path !== '/') {
        return navigateTo('/');
    }
});