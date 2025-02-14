<script setup lang="ts">
import type { Appointment } from "~/types/types";

const props = defineProps<{
  appointments: Appointment[];
  timezone: string;
  startDate: Date;
}>();

const displayAmount = ref<number>(1);
const dateRange = computed(() => {
  return Array.from({ length: displayAmount.value }, (_, i) =>
    addDays(props.startDate, i)
  );
});

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: props.timezone,
  }).format(date);
};

const getappointmentsForDate = (
  date: Date,
  appointments: Appointment[]
): Appointment[] => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.start_time);
    return appointmentDate >= startOfDay && appointmentDate <= endOfDay;
  });
};

const windowWidth = ref<number>(0);
function updateWidth() {
  windowWidth.value = window.innerWidth;
}

watch(windowWidth, async (newVal: number) => {
  displayAmount.value = windowWidth.value < 1024 ? 1 : 5;
});

onMounted(() => {
  updateWidth();
  window.addEventListener("resize", updateWidth);
});

const authStore = useAuthStore();
</script>

<template>
  <div class="flex flex-col">
    <div class="text-sm text-gray-500 mb-4">Timezone: {{ timezone }}</div>
    <div class="grid grid-cols-1 lg:grid-cols-5">
      <div
        v-for="date in dateRange"
        :key="date.toISOString()"
        class="flex flex-col"
      >
        <h3 class="font-medium text-gray-900 pb-4 border-b border-black/10">
          {{ formatDate(date) }}
        </h3>

        <div class="space-y-3 pr-3 h-full mt-3">
          <ul
            v-if="appointments.length"
            v-for="appointment in getappointmentsForDate(date, appointments)"
            :key="appointment.appointment_id"
            class="rounded-lg border border-black/10 p-3"
          >
            <li class="flex justify-between items-start relative">
              <div>
                <span
                  v-if="appointment.host_id == authStore.user?.user_id"
                  class="bg-indigo-500 text-xs px-1 absolute top-1 right-1 text-white rounded"
                  >Host</span
                >
                <h4 class="font-medium">
                  {{ appointment.title }}
                </h4>
                <div class="text-sm mt-1">
                  {{ formatTimeToLocal(appointment.start_time, timezone) }}
                  -
                  {{ formatTimeToLocal(appointment.end_time, timezone) }}
                </div>
                <div class="mt-2 flex flex-wrap items-center text-sm">
                  <span
                    class="w-6 h-6 rounded-full flex items-center justify-center text-white not-first:-ml-2"
                    :class="[getParticipantColor('host')]"
                  >
                    {{ appointment.host.name[0] }}
                  </span>
                  <span
                    v-for="(participant, idx) in appointment.attendants"
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
                    v-if="appointment.total_attendants > 2"
                    class="w-6 h-6 rounded-full flex items-center justify-center bg-gray-500 text-white not-first:-ml-2 text-xs"
                    >+{{ appointment.total_attendants - 2 }}</span
                  >
                  <p class="text-gray-500 text-xs ml-1">
                    <span>
                      {{ appointment.host.name }},
                      {{
                        appointment.attendants
                          .map((item) => item.name)
                          .join(", ")
                      }}
                    </span>
                    <span v-if="appointment.total_attendants > 2"
                      >, others...</span
                    >
                  </p>
                </div>
              </div>
            </li>
          </ul>

          <div
            v-if="getappointmentsForDate(date, appointments).length === 0"
            class="text-center py-4 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg"
          >
            No appointment
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
