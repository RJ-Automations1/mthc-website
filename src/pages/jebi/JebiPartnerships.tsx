import { useState } from 'react';
import { Check, Download, Heart, Mail, Phone, ChevronDown } from 'lucide-react';
import { JEBI, CONTACTS, TIERS, SPONSORS, formatMoney } from './data';
import { JebiHero, MaybeLink, SectionHeader } from './components';
import { PHOTOS } from '../../lib/photos';
import usePageTitle from './usePageTitle';

const inquiryHref = (tier?: string) => {
  const subject = tier ? `JEBI ${tier} Sponsorship Inquiry` : 'JEBI Sponsorship Inquiry';
  return `mailto:${CONTACTS.sponsorship.email}?subject=${encodeURIComponent(subject)}`;
};

// Benefits grouped for the comparison table (cumulative — each tier includes all below it)
const COMPARE = [
  { label: 'Sponsorship acknowledgment, thank-you letter & receipt', from: 0 },
  { label: 'Commemorative item', from: 0 },
  { label: 'Enhanced supporter recognition', from: 1 },
  { label: 'Recognition in select promotional materials', from: 2 },
  { label: 'Sponsor mentions between innings', from: 3 },
  { label: 'Company banner, photo & ceremonial handshake', from: 4 },
  { label: 'Swag-bag & branded giveaway items', from: 4 },
  { label: 'SIAC Network commercial', from: 4, note: ['', '', '', '', '15 sec', '30 sec'] },
  { label: 'Logo on website, marketing & social media', from: 4 },
  { label: 'Title naming & press release recognition', from: 5 },
  { label: '5th/7th-inning stretch recognition', from: 5 },
  { label: 'One-on-one time & photo with Jay Edwards', from: 5 },
];

