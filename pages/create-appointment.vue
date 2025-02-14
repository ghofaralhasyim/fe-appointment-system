<script lang="ts" setup>
import { onClickOutside } from "@vueuse/core";
import { boolean, z, ZodError } from "zod";

definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

const isDatePickerShow = ref<boolean>(false);
const datePickerRef = ref<HTMLElement>();
onClickOutside(datePickerRef, (event) => (isDatePickerShow.value = false));

const isStartPickShow = ref<boolean>(false);
const startPickRef = ref<HTMLElement>();
onClickOutside(startPickRef, (event) => (isStartPickShow.value = false));

const isEndPickShow = ref<boolean>(false);
const endPickRef = ref<HTMLElement>();
onClickOutside(endPickRef, (event) => (isEndPickShow.value = false));

const date = ref(new Date());
const endDate = ref(date.value);

if (date.value.getHours() < 8 || date.value.getHours() > 17) {
  date.value.setHours(8);
  date.value.setMinutes(0);
}

const attrs = ref([
  {
    dates: new Date(),
  },
]);

const rules = ref({
  hours: { min: 8, max: 17 },
  minutes: { interval: 15 },
});

watch(date, (newVal) => {
  endDate.value = newVal;
});

const authStore = useAuthStore();
const formAppointmentSchema = z.object({
  title: z
    .string({ required_error: "title is required" })
    .min(6, { message: "Title min 6 characters" })
    .nonempty({ message: "invalid title" }),
});

export type FormAppointmentData = z.infer<typeof formAppointmentSchema>;

const formData: FormAppointmentData = reactive({
  title: "",
});

const errors: Partial<Record<keyof typeof formData, string>> = reactive({});
const validate = (field: keyof FormAppointmentData) => {
  validateField(field, formData, formAppointmentSchema, errors);
};

