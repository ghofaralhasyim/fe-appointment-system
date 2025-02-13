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

const startDate = new Date("2025-02-14 08:00:00");
</script>

<template>
  <section class="relative w-full bg-white p-4 rounded-lg">
    <h2 class="font-medium">Appointments</h2>

    <Schedules
      v-if="!pending && dataAppointments?.data?.length"
      :appointments="dataAppointments.data"
      timezone="Asia/Jakarta"
      :start-date="startDate"
    />
  </section>
</template>
