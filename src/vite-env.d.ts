/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SQUARE_APP_ID: string;
  readonly VITE_SQUARE_LOCATION_ID: string;
  readonly VITE_API_URL: string;
  /** "jebi" builds the standalone Jay Edwards Baseball Invitational site */
  readonly VITE_SITE_MODE?: string;
  /** Standalone JEBI site URL the MTHC JEBI icon links to */
  readonly VITE_JEBI_URL?: string;
  /** MTHC site URL the JEBI site links back to */
  readonly VITE_MTHC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
