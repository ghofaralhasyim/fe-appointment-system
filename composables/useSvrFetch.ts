import type { UseFetchOptions } from '#app'

export function useSvrFetch<T>(
  request: string,
  options: UseFetchOptions<T> & { auth?: boolean } = {}
) {
  const config = useRuntimeConfig()
  const headers = useRequestHeaders(['cookie']) as HeadersInit
  const authStore = useAuthStore()
  const token = authStore.token

  const defaultOptions: UseFetchOptions<T> = {
    baseURL: config.public.apiBaseUrl,
    watch: false,
    headers: headers
  }

  if (options.auth) {
    defaultOptions.headers = {
      ...defaultOptions.headers,
      ...(token ? { Authorization: `Bearer ${token.access_token}` } : {}),
    }
  }

  const mergedOptions: UseFetchOptions<T> = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }

  return useFetch(request, mergedOptions)
}