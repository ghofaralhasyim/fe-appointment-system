<script lang="ts" setup>
import type { Appointment } from "~/types/types";

interface ApiResponse {
  data: Appointment[];
  message: string;
}

const {
  data: dataInvitations,
  refresh: refreshInvitations,
  pending,
} = await useSvrFetch<ApiResponse>(`/invitations`, {
  auth: true,
  method: "GET",
});

const emit = defineEmits(["updated"]);

const authStore = useAuthStore();
const isLoading = ref<boolean>(false);
const toastStore = useToastStore();
async function invitationResponse(action: string, id: number) {
  isLoading.value = true;
  try {
    await useCsFetch(`/invitations/${action}/${id}`, {
      auth: true,
      method: "PATCH",
      onResponse({ response }) {
        if (response.status != 202) return;
        toastStore.addToast("Appointment updated", "success", 5000);
        emit("updated");
        refreshInvitations();
      },
    });
  } catch (error: any) {
    let msg = getErrorFetchMessage(error);
    toastStore.addToast(`Err: ${msg}`, "error", 5000);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <ul class="flex flex-col gap-2 mt-4">
    <li
      v-if="dataInvitations?.data"
      v-for="invitation in dataInvitations.data"
      :key="invitation.appointment_id"
      class="flex flex-col relative rounded-lg border border-black/10 p-3"
    >
      <h4 class="font-medium">
        {{ invitation.title }}
      </h4>
      <div class="text-sm mt-1">
        {{
          formatTimeToLocal(
            invitation.start_time,
            authStore.user?.timezone || "Asia/Jakarta"
          )
        }}
        -
        {{
          formatTimeToLocal(
            invitation.end_time,
            authStore.user?.timezone || "Asia/Jakarta"
          )
        }}
      </div>
      <div class="mt-2 flex flex-wrap items-center text-sm">
        <span
          class="w-6 h-6 rounded-full flex items-center justify-center text-white not-first:-ml-2"
          :class="[getParticipantColor('host')]"
        >
          {{ invitation.host.name[0] }}
        </span>
        <span
          v-for="(participant, idx) in invitation.attendants"
          :key="`part${idx}`"
          class="w-6 h-6 rounded-full flex items-center justify-center text-white not-first:-ml-2"
          :class="[
            getParticipantColor(participant.username),
            idx > 0 ? '-ml-2' : '',
          ]"
        >
          {{ participant.name[0] }}
        </span>
        <span
          v-if="invitation.total_attendants > 2"
          class="w-6 h-6 rounded-full flex items-center justify-center bg-gray-500 text-white not-first:-ml-2 text-xs"
          >+{{ invitation.total_attendants - 2 }}</span
        >
        <p class="text-gray-500 text-xs ml-1">
          <span>
            {{ invitation.host.name }},
            {{ invitation.attendants.map((item) => item.name).join(", ") }}
          </span>
          <span v-if="invitation.total_attendants > 2">, others...</span>
        </p>
      </div>
      <div class="absolute right-4 top-4 flex gap-2">
        <button
          type="button"
          :disabled="isLoading"
          class="cursor-pointer flex items-center justify-center p-2 bg-green-500 rounded-full text-white hover:bg-green-600"
          @click="invitationResponse('accept', invitation.invitation_id)"
        >
          <Icon name="mynaui:check-solid" size="1.25rem" />
        </button>
        <button
          type="button"
          :disabled="isLoading"
          class="cursor-pointer flex items-center justify-center p-2 bg-gray-500 rounded-full text-white hover:bg-gray-600"
          @click="invitationResponse('reject', invitation.invitation_id)"
        >
          <Icon name="mynaui:x-solid" size="1.25rem" />
        </button>
      </div>
    </li>
  </ul>
</template>
