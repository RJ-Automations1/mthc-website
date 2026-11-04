import { useEffect } from 'react';

/** Sets the browser tab title for a JEBI page and restores the site title on leave. */
export default function usePageTitle(page: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${page} | Jay Edwards Baseball Invitational`;
    return () => {
      document.title = previous;
    };
  }, [page]);
}