const inviteeIds = ref<number[]>([]);
const toastStore = useToastStore();
const errMsg = ref<string>("");
const isLoading = ref<boolean>(false);
async function handleSubmit() {
  try {
    errMsg.value = "";

    if (inviteeIds.value.length <= 0) {
      errMsg.value = "At least add invitation to one person";
      return;
    }

    formAppointmentSchema.parse(formData);

    const payload = {
      host_id: authStore.user?.user_id,
      title: formData.title,
      start_time: date.value.toISOString(),
      end_time: endDate.value.toISOString(),
      invitee_ids: inviteeIds.value,
    };

    await useCsFetch(`/appointment`, {
      auth: true,
      method: "POST",
      body: payload,
      onResponse({ response }) {
        if (response.status != 201) return;
        formData.title = "";
        resetInvitees();
        toastStore.addToast("Appointment created", "success", 5000);
      },
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      error.errors.forEach((err: any) => {
        const field = err.path[0] as keyof FormAppointmentData;
        errors[field] = err.message;
      });
    } else {
      let msg = getErrorFetchMessage(error);
      toastStore.addToast(`Err: ${msg}`, "error", 5000);
    }
  } finally {
    isLoading.value = false;
  }
}

const userListRef = ref();
function resetInvitees() {
  if (!userListRef.value) return;
  userListRef.value.reset();
}
</script>

<template>
  <div class="grid lg:grid-cols-2 gap-4">
    <section class="relative w-full bg-white p-4 rounded-lg">
      <h2 class="font-medium">Create Appointment</h2>
      <form @submit.prevent="handleSubmit" class="mt-6">
        <div class="flex flex-col w-full gap-6">
          <div
            class="relative w-full flex flex-col has-[input:focus]:text-indigo-500"
          >
            <label
              for="title"
              class="absolute bg-white text-xs px-2 left-2 -top-2.5"
              >Appointment Title</label
            >
            <input
              v-model="formData.title"
              type="text"
              name="title"
              id="title"
              autocomplete="off"
              placeholder="Weekly Sync"
              class="py-2 px-4 border origin-center border-black/20 rounded-lg focus:outline-none focus:border-2 focus:border-indigo-500 text-black font-light"
              :class="{ 'border-2 border-red-500': errors.title }"
              @input="validate('title')"
            />
            <div
              v-if="errors.title"
              class="absolute text-red-500 bg-white text-xs -top-2 px-2 right-2 flex items-center gap-2"
            >
              <Icon name="mynaui:danger-triangle-solid" />
              {{ errors.title }}
            </div>
          </div>
        </div>

        <div
          ref="datePickerRef"
          class="flex flex-col items-start mt-6 relative"
        >
          <button
            type="button"
            class="cursor-pointer w-full py-2 px-4 border text-left origin-center border-black/20 rounded-lg focus:outline-none focus:border-2 focus:border-indigo-500 text-black relative"
            @click="isDatePickerShow = !isDatePickerShow"
          >
            <span class="absolute bg-white text-xs px-2 left-2 -top-2.5"
              >Select Date</span
            >
            <span class="font-light">{{ formatDate(date, "DddMyyy") }}</span>
          </button>
          <div
            v-if="isDatePickerShow"
            class="absolute top-12 w-full bg-white z-10"
          >
            <VDatePicker
              v-model="date"
              :attributes="attrs"
              :min-date="new Date()"
              :timezone="authStore.user?.timezone || 'Asia/Jakarta'"
              expanded
            />
          </div>
        </div>

        <div class="grid lg:grid-cols-2 gap-4 relative">
          <div
            ref="startPickRef"
            class="flex flex-col items-start mt-6 relative"
          >
            <button
              type="button"
              class="cursor-pointer w-full py-2 px-4 border text-left origin-center border-black/20 rounded-lg focus:outline-none focus:border-2 focus:border-indigo-500 text-black relative"
              @click="isStartPickShow = !isStartPickShow"
            >
              <span class="absolute bg-white text-xs px-2 left-2 -top-2.5"
                >Select start time</span
              >
              <span class="font-light">{{
                formatTimeToLocal(
                  date?.toISOString() || new Date().toISOString(),
                  authStore.user?.timezone || "Asia/Jakarta"
                )
              }}</span>
            </button>
            <div v-if="isStartPickShow" class="absolute top-12 bg-white z-10">
              <VDatePicker
                v-model="date"
                :rules="rules"
                mode="time"
                expanded
                :timezone="authStore.user?.timezone || 'Asia/Jakarta'"
              />
            </div>
          </div>
          <div ref="endPickRef" class="flex flex-col items-start mt-6 relative">
            <button
              type="button"
              class="cursor-pointer w-full py-2 px-4 border text-left origin-center border-black/20 rounded-lg focus:outline-none focus:border-2 focus:border-indigo-500 text-black relative"
              @click="isEndPickShow = !isEndPickShow"
            >
              <span class="absolute bg-white text-xs px-2 left-2 -top-2.5"
                >Select end time</span
              >
              <span class="font-light">{{
                formatTimeToLocal(
                  endDate?.toISOString() || new Date().toISOString(),
                  authStore.user?.timezone || "Asia/Jakarta"
                )
              }}</span>
            </button>
            <div v-if="isEndPickShow" class="absolute top-12 bg-white z-10">
              <VDatePicker
                v-model="endDate"
                :rules="rules"
                mode="time"
                :timezone="authStore.user?.timezone || 'Asia/Jakarta'"
                expanded
              />
            </div>
          </div>

          <div class="mt-2">
            <UserList
              ref="userListRef"
              :start-time="date.toISOString()"
              :end-time="endDate.toISOString()"
              :selected-ids="inviteeIds"
              @invitees-changed="(ids) => (inviteeIds = ids)"
            />
          </div>
        </div>
        <button
          type="submit"
          :disabled="false"
          class="my-4 cursor-pointer py-2 px-6 w-fit border-2 border-cf-blue text-center text-white bg-indigo-500 rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-wait"
        >
          Create Appointment
        </button>
        <span v-if="errMsg" class="text-red-500 flex items-center gap-2">
          <Icon name="mynaui:danger-triangle-solid" size="1rem" />{{ errMsg }}
        </span>
      </form>
    </section>
  </div>
</template>
