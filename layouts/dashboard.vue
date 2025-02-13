<script lang="ts" setup>
const isSidebarShow = ref<boolean>(false);

const authStore = useAuthStore();

onMounted(() => {
  authStore.initStore();
});

onUnmounted(() => {
  authStore.stopTokenWatcher();
});

const router = useRouter();
function logout() {
  authStore.logout();
  router.replace("/");
}
</script>

<template>
  <header
    class="md:hidden fixed top-0 inset-x-0 bg-white h-14 flex px-3 items-center justify-between z-50"
  >
    <button @click="isSidebarShow = !isSidebarShow">
      <Icon name="mynaui:menu" size="1.25rem" />
    </button>
  </header>
  <div class="bg-indigo-50">
    <aside
      class="bg-white fixed left-0 top-0 h-full rounded-sm shadow-sm shadow-indigo-100 z-50 translate-0 transition-all duration-200 ease-in-out md:translate-0"
      :class="{ '-translate-x-full': !isSidebarShow }"
    >
      <ul class="flex flex-col md:items-center md:w-16 px-3 md:px-0">
        <li class="py-6 md:py-3 md:px-3 flex not-last:border-b border-black/10">
          <NuxtLink
            to="/create-appointment"
            class="w-full py-1 md:py-2 px-2 rounded h-fit border border-white hover:bg-indigo-100 hover:border-indigo-300 hover:text-indigo-500 flex items-center gap-2"
            exact-active-class="bg-indigo-100 border-indigo-500 text-indigo-500"
          >
            <Icon name="mynaui:plus-square" />
            <span class="md:hidden">Create Appointment</span>
          </NuxtLink>
        </li>
        <li class="py-6 md:py-3 md:px-3 flex not-last:border-b border-black/10">
          <NuxtLink
            to="/appointments"
            class="w-full py-1 md:py-2 px-2 rounded h-fit border border-white hover:bg-indigo-100 hover:border-indigo-300 hover:text-indigo-500 flex items-center gap-2"
            exact-active-class="bg-indigo-100 border-indigo-500 text-indigo-500"
          >
            <Icon name="mynaui:calendar" />
            <span class="md:hidden">Appointment</span>
          </NuxtLink>
        </li>
        <li class="py-6 md:py-3 md:px-3 flex not-last:border-b border-black/10">
          <button
            class="cursor-pointer w-full py-1 md:py-2 px-2 rounded h-fit border border-white hover:bg-indigo-100 hover:border-indigo-300 hover:text-indigo-500 flex items-center gap-2"
            exact-active-class="bg-indigo-100 border-indigo-500 text-indigo-500"
            @click="logout()"
          >
            <Icon name="mynaui:logout" />
            <span class="md:hidden">Logout</span>
          </button>
        </li>
      </ul>
    </aside>
    <main class="h-lvh md:pl-20 pt-20 md:pt-4 overflow-y-scroll px-3 md:pr-4">
      <slot />
    </main>
  </div>
</template>
