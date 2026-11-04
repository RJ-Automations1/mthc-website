import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Car, Accessibility, CloudRain, Ban, UtensilsCrossed } from 'lucide-react';
import { JEBI } from './data';
import { JebiHero, MaybeLink, SectionHeader } from './components';
import { PHOTOS } from '../../lib/photos';
import usePageTitle from './usePageTitle';
import { jebiPath, mthcPath } from '../../lib/siteMode';

const TIMELINE = [
  { year: 'Chicago', text: 'Grows up in Chicago, Illinois and attends De La Salle Institute.' },
  { year: '1991', text: 'Earns a share of the SIAC Football Championship with the Maroon Tigers — and the nickname “Sanchez.”' },
  { year: '1991', text: 'A two-sport student-athlete, helps reestablish Morehouse baseball after an almost ten-year absence.' },
  { year: '1992', text: 'Graduates from Morehouse College with a Bachelor of Arts in Marketing.' },
  { year: '1993–94', text: 'Joins the Morehouse baseball coaching staff, helping guide the Maroon Tigers to the SIAC Playoffs.' },
  { year: '2018–', text: 'Returns as an assistant coach, continuing his commitment to Morehouse baseball.' },
];

const VENUE_ITEMS = [
  { icon: Car, title: 'Parking', text: 'Parking map and public lots will be posted here.' },
  { icon: Accessibility, title: 'Accessibility', text: 'Accessible entry and seating details coming soon.' },
  { icon: UtensilsCrossed, title: 'Concessions & seating', text: 'Concessions and seating information coming soon.' },
  { icon: Ban, title: 'Bag & venue policy', text: 'Bag rules and prohibited items will be posted before the event.' },
  { icon: CloudRain, title: 'Weather policy', text: 'Weather and delay updates will be posted on the Schedule page.' },
];

export default function JebiAbout() {
  usePageTitle('About');
  return (
    <>
      <JebiHero
        eyebrow="About the Invitational"
        title="Celebrating HBCU baseball"
        subtitle="The tradition, history, and future of HBCU collegiate baseball — and the man who helped bring Morehouse baseball back."
        image={PHOTOS.jebiAboutHero}
      />

      {/* Mission */}
      <section className="container-page grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          <SectionHeader eyebrow="Our mission" title="More than a tournament">
            <p>
              The Jay Edwards Baseball Invitational brings outstanding collegiate baseball programs together for a
              competitive, first-class tournament experience — and a platform for athletes, coaches, alumni, families,
              businesses, and fans to come together.
            </p>
            <p className="mt-4">
              Every sponsorship and donation is an investment in student-athletes, mentorship, education, competition,
              community, and the enduring legacy of HBCU baseball.
            </p>
          </SectionHeader>
        </div>
        <aside className="lg:col-span-5 rounded-3xl bg-jebi text-white p-8 self-start">
          <h3 className="font-display uppercase text-2xl font-bold">Event details</h3>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-gold font-bold uppercase tracking-wider text-xs">Dates</dt>
              <dd className="mt-1 text-lg">{JEBI.dates}</dd>
            </div>
            <div>
              <dt className="text-gold font-bold uppercase tracking-wider text-xs">Venue</dt>
              <dd className="mt-1 text-lg">
                {JEBI.venue}, {JEBI.city}
              </dd>
            </div>
            <div>
              <dt className="text-gold font-bold uppercase tracking-wider text-xs">Presented by</dt>
              <dd className="mt-1 text-lg">Maroon Tiger Homerun Club, Inc.</dd>
            </div>
          </dl>
        </aside>
      </section>

      {/* Jay Edwards story */}
      <section className="bg-white border-y border-black/5">
        <div className="container-page grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <img
              src={PHOTOS.boardFounders.src}
              style={{ objectPosition: PHOTOS.boardFounders.position }}
              alt="MTHC founders — Corby Starr (#11), Jay Edwards (#12) and JTodd Phillips (#3)"
              className="rounded-3xl w-full aspect-[4/5] object-cover shadow-xl lg:sticky lg:top-40"
            />
          </div>
          <div className="lg:col-span-7">
            <SectionHeader eyebrow="The legacy" title={<>Javarro “Jay” Edwards</>}>
              Jay Edwards is an entrepreneur, mentor, coach, and philanthropist whose commitment to Morehouse College,
              baseball, and the development of young men has made a lasting impact. Through his leadership, mentorship,
              coaching, and philanthropy, he has positively influenced countless young men both on and off the field.
            </SectionHeader>
            <ol className="relative border-l-2 border-jebi/20 ml-2 space-y-8">
              {TIMELINE.map((t, i) => (
                <li key={i} className="pl-8 relative">
                  <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-jebi ring-4 ring-white" aria-hidden="true" />
                  <p className="font-display uppercase text-2xl font-bold text-jebi leading-none">{t.year}</p>
                  <p className="mt-2 text-gray-700">{t.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* About MTHC */}
      <section className="container-page grid md:grid-cols-12 gap-8 items-center">
        <img src={PHOTOS.logo} alt="Maroon Tiger Homerun Club logo" className="md:col-span-3 w-40 h-40 rounded-full ring-4 ring-gold/60 mx-auto" />
        <div className="md:col-span-9">
          <SectionHeader eyebrow="Our host" title="Maroon Tiger Homerun Club">
            The Maroon Tiger Homerun Club supports Morehouse College Baseball through fundraising, community
            engagement, and program development. All Invitational proceeds benefit MTHC, Inc. and support scholarships
            and baseball team activities.
          </SectionHeader>
          <MaybeLink href={mthcPath('/about')} className="btn-secondary -mt-4 uppercase tracking-wider text-sm">
            About MTHC <ArrowRight className="w-4 h-4" />
          </MaybeLink>
        </div>
      </section>

      {/* Venue guide */}
      <section className="bg-white border-y border-black/5">
        <div className="container-page">
          <SectionHeader eyebrow="Venue guide" title={JEBI.venue}>
            {JEBI.city}. Full address, directions, and on-site details will be posted here as they are confirmed.
          </SectionHeader>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="card p-6 flex flex-col gap-3">
              <MapPin className="w-7 h-7 text-jebi" aria-hidden="true" />
              <h3 className="font-display uppercase text-xl font-bold">Directions</h3>
              <MaybeLink
                href={JEBI.mapUrl}
                className="btn-primary self-start text-sm"
                pendingClassName="inline-flex items-center gap-2 text-sm font-semibold text-gray-400"
              >
                Open Map
              </MaybeLink>
            </div>
            {VENUE_ITEMS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card p-6 flex flex-col gap-3">
                <Icon className="w-7 h-7 text-jebi" aria-hidden="true" />
                <h3 className="font-display uppercase text-xl font-bold">{title}</h3>
                <p className="text-sm text-gray-600">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to={jebiPath('/partnerships')} className="btn-primary uppercase tracking-wider text-sm">
              Become a Partner
            </Link>
            <Link to={jebiPath('/contact')} className="btn-secondary uppercase tracking-wider text-sm">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
