import { useCallback, useSyncExternalStore } from 'react'

const subscribe = (onChange: () => void): (() => void) => {
  window.addEventListener('popstate', onChange)
  return () => window.removeEventListener('popstate', onChange)
}

const getSnapshot = (): string => window.location.search

const getServerSnapshot = (): string => ''

export interface SetSearchParamOptions {
  /** Replace the current history entry instead of pushing a new one. */
  replace?: boolean
}

/**
 * Read and write one query-string parameter, keeping it in sync with browser history so that
 * the current Pokémon is shareable and Back/Forward move through what was viewed.
 */
export function useSearchParam(
  name: string,
): [string, (value: string | null, options?: SetSearchParamOptions) => void] {
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const value = new URLSearchParams(search).get(name) ?? ''

  const setValue = useCallback(
    (next: string | null, { replace = false }: SetSearchParamOptions = {}) => {
      const params = new URLSearchParams(window.location.search)
      if (next) params.set(name, next)
      else params.delete(name)

      const query = params.toString()
      const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
      if (url === current) return

      if (replace) window.history.replaceState(null, '', url)
      else window.history.pushState(null, '', url)
      // pushState/replaceState do not fire popstate, so notify subscribers ourselves.
      window.dispatchEvent(new PopStateEvent('popstate'))
    },
    [name],
  )

  return [value, setValue]
}
