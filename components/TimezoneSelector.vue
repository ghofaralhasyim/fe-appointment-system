<script lang="ts" setup>
import { onClickOutside } from "@vueuse/core";

const authStore = useAuthStore();
const timezone = ref<string | undefined>(authStore.user?.timezone);
const isLoading = ref<boolean>(false);
const toastStore = useToastStore();
const router = useRouter();

async function handleChangeTimezone() {
  if (timezone.value == authStore.user?.timezone) return;
  isLoading.value = true;
  try {
    await useCsFetch(`/users/timezone`, {
      auth: true,
      method: "PATCH",
      body: {
        timezone: timezone.value,
      },
      onResponse({ response }) {
        if (authStore.user?.timezone)
          authStore.user.timezone = timezone.value || "Asia/Jakarta";
        if (response.status != 202) return;
        router.go(0);
      },
    });
  } catch (error: any) {
    let msg = getErrorFetchMessage(error);
    toastStore.addToast(`Err: ${msg}`, "error", 5000);
  } finally {
    isLoading.value = false;
  }
}

function changeTimezone(tz: string) {
  timezone.value = tz;
  handleChangeTimezone();
  isTzDropdownShow.value = false;
}

const tzDropdownRef = ref<HTMLElement>();
const isTzDropdownShow = ref<boolean>(false);
onClickOutside(tzDropdownRef, (event) => (isTzDropdownShow.value = false));
</script>

<template>
  <div v-if="timezone" ref="tzDropdownRef" class="relative w-fit">
    <button
      type="button"
      class="w-fit cursor-pointer py-2 px-4 border-2 text-left origin-center border-white rounded-lg focus:outline-none focus:border-2 focus:border-indigo-500 text-black relative bg-white flex items-center"
      @click="isTzDropdownShow = !isTzDropdownShow"
    >
      <span>{{ authStore?.user?.timezone }}</span>
      <Icon name="mynaui:chevron-down" size="1rem" class="mt-1 ml-2" />
    </button>
    <ul
      v-if="isTzDropdownShow"
      class="w-full absolute top-12 shadow bg-white z-50 rounded-lg overflow-hidden text-sm"
    >
      <li
        class="px-4 py-2 cursor-pointer hover:bg-indigo-50 not-last:border-b border-black/10"
        @click="changeTimezone('Asia/Jakarta')"
      >
        Asia/Jakarta
      </li>
      <li
        class="px-4 py-2 cursor-pointer hover:bg-indigo-50 not-last:border-b border-black/10"
        @click="changeTimezone('Pacific/Auckland')"
      >
        Pacific/Auckland
      </li>
    </ul>
  </div>
</template>
