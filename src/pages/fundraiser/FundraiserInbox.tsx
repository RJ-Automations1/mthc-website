import { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Check, Copy, Mail, MessageSquare, Share2, X } from 'lucide-react';
import { Envelope, HeaderBacker, ProgressBar, api, inviteMessage, money, useTitle } from './shared';

interface EnvelopeItem {
  ref: string;
  amount: number;
  from: string;
  note: string | null;
  opened: boolean;
  createdAt: string;
}

interface InboxData {
  name: string;
  slug: string;
  goal: number;
  blurb: string | null;
  raised: number;
  gifts: number;
  shareUrl: string;
  envelopes: EnvelopeItem[];
}

const KEY_STORE = 'mthc-fundraiser-key:';

/** A player's private portal: their invite link to send out and the envelopes supporters sent them. */
export default function FundraiserInbox() {
  const { slug = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const [[key, remembered]] = useState<[string, boolean]>(() => {
    const fromUrl = params.get('key') || '';
    try {
      if (fromUrl) localStorage.setItem(KEY_STORE + slug, fromUrl);
      return [fromUrl || localStorage.getItem(KEY_STORE + slug) || '', true];
    } catch {
      return [fromUrl, false];
    }
  });
  const [data, setData] = useState<InboxData | null>(null);
  const [error, setError] = useState('');
  const [opening, setOpening] = useState<string | null>(null);
  const [reading, setReading] = useState<EnvelopeItem | null>(null);
  const [copied, setCopied] = useState(false);
  useTitle(data ? `${data.name}'s envelopes` : 'My envelopes');

  const load = useCallback(() => {
    if (!key) return setError('This page needs your private link. Ask your coach for it.');
    api<InboxData>(`/api/fundraiser/inbox/${encodeURIComponent(slug)}`, { headers: { 'x-portal-key': key } })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [key, slug]);

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000); // new envelopes show up on their own
    return () => clearInterval(t);
  }, [load]);

  // Keep the key out of the address bar once it's remembered on this device
  useEffect(() => {
    if (remembered && params.get('key') && data) setParams({}, { replace: true });
  }, [data, params, setParams, remembered]);

  function open(env: EnvelopeItem) {
    setOpening(env.ref);
    setTimeout(() => {
      setReading(env);
      setOpening(null);
      if (!env.opened) {
        api(`/api/fundraiser/inbox/${encodeURIComponent(slug)}/open/${env.ref}`, { method: 'POST', headers: { 'x-portal-key': key } }).catch(() => undefined);
        setData((d) => d && { ...d, envelopes: d.envelopes.map((e) => (e.ref === env.ref ? { ...e, opened: true } : e)) });
      }
    }, 1100);
  }

  if (error) {
    return (
      <>
        <HeaderBacker />
        <section className="pt-36 pb-24 text-center px-4">
          <h1 className="section-heading">Private link needed</h1>
          <p className="text-gray-600 max-w-md mx-auto">{error}</p>
        </section>
      </>
    );
  }
  if (!data) {
    return (
      <>
        <HeaderBacker />
        <p className="pt-36 pb-24 text-center text-gray-500">Loading your envelopes…</p>
      </>
    );
  }

  const first = data.name.split(/\s+/)[0];
  const message = inviteMessage(first, data.shareUrl);
  const unopened = data.envelopes.filter((e) => !e.opened).length;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(data!.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy your link:', data!.shareUrl);
    }
  }
  async function nativeShare() {
    try {
      await navigator.share({ title: `Support ${data!.name}`, text: message, url: data!.shareUrl });
    } catch {
      /* closed the share sheet */
    }
  }

  return (
    <>
      <HeaderBacker />
      <section className="bg-cream pt-28 pb-20 md:pt-32">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <header>
            <p className="eyebrow text-maroon">Private · only you can see this page</p>
            <h1 className="mt-1 font-display uppercase font-bold text-ink text-4xl md:text-6xl leading-[0.95]">
              {first}’s envelopes
            </h1>
            <p className="mt-2 text-gray-600">
              {unopened > 0 ? `You have ${unopened} new envelope${unopened === 1 ? '' : 's'} to open!` : 'Bookmark this page — new envelopes land here as people give.'}
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card hover:translate-y-0 p-6">
              <ProgressBar raised={data.raised} goal={data.goal} />
              <p className="mt-3 text-sm text-gray-600">{data.gifts} supporter{data.gifts === 1 ? '' : 's'}</p>
            </div>
            <div className="card hover:translate-y-0 p-6">
              <h2 className="font-display uppercase text-2xl font-bold text-ink">Send your invitation</h2>
              <p className="mt-1 text-sm text-gray-600 break-all">{data.shareUrl}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={copyLink} className="btn-primary !px-4 !py-2 text-sm">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied' : 'Copy link'}
                </button>
                <a href={`sms:?&body=${encodeURIComponent(message)}`} className="btn-secondary !px-4 !py-2 text-sm">
                  <MessageSquare className="w-4 h-4" /> Text
                </a>
                <a href={`mailto:?subject=${encodeURIComponent(`Support ${data.name} and Morehouse Baseball`)}&body=${encodeURIComponent(message)}`} className="btn-secondary !px-4 !py-2 text-sm">
                  <Mail className="w-4 h-4" /> Email
                </a>
                {'share' in navigator && (
                  <button type="button" onClick={nativeShare} className="btn-secondary !px-4 !py-2 text-sm">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="section-heading !text-3xl">Your mailbox</h2>
            {data.envelopes.length === 0 ? (
              <div className="card hover:translate-y-0 p-10 text-center text-gray-600">
                <Envelope className="max-w-[200px] mx-auto mb-6" />
                No envelopes yet. Send your invitation to family and friends — every gift arrives here with their note.
              </div>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
                {data.envelopes.map((env) => (
                  <li key={env.ref}>
                    <button
                      type="button"
                      onClick={() => open(env)}
                      disabled={opening !== null}
                      className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon rounded-xl"
                      aria-label={`Open envelope from ${env.from}`}
                    >
                      <Envelope
                        open={opening === env.ref}
                        className={env.opened ? 'opacity-80' : ''}
                        label={
                          !env.opened && opening !== env.ref ? (
                            <span className="inline-block rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">New</span>
                          ) : undefined
                        }
                      />
                      <p className="mt-2 text-sm font-semibold text-ink truncate">From {env.from}</p>
                      <p className="text-xs text-gray-500">{new Date(env.createdAt).toLocaleDateString()}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {reading && (
        <div className="fixed inset-0 z-50 bg-ink/70 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={`Note from ${reading.from}`} onClick={() => setReading(null)}>
          <div className="relative w-full max-w-md bg-cream rounded-2xl shadow-2xl p-8 animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setReading(null)} className="absolute top-3 right-3 p-2 text-gray-500 hover:text-ink" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
            <p className="eyebrow text-maroon">A note for {first}</p>
            <p className="mt-4 text-lg text-ink whitespace-pre-wrap leading-relaxed font-serif">
              {reading.note || 'Good luck this season! (No note — just love.)'}
            </p>
            <p className="mt-6 text-right font-semibold text-ink">— {reading.from}</p>
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <span className="font-display text-3xl font-bold text-maroon">{money(reading.amount)}</span>
              <span className="block text-xs text-gray-500 uppercase tracking-wider">given to Morehouse Baseball in your name</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
