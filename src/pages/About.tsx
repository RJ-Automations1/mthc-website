import { Link } from 'react-router-dom';
import { Target, Heart, Users, Award, Package, Plane, Building2, ArrowRight, Mail } from 'lucide-react';
import PageHero from '../components/PageHero';
import { PHOTOS } from '../lib/photos';

const PILLARS = [
  {
    icon: Target,
    title: 'Our Vision',
    text: 'To build Morehouse Baseball into a nationally recognized program that develops champions on the diamond and leaders in life, rooted in the tradition of excellence that defines Morehouse College.',
  },
  {
    icon: Heart,
    title: 'Our Values',
    text: 'Excellence, brotherhood, integrity, and service. We believe in the power of athletics to transform lives and build character in young men who will go on to lead in their communities.',
  },
  {
    icon: Users,
    title: 'Community',
    text: 'We are a community of alumni, parents, fans, and supporters united by our love for Morehouse Baseball. Together, we create opportunities for the next generation of Maroon Tigers.',
  },
  {
    icon: Award,
    title: 'Impact',
    text: 'Your support directly funds equipment, travel, facility improvements, scholarships, and training resources that make a tangible difference in the lives of our student-athletes.',
  },
];

const WHAT_WE_DO = [
  { icon: Package, title: 'Equipment & Gear', text: 'Providing top-quality bats, gloves, uniforms, and training equipment for our players.' },
  { icon: Plane, title: 'Travel Support', text: 'Funding travel expenses for away games and tournament appearances across the SIAC.' },
  { icon: Building2, title: 'Facility Upgrades', text: 'Investing in field improvements, batting cages, and training facilities for our program.' },
];

export default function About() {
  return (
    <div>
      <PageHero
        eyebrow="About Us"
        title={<>More Than <span className="text-gold">a Booster Club</span></>}
        subtitle="The Maroon Tiger Homerun Club is the official booster organization for Morehouse College Baseball."
        image={PHOTOS.aboutHero}
      />

      {/* Mission */}
      <section className="container-page">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <span className="eyebrow">Our Mission</span>
            <h2 className="section-heading mt-4">Support. Promote. Advance.</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              The Maroon Tiger Homerun Club (MTHC) exists to support, promote, and advance the Morehouse
              College Baseball program. Through fundraising, community engagement, and strategic
              partnerships, we provide resources that enable our student-athletes to excel both on the
              field and in the classroom.
            </p>
          </div>
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
            {PILLARS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card p-7">
                <div className="w-11 h-11 rounded-xl bg-maroon/10 text-maroon flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="mt-5 font-display uppercase text-2xl font-bold text-ink">{title}</h3>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 md:py-24 bg-ink text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="eyebrow text-gold">Where Your Gift Goes</span>
          <h2 className="section-heading text-white mt-4 mb-12">What We Do</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {WHAT_WE_DO.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="relative rounded-2xl bg-white/5 ring-1 ring-white/10 p-8 overflow-hidden">
                <span className="absolute right-5 top-2 font-display text-8xl font-bold text-white/5">0{i + 1}</span>
                <Icon className="w-8 h-8 text-gold" />
                <h3 className="mt-6 font-display uppercase text-2xl font-bold">{title}</h3>
                <p className="mt-2 text-white/65">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="eyebrow justify-center">Get Involved</span>
          <h2 className="section-heading mt-4">Join the MTHC Family</h2>
          <p className="text-gray-600 text-lg mb-8">
            Whether you're an alumnus, parent, or fan, there's a place for you in the Maroon Tiger Homerun Club.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/donate" className="btn-primary px-8 py-4 uppercase tracking-wider text-sm">
              Make a Donation <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="mailto:Info@mthc1867.org" className="btn-secondary px-8 py-4 uppercase tracking-wider text-sm">
              <Mail className="w-4 h-4" /> Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
