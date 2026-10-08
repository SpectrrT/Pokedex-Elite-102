import { useEffect } from 'react'

/** Set the document title while the calling component is mounted, restoring it afterwards. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}
