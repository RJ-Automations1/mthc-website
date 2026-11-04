import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Radio, BarChart3, CalendarDays, Download, Newspaper, Camera, Megaphone, Archive, Mail, BadgeCheck } from 'lucide-react';
import { JEBI, CONTACTS } from './data';
import { JebiHero, MaybeLink, PhotoGallery, SectionHeader } from './components';
import { PHOTOS } from '../../lib/photos';
import usePageTitle from './usePageTitle';
import { jebiPath } from '../../lib/siteMode';

const PRESS_KIT = [
  { label: 'Official JEBI logo (PNG)', href: '/images/jebi/jebi-logo.png' },
  { label: 'Official JEBI logo (SVG, vector)', href: '/images/jebi/jebi-logo.svg' },
  { label: 'Sponsorship packet & Jay Edwards bio (PDF)', href: JEBI.sponsorPacket },
  { label: 'Event fact sheet', href: null },
  { label: 'Team facts & media notes', href: null },
];

const SECTIONS = [
  { icon: Newspaper, title: 'Latest news', text: 'Press releases, game previews, and recaps will be published here by Perez Sports Group.' },
  { icon: Camera, title: 'Video highlights', text: 'Game highlights and interviews will be posted during and after the event.' },
  { icon: Megaphone, title: 'Advisories & game-day notes', text: 'Media advisories, lineup notes, and official updates will appear here on game days.' },
  { icon: Archive, title: 'Archive', text: 'Final scores, box scores, recaps, and highlights will be archived after the Invitational.' },
];

const blank = { name: '', outlet: '', assignment: '', email: '', mobile: '', access: '' };

