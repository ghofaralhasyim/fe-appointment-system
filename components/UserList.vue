<script lang="ts" setup>
import type { User } from "~/types/types";
import { onClickOutside } from "@vueuse/core";

const props = defineProps<{
  startTime: string;
  endTime: string;
  selectedIds: number[];
}>();

interface ApiResponse {
  data: User[];
  message: string;
}

const authStore = useAuthStore();

const {
  data: dataUsers,
  refresh: refreshDataUsers,
  pending,
} = await useSvrFetch<ApiResponse>(`/users`, {
  auth: true,
  method: "GET",
});

if (dataUsers?.value?.data) {
  dataUsers.value.data =
    dataUsers?.value?.data.filter(
      (item) => item.user_id != authStore.user?.user_id
    ) || [];
}

const isDropdownShow = ref<boolean>(false);
const dropdownRef = ref<HTMLElement>();
onClickOutside(dropdownRef, (event) => (isDropdownShow.value = false));

interface SelectedUser extends User {
  isValid: boolean;
}
const userSelected = ref<SelectedUser[]>([]);
function addUser(user: User) {
  if (!dataUsers?.value) return;
  let idx = userSelected.value.findIndex(
    (item) => item.user_id === user.user_id
  );
  if (idx != -1) return;

  let isValid = IsWithinBusinessHours(
    props.startTime,
    props.endTime,
    user.timezone
  );
  userSelected.value.push({ ...user, isValid: isValid });
}

function removeUser(userId: number) {
  let idx = userSelected.value.findIndex((item) => item.user_id === userId);
  if (idx == -1) return;

  userSelected.value.splice(idx, 1);
}

const emit = defineEmits<{
  (e: "inviteesChanged", ids: number[]): void;
}>();

watch(userSelected.value, (newVal) => {
  let ids = newVal
    .filter((item) => item.user_id && item.isValid)
    .map((item) => item.user_id);

  emit("inviteesChanged", ids);
});

defineExpose({
  reset,
});

function reset() {
  userSelected.value = [];
}
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <div
      type="button"
      class="cursor-pointer w-full pt-4 pb-3.5 px-4 border text-left origin-center border-black/20 rounded-lg focus:outline-none focus:border-2 focus:border-indigo-500 text-black relative min-h-14 flex flex-wrap gap-2"
      @click="isDropdownShow = !isDropdownShow"
    >
      <span class="absolute bg-white text-xs px-2 left-2 -top-2.5"
        >Invite participant</span
      >
      <button
        v-for="user in userSelected"
        type="button"
        class="cursor-pointer flex gap-2 text-xs items-center bg-indigo-50 px-2 py-1 rounded-full h-fit border border-indigo-300 relative"
        @click="removeUser(user.user_id)"
      >
        <div
          v-if="!user.isValid"
          class="absolute -bottom-1.5 -left-2 text-red-400"
        >
          <Icon name="mynaui:x-triangle-solid" size="1.25rem" />
        </div>
        <div
          class="flex gap-2 items-center"
          :class="{ 'opacity-30': !user.isValid }"
        >
          <span
            :key="`part${user.user_id}`"
            class="w-6 h-6 rounded-full flex items-center justify-center text-white"
            :class="[getParticipantColor(user.username)]"
          >
            {{ user.name[0] }}
          </span>
          <span class="text-sm">{{ user.name }}</span>
        </div>
        <Icon name="mynaui:trash" size="1rem" />
      </button>
    </div>
    <ul
      v-if="isDropdownShow"
      class="absolute top-18 shadow bg-white z-10 rounded-lg w-full flex flex-col overflow-hidden"
    >
      <li
        v-for="user in dataUsers?.data"
        class="flex gap-2 py-2 px-4 not-last:border-b border-black/10 cursor-pointer hover:bg-indigo-50"
        @click="addUser(user)"
      >
        <span
          :key="`part${user.user_id}`"
          class="w-6 h-6 rounded-full flex items-center justify-center text-white"
          :class="[getParticipantColor(user.username)]"
        >
          {{ user.name[0] }}
        </span>
        <div class="flex flex-col">
          <span class="text-sm">{{ user.name }}</span>
          <span class="text-xs text-gray-500">{{ user.timezone }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>
