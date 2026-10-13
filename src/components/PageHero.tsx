import type { ReactNode } from 'react';
import type { Photo } from '../lib/photos';

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  image: Photo;
  children?: ReactNode;
}

export default function PageHero({ eyebrow, title, subtitle, image, children }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-ink pt-32 pb-16 md:pt-40 md:pb-24">
      <img
        src={image.src}
        style={{ objectPosition: image.position }}
        alt=""
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60 animate-slow-zoom"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/60 to-maroon-900/40" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-up">
        <span className="eyebrow text-gold">{eyebrow}</span>
        <h1 className="mt-4 font-display uppercase font-bold text-white text-5xl md:text-7xl leading-[0.9]">
          {title}
        </h1>
        {subtitle && <p className="mt-5 max-w-2xl text-lg md:text-xl text-white/75">{subtitle}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
      <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-maroon via-gold to-maroon" />
    </section>
  );
}