export default function JebiPartnerships() {
  usePageTitle('Partnerships');
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      <JebiHero
        eyebrow="Partnerships"
        title="Support HBCU baseball & the legacy of Jay Edwards"
        subtitle="Your sponsorship is more than a financial contribution — it's an investment in student-athletes, mentorship, education, and community."
        image={PHOTOS.jebiPartnersHero}
      >
        <div className="flex flex-wrap gap-3">
          <a href={inquiryHref()} className="btn-gold uppercase tracking-wider text-sm">
            Become a Sponsor
          </a>
          <MaybeLink href={JEBI.donateUrl} className="btn-ghost-light uppercase tracking-wider text-sm">
            <Heart className="w-4 h-4" /> Make a Donation
          </MaybeLink>
          <a href={JEBI.sponsorPacket} className="btn-ghost-light uppercase tracking-wider text-sm">
            <Download className="w-4 h-4" /> Sponsor Packet (PDF)
          </a>
        </div>
      </JebiHero>

      {/* Tier cards */}
      <section className="container-page">
        <SectionHeader eyebrow="Sponsorship levels" title="Six ways to partner">
          Each level includes all the benefits of the levels before it. Donations of any amount are always welcomed and
          greatly appreciated.
        </SectionHeader>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TIERS.map((tier, i) => {
            const open = expanded === tier.name;
            const premium = i >= 4;
            const shown = open ? tier.benefits : tier.benefits.slice(0, 4);
            return (
              <article
                key={tier.name}
                className={`card flex flex-col ${premium ? 'ring-2 ring-gold/60' : ''}`}
              >
                <div className={`p-6 ${premium ? 'bg-gradient-to-br from-jebi-dark to-ink' : 'bg-jebi'} text-white`}>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">{tier.name} Sponsor</p>
                  <p className="mt-2 font-display text-5xl font-bold leading-none">{formatMoney(tier.amount)}</p>
                </div>
                <div className="p-6 flex flex-col gap-4 flex-1">
                  <p className="text-sm text-gray-600">{tier.pitch}</p>
                  <ul className="space-y-2 text-sm" id={`${tier.name}-benefits`}>
                    {shown.map((b) => (
                      <li key={b} className="flex gap-2">
                        <Check className="w-4 h-4 text-jebi shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  {tier.benefits.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setExpanded(open ? null : tier.name)}
                      aria-expanded={open}
                      aria-controls={`${tier.name}-benefits`}
                      className="self-start inline-flex items-center gap-1 text-sm font-semibold text-jebi hover:underline"
                    >
                      {open ? 'Show fewer' : `All ${tier.benefits.length} benefits`}
                      <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                  )}
                  <a href={inquiryHref(tier.name)} className="btn-primary mt-auto uppercase tracking-wider text-sm">
                    Inquire — {tier.name}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Comparison */}
      <section className="bg-white border-y border-black/5">
        <div className="container-page">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <SectionHeader eyebrow="Compare" title="Benefits at a glance" />
            <a href={JEBI.sponsorPacket} className="btn-secondary self-start md:mb-10 uppercase tracking-wider text-sm">
              <Download className="w-4 h-4" /> Download Packet
            </a>
          </div>
          <div className="overflow-x-auto rounded-2xl ring-1 ring-black/5">
            <table className="w-full min-w-[760px] text-sm">
              <caption className="sr-only">Sponsorship benefits by level</caption>
              <thead className="bg-jebi text-white">
                <tr>
                  <th scope="col" className="text-left p-4 font-semibold">Benefit</th>
                  {TIERS.map((t) => (
                    <th key={t.name} scope="col" className="p-4 text-center">
                      <span className="block font-display uppercase text-lg leading-none">{t.name}</span>
                      <span className="block text-xs text-gold mt-1">{formatMoney(t.amount)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {COMPARE.map((row) => (
                  <tr key={row.label} className="even:bg-gray-50/60">
                    <th scope="row" className="text-left p-4 font-medium text-gray-700">{row.label}</th>
                    {TIERS.map((t, i) => (
                      <td key={t.name} className="p-4 text-center">
                        {i >= row.from ? (
                          row.note?.[i] ? (
                            <span className="font-semibold text-jebi">{row.note[i]}</span>
                          ) : (
                            <Check className="w-5 h-5 text-jebi mx-auto" aria-label="Included" />
                          )
                        ) : (
                          <span className="text-gray-300" aria-label="Not included">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Contact + payment */}
      <section className="container-page grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-jebi text-white p-8 md:p-10">
          <span className="eyebrow text-gold">Sponsorship contact</span>
          <h2 className="mt-3 font-display uppercase text-4xl font-bold leading-none">{CONTACTS.sponsorship.name}</h2>
          <ul className="mt-6 space-y-3">
            <li>
              <a href={`tel:${CONTACTS.sponsorship.phone.replace(/\D/g, '')}`} className="inline-flex items-center gap-3 hover:text-gold">
                <Phone className="w-5 h-5 text-gold" aria-hidden="true" /> {CONTACTS.sponsorship.phone}
              </a>
            </li>
            <li>
              <a href={inquiryHref()} className="inline-flex items-center gap-3 hover:text-gold">
                <Mail className="w-5 h-5 text-gold" aria-hidden="true" /> {CONTACTS.sponsorship.email}
              </a>
            </li>
          </ul>
          <p className="mt-6 text-sm text-white/70">
            For wire transfer instructions, please contact {CONTACTS.sponsorship.name} directly.
          </p>
        </div>
        <div className="card p-8 md:p-10 hover:translate-y-0">
          <span className="eyebrow">Pay by check</span>
          <h2 className="mt-3 font-display uppercase text-3xl font-bold text-ink leading-none">Mail your contribution</h2>
          <p className="mt-4 text-gray-600">
            Make checks payable to <strong>{CONTACTS.checks.payable}</strong>.
          </p>
          <address className="mt-4 not-italic text-ink font-semibold leading-relaxed">
            {CONTACTS.checks.attn}
            <br />
            {CONTACTS.checks.address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <p className="mt-6 text-sm text-gray-500">
            Contributions help cover Invitational operating expenses; remaining proceeds support scholarships and
            Morehouse Baseball.
          </p>
          <MaybeLink href={JEBI.donateUrl} className="btn-secondary mt-6 uppercase tracking-wider text-sm">
            <Heart className="w-4 h-4" /> Give Online
          </MaybeLink>
        </div>
      </section>

      {/* Approved partner wall */}
      {SPONSORS.length > 0 && (
        <section className="bg-white border-t border-black/5">
          <div className="container-page">
            <SectionHeader eyebrow="Thank you" title="Our partners" />
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
              {SPONSORS.map((s) => (
                <li key={s.name} className="card p-6 flex items-center justify-center">
                  <MaybeLink href={s.href ?? null} pendingLabel="" className="block">
                    <img src={s.logo} alt={s.name} className="h-14 w-auto object-contain" />
                  </MaybeLink>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
