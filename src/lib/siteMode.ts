/**
 * Which site this build is. The same codebase powers two Render deployments:
 *
 *   - mthc-website (default)            → the Maroon Tiger Homerun Club site
 *   - jebi         (VITE_SITE_MODE=jebi) → the standalone Jay Edwards Baseball
 *                                           Invitational site
 *
 * In jebi mode the app presents as its own website: JEBI-only header and
 * footer, the JEBI pages at the root (/, /about, /teams …), and links back to
 * the MTHC site. Same idea as JVO Events → JVO Weddings.
 *
 * NOTE: VITE_* values are baked in at BUILD time, so changing them on Render
 * requires a redeploy.
 */
export const SITE_MODE = (import.meta.env.VITE_SITE_MODE || '').toLowerCase();

export const IS_JEBI_SITE = SITE_MODE === 'jebi';

/**
 * Where the MTHC site's JEBI icon sends visitors. Defaults to the in-app /jebi
 * pages; set VITE_JEBI_URL to the standalone JEBI Render URL (or a custom
 * domain later) to send visitors there instead — no code change needed.
 */
export const JEBI_SITE_URL = import.meta.env.VITE_JEBI_URL || '/jebi';

/** Where the JEBI site's "MTHC" links send visitors. */
export const MTHC_SITE_URL = (import.meta.env.VITE_MTHC_URL || 'https://mthc-website.onrender.com').replace(/\/$/, '');

export const isExternalUrl = (href: string) => /^https?:\/\//i.test(href);

/** Path to a JEBI page in this build: "/about" → "/about" (jebi site) or "/jebi/about" (MTHC site). */
export const jebiPath = (p = '') => (IS_JEBI_SITE ? p || '/' : `/jebi${p}`);

/** Link to an MTHC page from this build: in-app on the MTHC site, absolute URL on the JEBI site. */
export const mthcPath = (p = '/') => (IS_JEBI_SITE ? `${MTHC_SITE_URL}${p === '/' ? '' : p}` : p);
