import { Link } from 'react-router-dom';
import { Target, Heart, Users, Award } from 'lucide-react';

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-maroon py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
            About Us
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            The Maroon Tiger Homerun Club is the official booster organization
            for Morehouse College Baseball.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="container-page">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-heading text-center">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed text-center mb-12">
            The Maroon Tiger Homerun Club (MTHC) exists to support, promote, and advance
            the Morehouse College Baseball program. Through fundraising, community engagement,
            and strategic partnerships, we provide resources that enable our student-athletes
            to excel both on the field and in the classroom.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-8">
              <div className="w-12 h-12 bg-maroon/10 rounded-full flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-maroon" />
              </div>
              <h3 className="font-heading font-bold text-xl text-maroon mb-3">Our Vision</h3>
              <p className="text-gray-600">
                To build Morehouse Baseball into a nationally recognized program that develops
                champions on the diamond and leaders in life, rooted in the tradition of
                excellence that defines Morehouse College.
              </p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 bg-maroon/10 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-maroon" />
              </div>
              <h3 className="font-heading font-bold text-xl text-maroon mb-3">Our Values</h3>
              <p className="text-gray-600">
                Excellence, brotherhood, integrity, and service. We believe in the power of
                athletics to transform lives and build character in young men who will go on
                to lead in their communities.
              </p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 bg-maroon/10 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-maroon" />
              </div>
              <h3 className="font-heading font-bold text-xl text-maroon mb-3">Community</h3>
              <p className="text-gray-600">
                We are a community of alumni, parents, fans, and supporters united by our
                love for Morehouse Baseball. Together, we create opportunities for the next
                generation of Maroon Tigers.
              </p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 bg-maroon/10 rounded-full flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-maroon" />
              </div>
              <h3 className="font-heading font-bold text-xl text-maroon mb-3">Impact</h3>
              <p className="text-gray-600">
                Your support directly funds equipment, travel, facility improvements,
                scholarships, and training resources that make a tangible difference in the
                lives of our student-athletes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-heading text-center mb-12">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">⚾</div>
              <h3 className="font-heading font-bold text-lg text-maroon mb-2">Equipment & Gear</h3>
              <p className="text-gray-600">
                Providing top-quality bats, gloves, uniforms, and training equipment
                for our players.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">✈️</div>
              <h3 className="font-heading font-bold text-lg text-maroon mb-2">Travel Support</h3>
              <p className="text-gray-600">
                Funding travel expenses for away games and tournament appearances
                across the SIAC.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🏟️</div>
              <h3 className="font-heading font-bold text-lg text-maroon mb-2">Facility Upgrades</h3>
              <p className="text-gray-600">
                Investing in field improvements, batting cages, and training facilities
                for our program.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-maroon">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">
            Join the MTHC Family
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Whether you're an alumnus, parent, or fan, there's a place for you in the
            Maroon Tiger Homerun Club.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/donate" className="btn-gold text-lg px-8 py-4 inline-block text-center">
              Make a Donation
            </Link>
            <a
              href="mailto:Info@mthc1867.org"
              className="bg-white/10 border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-colors text-center"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
