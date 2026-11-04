import { useState, type FormEvent } from 'react';
import { Mail, Phone, Send, CheckCircle2, HeartHandshake, Newspaper } from 'lucide-react';
import { CONTACTS, JEBI } from './data';
import { EventMeta, JebiHero, MaybeLink } from './components';
import { PHOTOS } from '../../lib/photos';
import usePageTitle from './usePageTitle';

// Where each topic is routed. Pending departments fall back to the MTHC general inbox.
const TOPICS = [
  { id: 'general', label: 'General', to: CONTACTS.general.email },
  { id: 'sponsorship', label: 'Sponsorship / Donations', to: CONTACTS.sponsorship.email },
  { id: 'media', label: 'Media / Credentials', to: CONTACTS.media.email },
  { id: 'tickets', label: 'Tickets', to: CONTACTS.general.email },
  { id: 'teams', label: 'Teams / Operations', to: CONTACTS.general.email },
  { id: 'shop', label: 'Shop / Merchandise', to: CONTACTS.general.email },
];

const blank = { name: '', email: '', org: '', topic: 'general', message: '', consent: false, website: '' };

export default function JebiContact() {
  usePageTitle('Contact');
  const [form, setForm] = useState(blank);
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (form.website) return; // honeypot — bots fill hidden fields
    const topic = TOPICS.find((t) => t.id === form.topic)!;
    const body = [form.message, '', '—', `Name: ${form.name}`, `Email: ${form.email}`, form.org && `Organization: ${form.org}`]
      .filter(Boolean)
      .join('\n');
    window.location.href = `mailto:${topic.to}?subject=${encodeURIComponent(`JEBI — ${topic.label}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <>
      <JebiHero eyebrow="Contact" title="How can we help?" subtitle="Choose a topic and we'll route your message to the right team." image={PHOTOS.jebiContactHero} />

      <section className="container-page grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          {sent ? (
            <div role="status" className="card p-8 hover:translate-y-0">
              <CheckCircle2 className="w-10 h-10 text-jebi" aria-hidden="true" />
              <h2 className="mt-4 font-display uppercase text-3xl font-bold text-ink">Almost there</h2>
              <p className="mt-2 text-gray-600">
                Your email app should now be open with your message. Press send to deliver it. If nothing opened, write to{' '}
                <a className="text-jebi underline" href={`mailto:${CONTACTS.general.email}`}>
                  {CONTACTS.general.email}
                </a>
                .
              </p>
              <button type="button" className="mt-5 btn-secondary text-sm" onClick={() => { setForm(blank); setSent(false); }}>
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="card p-6 md:p-8 hover:translate-y-0 grid sm:grid-cols-2 gap-4">
              <fieldset className="sm:col-span-2">
                <legend className="text-sm font-semibold text-gray-700 mb-2">Topic *</legend>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <label
                      key={t.id}
                      className={`cursor-pointer px-4 py-2 rounded-full text-sm font-semibold ring-1 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-jebi ${
                        form.topic === t.id ? 'bg-jebi text-white ring-jebi' : 'bg-white text-ink/70 ring-black/10 hover:text-jebi'
                      }`}
                    >
                      <input
                        type="radio"
                        name="topic"
                        value={t.id}
                        checked={form.topic === t.id}
                        onChange={() => setForm({ ...form, topic: t.id })}
                        className="sr-only"
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="text-sm font-semibold text-gray-700">
                Name *
                <input required className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
              </label>
              <label className="text-sm font-semibold text-gray-700">
                Email *
                <input required type="email" className="input mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
              </label>
              <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
                Organization <span className="font-normal text-gray-400">(optional)</span>
                <input className="input mt-1" value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} autoComplete="organization" />
              </label>
              <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
                Message *
                <textarea required rows={5} className="input mt-1" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </label>
              {/* Honeypot (hidden from people) */}
              <label className="hidden" aria-hidden="true">
                Website
                <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </label>
              <label className="sm:col-span-2 flex gap-3 text-sm text-gray-600">
                <input
                  required
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                  className="mt-1 h-4 w-4 accent-jebi"
                />
                <span>
                  I agree that the Maroon Tiger Homerun Club and its event partners may use my information to respond to
                  this inquiry. We never sell or share your information.
                </span>
              </label>
              <div className="sm:col-span-2">
                <button type="submit" className="btn-primary uppercase tracking-wider text-sm">
                  <Send className="w-4 h-4" aria-hidden="true" /> Send Message
                </button>
              </div>
            </form>
          )}
        </div>

        <aside className="lg:col-span-5 space-y-5">
          <div className="card p-6 hover:translate-y-0 flex gap-4">
            <HeartHandshake className="w-8 h-8 text-jebi shrink-0" aria-hidden="true" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Sponsorship contact</h2>
              <p className="mt-1 font-display uppercase text-2xl font-bold text-ink">{CONTACTS.sponsorship.name}</p>
              <a href={`tel:${CONTACTS.sponsorship.phone.replace(/\D/g, '')}`} className="mt-2 flex items-center gap-2 text-sm text-jebi hover:underline">
                <Phone className="w-4 h-4" aria-hidden="true" /> {CONTACTS.sponsorship.phone}
              </a>
              <a href={`mailto:${CONTACTS.sponsorship.email}`} className="mt-1 flex items-center gap-2 text-sm text-jebi hover:underline">
                <Mail className="w-4 h-4" aria-hidden="true" /> {CONTACTS.sponsorship.email}
              </a>
            </div>
          </div>
          <div className="card p-6 hover:translate-y-0 flex gap-4">
            <Newspaper className="w-8 h-8 text-jebi shrink-0" aria-hidden="true" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Media contact</h2>
              <p className="mt-1 font-display uppercase text-2xl font-bold text-ink">{CONTACTS.media.name}</p>
              <a href={`mailto:${CONTACTS.media.email}`} className="mt-2 flex items-center gap-2 text-sm text-jebi hover:underline">
                <Mail className="w-4 h-4" aria-hidden="true" /> {CONTACTS.media.email}
              </a>
            </div>
          </div>
          <div className="rounded-3xl bg-jebi text-white p-6">
            <h2 className="font-display uppercase text-2xl font-bold">The Invitational</h2>
            <EventMeta className="mt-3 flex-col !gap-2" />
            <MaybeLink
              href={JEBI.mapUrl}
              className="btn-gold mt-5 text-sm"
              pendingClassName="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white/50"
              pendingLabel="Map coming soon"
            >
              Venue Map
            </MaybeLink>
          </div>
        </aside>
      </section>
    </>
  );
}
