import type { $Fetch, FetchOptions } from 'ofetch'

export function useCsFetch<T = any>(
  request: string,
  options: FetchOptions & { auth?: boolean } = {}
) {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()
    const token = authStore.token
  
    const defaults: FetchOptions = {
        baseURL: config.public.apiBaseUrl,
        ...options,
    }

    if (options.auth && token) {
        defaults.headers = {
            ...defaults.headers,
            Authorization: `Bearer ${token.access_token}`,
        }
    }

    return $fetch<T>(request, defaults as any)
}