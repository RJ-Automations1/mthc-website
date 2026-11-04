import { Link } from 'react-router-dom';
import { Ticket, CalendarRange, Mail } from 'lucide-react';
import { JEBI, CONTACTS } from './data';
import { JebiHero, MaybeLink, SectionHeader } from './components';
import { PHOTOS } from '../../lib/photos';
import usePageTitle from './usePageTitle';
import { jebiPath } from '../../lib/siteMode';

const PASSES = [
  { icon: Ticket, name: 'Single-Day Pass', desc: 'Admission for one day of Invitational play — three games.' },
  { icon: CalendarRange, name: 'Full-Event Pass', desc: 'Admission for all three days — all nine games, Feb 5–7.' },
];

const FAQ = [
  { q: 'Is seating general admission or reserved?', a: 'Seating details will be announced with ticket sales.' },
  { q: 'Are there student, senior, child, or group rates?', a: 'Discount and group pricing will be posted here once finalized.' },
  { q: 'Is re-entry allowed?', a: 'Re-entry policy will be announced before the event.' },
  { q: 'Where do I park?', a: `Parking information for ${JEBI.venue} will be posted on the About page venue guide.` },
  { q: 'Is the venue accessible?', a: 'Accessible entry and seating details are being confirmed and will be posted soon.' },
  { q: 'What happens if it rains?', a: 'Weather delays and schedule changes will be posted on the Schedule page. Refund and weather policies will be linked from checkout.' },
];

export default function JebiTickets() {
  usePageTitle('Tickets');
  const pending = !JEBI.ticketsUrl;
  return (
    <>
      <JebiHero
        eyebrow="Tickets"
        title="Experience the Invitational in Atlanta"
        subtitle={`Three days of HBCU baseball at ${JEBI.venue}.`}
        image={PHOTOS.jebiTicketsHero}
      />

      <section className="container-page">
        {pending && (
          <div role="status" className="mb-10 rounded-2xl bg-gold/15 ring-1 ring-gold/40 px-5 py-4 text-ink">
            <strong className="font-semibold">Tickets on sale soon.</strong> Pricing and checkout are being finalized —
            check back here or{' '}
            <Link to={jebiPath('/contact')} className="underline font-semibold text-jebi">
              contact us
            </Link>{' '}
            for group inquiries.
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-6">
          {PASSES.map(({ icon: Icon, name, desc }) => (
            <article key={name} className="card p-8 flex flex-col gap-4">
              <Icon className="w-10 h-10 text-jebi" aria-hidden="true" />
              <h2 className="font-display uppercase text-3xl font-bold text-ink leading-none">{name}</h2>
              <p className="text-gray-600">{desc}</p>
              <p className="font-display text-4xl font-bold text-jebi">
                {pending ? <span className="text-gray-300">Price TBA</span> : 'See checkout'}
              </p>
              <MaybeLink
                href={JEBI.ticketsUrl}
                className="btn-primary self-start uppercase tracking-wider text-sm"
                pendingClassName="inline-flex items-center gap-2 self-start rounded-full bg-gray-100 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-gray-400 cursor-not-allowed"
                pendingLabel="On sale soon"
              >
                Buy Tickets
              </MaybeLink>
              {!pending && <p className="text-xs text-gray-500">You'll complete your purchase on our ticketing partner's secure site.</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white border-y border-black/5">
        <div className="container-page grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <SectionHeader eyebrow="Fan info" title="Before you go" />
            <div className="rounded-2xl bg-jebi text-white p-6">
              <h3 className="font-display uppercase text-xl font-bold">Ticket support</h3>
              <p className="mt-2 text-sm text-white/75">Questions about tickets or groups?</p>
              <a
                href={`mailto:${CONTACTS.general.email}?subject=${encodeURIComponent('JEBI Tickets')}`}
                className="mt-4 inline-flex items-center gap-2 font-semibold text-gold hover:text-gold-light"
              >
                <Mail className="w-4 h-4" aria-hidden="true" /> {CONTACTS.general.email}
              </a>
            </div>
          </div>
          <dl className="lg:col-span-8 divide-y divide-gray-100">
            {FAQ.map((f) => (
              <div key={f.q} className="py-5">
                <dt className="font-display uppercase text-xl font-bold text-ink">{f.q}</dt>
                <dd className="mt-2 text-gray-600">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
