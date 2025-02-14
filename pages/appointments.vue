<script lang="ts" setup>
import type { Appointment } from "~/types/types";

definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

interface ApiResponse {
  data: Appointment[];
  message: string;
}

const {
  data: dataAppointments,
  refresh: refreshAppointments,
  pending,
} = await useSvrFetch<ApiResponse>(`/appointment`, {
  auth: true,
  method: "GET",
});

const startDate = new Date(Date.now());
const authStore = useAuthStore();
</script>

<template>
  <section class="relative w-full mb-4">
    <TimezoneSelector />
  </section>
  <section class="relative w-full bg-white p-4 rounded-lg">
    <h2 class="font-medium">Appointments</h2>

    <Schedules
      v-if="dataAppointments?.data?.length"
      :appointments="dataAppointments.data"
      :timezone="authStore.user?.timezone || 'Asia/Jakarta'"
      :start-date="startDate"
    />
  </section>

  <section class="relative w-full lg:w-1/2 bg-white p-4 rounded-lg mt-4">
    <h2 class="font-medium">Invitations</h2>
    <Invitations @updated="refreshAppointments" />
  </section>
</template>
