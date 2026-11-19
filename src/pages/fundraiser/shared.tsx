import { useEffect, type ReactNode } from 'react';

export const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

/** Sets the tab title for a fundraiser page. */
export function useTitle(page: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${page} | Maroon Tiger Homerun Club`;
    return () => {
      document.title = previous;
    };
  }, [page]);
}

/** Dark strip behind the fixed site header on pages without a photo banner. */
export const HeaderBacker = () => <div className="fixed inset-x-0 top-0 h-20 bg-ink z-40" aria-hidden="true" />;

export async function api<T>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  const r = await fetch(url, {
    ...rest,
    headers: { ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(rest.headers || {}) },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((d as { message?: string }).message || 'Something went wrong.');
  return d as T;
}

/** Envelope graphic. `open` lifts the flap and slides the letter up. */
export function Envelope({
  open = false,
  label,
  seal = 'MTHC',
  children,
  className = '',
}: {
  open?: boolean;
  label?: ReactNode;
  seal?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`envelope ${open ? 'is-open' : ''} ${className}`}>
      <div className="envelope-back" />
      <div className="envelope-letter p-3 sm:p-4 overflow-hidden text-left">{children}</div>
      <div className="envelope-front" />
      <div className="envelope-flap">
        <span className="envelope-seal">{seal}</span>
      </div>
      {label && (
        <div className="absolute inset-x-0 bottom-[10%] z-[4] text-center px-3 pointer-events-none">{label}</div>
      )}
    </div>
  );
}

export function ProgressBar({ raised, goal }: { raised: number; goal: number }) {
  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-3xl font-bold text-ink">{money(raised)}</span>
        <span className="text-sm text-gray-500">
          of {money(goal)} goal · {pct}%
        </span>
      </div>
      <div className="mt-2 h-3 rounded-full bg-gray-200 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-gradient-to-r from-maroon to-gold transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Text a player sends with their link. */
export const inviteMessage = (name: string, url: string) =>
  `Hi! It's ${name}. I'm raising money for Morehouse Baseball through the Maroon Tiger Homerun Club. ` +
  `Would you support me? You can donate and send me a good-luck note here: ${url}`;
