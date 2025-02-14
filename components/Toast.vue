<script lang="ts" setup>
const toastStore = useToastStore();
const toasts = toastStore.toasts;

const removeToast = (id: number) => {
  toastStore.removeToast(id);
};
</script>

<template>
  <div class="fixed right-8 top-8 z-50 text-sm">
    <transition-group name="fade" tag="div" class="flex flex-col gap-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="w-80 py-4 pl-6 pr-16 bg-white shadow relative"
      >
        <div class="flex gap-2">
          <Icon
            v-if="toast.type === 'success'"
            name="mynaui:bell-check-solid"
            size="1.5rem"
            class="text-green-500"
          />
          <Icon
            v-else-if="toast.type === 'error'"
            name="mynaui:danger-triangle-solid"
            size="1.25rem"
            class="text-red-500"
          />
          <Icon
            v-else
            name="mynaui:info-circle-solid"
            size="1.25rem"
            class="text-yellow-500"
          />
          <span>{{ toast.message }}</span>
        </div>
        <button
          class="absolute top-[23px] right-8"
          type="button"
          @click="removeToast(toast.id)"
        >
          <Icon name="mynaui:x-solid" size="1rem" />
        </button>
        <div
          :class="[
            'timeout-bar absolute top-0 h-1 w-full left-0',
            toast.type == 'success'
              ? 'bg-green-500'
              : toast.type == 'error'
              ? 'bg-red-500'
              : 'bg-yellow-500',
          ]"
          :style="{ animationDuration: toast.timeout + 'ms' }"
        ></div>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.timeout-bar {
  animation-name: shrink;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0;
  }
}

.fade-enter-active {
  transition: transform 1s ease, opacity 1s ease;
}
.fade-leave-active {
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
