<script lang="ts" setup>
import { z, ZodError } from "zod";
import { validateField, getErrorFetchMessage } from "~/utils/helpers";

definePageMeta({
  middleware: "auth",
});

interface DataLogin {
  user: User;
  token: AuthToken;
}

interface LoginResponse {
  message: string;
  data: DataLogin;
}

const formLogInSchema = z.object({
  username: z
    .string({ required_error: "username is required" })
    .nonempty({ message: "invalid username" }),
});

export type FormLoginData = z.infer<typeof formLogInSchema>;

const formData: FormLoginData = reactive({
  username: "",
});

const errors: Partial<Record<keyof typeof formData, string>> = reactive({});

const validate = (field: keyof FormLoginData) => {
  validateField(field, formData, formLogInSchema, errors);
};

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref<boolean>(false);
const loginErr = ref<string>("");
async function handleLogIn() {
  isLoading.value = true;
  loginErr.value = "";

  Object.keys(errors).forEach(
    (key) => (errors[key as keyof FormLoginData] = "")
  );

  try {
    formLogInSchema.parse(formData);

    await useCsFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: formData,
      onResponse({ response }) {
        if (response.status != 200) return;
        authStore.token = response._data.data.token;
        authStore.user = response._data.data.user;
        router.push("/appointments");
      },
    });
  } catch (err) {
    if (err instanceof ZodError) {
      err.errors.forEach((error) => {
        const field = error.path[0] as keyof FormLoginData;
        errors[field] = error.message;
      });
    } else {
      let msg = getErrorFetchMessage(err);
      loginErr.value = msg;
    }
  }

  isLoading.value = false;
}

const isShowPassword = ref<boolean>(false);
</script>

<template>
  <main
    class="bg-indigo-50 min-h-lvh w-full flex items-center justify-center px-3 md:px-0"
  >
    <form
      @submit.prevent="handleLogIn()"
      class="bg-white p-6 md:p-10 rounded-xl shadow-sm shadow-indigo-50 w-full max-w-md flex flex-col items-center"
    >
      <p
        class="text-sm text-gray-600 pb-6 border-b-2 border-gray-100 w-full text-center"
        :class="{ 'text-red-500': loginErr }"
      >
        {{ loginErr ? loginErr : "Please enter your details to log in" }}
      </p>
      <div class="max-w-sm relative w-full mt-6">
        <label class="text-sm" for="username">Username</label>
        <input
          v-model="formData.username"
          id="username"
          type="text"
          :class="[
            'w-full py-3 px-4 mt-2 border-2 font-light rounded-md border-black/10 outline:none focus:outline-none focus:border-indigo-500',
            { 'border-red-500': errors.username },
          ]"
          placeholder="Enter your username"
          autocomplete="off"
          @input="validate('username')"
        />
        <div
          v-if="errors.username"
          class="absolute text-red-500 text-xs top-1.5 right-0 flex items-center gap-2"
        >
          <Icon name="mynaui:danger-triangle-solid" />
          {{ errors.username }}
        </div>
      </div>
      <button
        type="submit"
        class="mt-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 w-full rounded-md disabled:cursor-wait disabled:opacity-80 cursor-pointer hover:bg-gradient-to-t hover:from-indigo-700 hover:to-indigo-600 transition-all ease-in-out duration-150"
        :disabled="isLoading ? true : false"
      >
        Log In
      </button>
    </form>
  </main>
</template>
