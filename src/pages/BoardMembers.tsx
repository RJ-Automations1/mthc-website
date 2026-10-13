import { useEffect, useState } from 'react';
import { Users, Mail } from 'lucide-react';
import PageHero from '../components/PageHero';
import { PHOTOS } from '../lib/photos';

interface BoardMember {
  id: number;
  name: string;
  title: string;
  bio: string | null;
  imageUrl: string | null;
  order: number;
}

// Jersey numbers from the founders photo, keyed by last name
const JERSEYS: Record<string, number> = { starr: 11, edwards: 12, phillips: 3 };
const jerseyNumber = (name: string) => JERSEYS[name.trim().split(/\s+/).pop()!.toLowerCase()];

export default function BoardMembers() {
  const [members, setMembers] = useState<BoardMember[]>([]);

  useEffect(() => {
    fetch('/api/board')
      .then(res => res.json())
      .then(data => setMembers(data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <PageHero
        eyebrow="Leadership"
        title={<>Board <span className="text-gold">Members</span></>}
        subtitle="Meet the dedicated leaders who guide the Maroon Tiger Homerun Club."
        image={PHOTOS.boardHero}
      >
        <img
          src={PHOTOS.alumniLogo}
          alt="Morehouse Baseball Alumni Association"
          className="h-20 w-20 rounded-full bg-white p-1 shadow-lg"
        />
      </PageHero>

      {/* Founders feature */}
      <section className="container-page pb-0">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <img
              src={PHOTOS.boardFounders.src}
              style={{ objectPosition: PHOTOS.boardFounders.position }}
              alt="Maroon jerseys for Starr #11, Edwards #12, and Phillips #3"
              className="w-full aspect-[3/2] object-cover rounded-3xl shadow-2xl"
            />
          </div>
          <div className="lg:col-span-5">
            <span className="eyebrow">Our Founders</span>
            <h2 className="section-heading mt-4">Brothers Who Brought the Game Back</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              As Morehouse students, our founders helped reestablish Maroon Tiger baseball in 1991
              after a decade-long absence. Decades later, they're still in the dugout for the program,
              leading the Maroon Tiger Homerun Club in support of today's student-athletes.
            </p>
          </div>
        </div>
      </section>

      {/* Board Members Grid */}
      <section className="container-page">
        <div className="max-w-6xl mx-auto">
          {members.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map(member => {
                const jersey = jerseyNumber(member.name);
                return (
                  <article key={member.id} className="card hover:translate-y-0 p-7 flex flex-col">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 shrink-0 rounded-full overflow-hidden bg-maroon text-white flex items-center justify-center ring-4 ring-gold/30">
                        {member.imageUrl ? (
                          <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                        ) : jersey ? (
                          <span className="font-display text-4xl font-bold leading-none">{jersey}</span>
                        ) : (
                          <Users className="w-9 h-9 text-white/60" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-display uppercase text-2xl font-bold text-ink leading-tight">{member.name}</h3>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark mt-1">{member.title}</p>
                      </div>
                    </div>
                    {member.bio && (
                      <p className="text-gray-600 text-sm mt-5 leading-relaxed">{member.bio}</p>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-maroon/30 mx-auto mb-4" />
              <h3 className="text-xl font-heading font-bold text-gray-700 mb-2">
                Board Members Coming Soon
              </h3>
              <p className="text-gray-500">
                Our board member profiles are being updated. Check back soon!
              </p>
            </div>
          )}

          {/* Contact Section */}
          <div className="mt-16 text-center p-10 bg-white rounded-2xl ring-1 ring-black/5 shadow-sm">
            <h3 className="font-heading font-bold text-2xl text-maroon mb-4">
              Interested in Joining the Board?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We're always looking for passionate alumni and supporters who want to make a
              difference in Morehouse Baseball. If you're interested in serving on the MTHC
              board, we'd love to hear from you.
            </p>
            <a
              href="mailto:Info@mthc1867.org"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Mail className="w-5 h-5" />
              <span>Contact Us at Info@mthc1867.org</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