export default function JebiMedia() {
  usePageTitle('Media');
  const [form, setForm] = useState(blank);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof blank) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const body = [
      'JEBI Media Credential Request',
      '',
      `Name: ${form.name}`,
      `Outlet: ${form.outlet}`,
      `Assignment: ${form.assignment}`,
      `Email: ${form.email}`,
      `Mobile: ${form.mobile}`,
      `Access needs: ${form.access || 'None'}`,
    ].join('\n');
    window.location.href = `mailto:${CONTACTS.media.email}?subject=${encodeURIComponent(
      `JEBI Credential Request — ${form.outlet}`,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const pendingBtn =
    'inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white/50';

  return (
    <>
      <JebiHero
        eyebrow="Media"
        title="News · Coverage · Press"
        subtitle="The official source for Invitational coverage and media resources. Media operations led by Perez Sports Group, LLC."
        image={PHOTOS.jebiMediaHero}
      >
        <div className="flex flex-wrap gap-3">
          <MaybeLink href={JEBI.watchUrl} className="btn-gold uppercase tracking-wider text-sm" pendingClassName={pendingBtn}>
            <Radio className="w-4 h-4" /> Watch the Games
          </MaybeLink>
          <MaybeLink href={JEBI.liveStatsUrl} className="btn-ghost-light uppercase tracking-wider text-sm" pendingClassName={pendingBtn}>
            <BarChart3 className="w-4 h-4" /> Live Stats
          </MaybeLink>
          <Link to={jebiPath('/schedule')} className="btn-ghost-light uppercase tracking-wider text-sm">
            <CalendarDays className="w-4 h-4" /> Schedule
          </Link>
        </div>
      </JebiHero>

      <section className="container-page">
        <div className="grid sm:grid-cols-2 gap-5">
          {SECTIONS.map(({ icon: Icon, title, text }) => (
            <article key={title} className="card p-6 flex gap-4">
              <Icon className="w-8 h-8 text-jebi shrink-0" aria-hidden="true" />
              <div>
                <h2 className="font-display uppercase text-2xl font-bold text-ink leading-none">{title}</h2>
                <p className="mt-2 text-gray-600 text-sm">{text}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-gray-400">Coming soon</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16">
          <SectionHeader eyebrow="Gallery" title="Photos">
            Event photography will be added during and after the Invitational.
          </SectionHeader>
          <PhotoGallery photos={PHOTOS.jebiGallery} />
        </div>
      </section>

      <section className="bg-white border-y border-black/5">
        <div className="container-page grid lg:grid-cols-12 gap-10">
          {/* Credential form */}
          <div className="lg:col-span-7">
            <SectionHeader eyebrow="For working media" title="Request credentials">
              Credential requests are reviewed and approved individually by Perez Sports Group.
            </SectionHeader>
            {sent ? (
              <div role="status" className="rounded-2xl bg-jebi/5 ring-1 ring-jebi/20 p-6">
                <BadgeCheck className="w-8 h-8 text-jebi" aria-hidden="true" />
                <p className="mt-3 font-semibold text-ink">Your email app should now be open with your request.</p>
                <p className="mt-1 text-sm text-gray-600">
                  Press send to submit it. If nothing opened, email{' '}
                  <a className="text-jebi underline" href={`mailto:${CONTACTS.media.email}`}>
                    {CONTACTS.media.email}
                  </a>{' '}
                  directly.
                </p>
                <button type="button" className="mt-4 text-sm font-semibold text-jebi hover:underline" onClick={() => { setForm(blank); setSent(false); }}>
                  Start another request
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
                <label className="text-sm font-semibold text-gray-700">
                  Full name *
                  <input required className="input mt-1" value={form.name} onChange={set('name')} autoComplete="name" />
                </label>
                <label className="text-sm font-semibold text-gray-700">
                  Outlet *
                  <input required className="input mt-1" value={form.outlet} onChange={set('outlet')} autoComplete="organization" />
                </label>
                <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
                  Assignment *
                  <input required className="input mt-1" value={form.assignment} onChange={set('assignment')} placeholder="e.g. Game coverage, photography, broadcast" />
                </label>
                <label className="text-sm font-semibold text-gray-700">
                  Email *
                  <input required type="email" className="input mt-1" value={form.email} onChange={set('email')} autoComplete="email" />
                </label>
                <label className="text-sm font-semibold text-gray-700">
                  Mobile *
                  <input required type="tel" className="input mt-1" value={form.mobile} onChange={set('mobile')} autoComplete="tel" />
                </label>
                <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
                  Access needs
                  <textarea rows={3} className="input mt-1" value={form.access} onChange={set('access')} placeholder="Field access, broadcast position, accessibility needs…" />
                </label>
                <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3">
                  <button type="submit" className="btn-primary uppercase tracking-wider text-sm">
                    Submit Request
                  </button>
                  <p className="text-xs text-gray-500">Opens your email app, addressed to Perez Sports Group.</p>
                </div>
              </form>
            )}
          </div>

          {/* Press kit + contact */}
          <aside className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-jebi text-white p-8">
              <span className="eyebrow text-gold">Media contact</span>
              <h3 className="mt-3 font-display uppercase text-3xl font-bold leading-none">{CONTACTS.media.name}</h3>
              <a href={`mailto:${CONTACTS.media.email}`} className="mt-5 inline-flex items-center gap-2 font-semibold text-gold hover:text-gold-light">
                <Mail className="w-4 h-4" aria-hidden="true" /> {CONTACTS.media.email}
              </a>
            </div>
            <div className="card p-8 hover:translate-y-0">
              <h3 className="font-display uppercase text-2xl font-bold text-ink">Press kit</h3>
              <ul className="mt-4 space-y-3">
                {PRESS_KIT.map((item) => (
                  <li key={item.label}>
                    <MaybeLink
                      href={item.href}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-jebi hover:underline"
                      pendingClassName="inline-flex items-center gap-2 text-sm text-gray-400"
                    >
                      <Download className="w-4 h-4" aria-hidden="true" /> {item.label}
                    </MaybeLink>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-gray-500">
                Logos may be used for editorial coverage of the Invitational only. Please do not alter the marks.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
