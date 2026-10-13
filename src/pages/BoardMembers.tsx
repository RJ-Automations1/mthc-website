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

      {/* Board Members Grid */}
      <section className="container-page">
        <div className="max-w-6xl mx-auto">
          {members.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {members.map(member => (
                <div key={member.id} className="card p-6 text-center">
                  <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden bg-maroon/10 flex items-center justify-center">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-12 h-12 text-maroon/40" />
                    )}
                  </div>
                  <h3 className="font-heading font-bold text-xl text-maroon">{member.name}</h3>
                  <p className="text-gold-dark font-medium mt-1">{member.title}</p>
                  {member.bio && (
                    <p className="text-gray-600 text-sm mt-3 leading-relaxed">{member.bio}</p>
                  )}
                </div>
              ))}
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
