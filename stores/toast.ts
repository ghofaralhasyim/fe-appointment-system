import { defineStore } from 'pinia';

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [] as Array<{ id: number; message: string; type: 'success' | 'error' | 'info'; timeout: number }>,
  }),
  actions: {
    addToast(message: string, type: 'success' | 'error' | 'info' = 'info', timeout = 3000, id?: number) {
      const toastId = id || Date.now();
      this.toasts.unshift({ id: toastId, message, type, timeout });

      setTimeout(() => {
        this.removeToast(toastId);
      }, timeout);
    },
    removeToast(id: number) {
      const index = this.toasts.findIndex(toast => toast.id === id);
      if (index !== -1) this.toasts.splice(index, 1);
    },
  },
});