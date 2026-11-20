import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTitle } from './fundraiser/shared';

const UPDATED = 'November 20, 2026';
const CONTACT = 'Info@mthc1867.org';

/** Plain, readable layout for policy pages. */
export function PolicyPage({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  useTitle(title);
  return (
    <div className="bg-cream min-h-screen pb-20">
      {/* Dark band so the transparent site header stays readable */}
      <div className="bg-ink h-48 md:h-56 border-b-4 border-gold/60" />
      <article className="relative -mt-24 mx-4 sm:mx-auto max-w-3xl bg-white rounded-2xl shadow-sm p-6 sm:p-10 text-gray-700 leading-relaxed space-y-4 [&_h2]:font-display [&_h2]:uppercase [&_h2]:text-2xl [&_h2]:text-ink [&_h2]:pt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">
        <p className="eyebrow text-maroon">Maroon Tiger Homerun Club</p>
        <h1 className="font-display uppercase font-bold text-ink text-4xl sm:text-5xl leading-none">{title}</h1>
        <p className="text-sm text-gray-500">Last updated {UPDATED}</p>
        {intro}
        {children}
      </article>
    </div>
  );
}

const Mail = () => (
  <a href={`mailto:${CONTACT}`} className="text-maroon underline">
    {CONTACT}
  </a>
);

export function Privacy() {
  return (
    <PolicyPage
      title="Privacy Policy"
      intro={
        <p>
          The Maroon Tiger Homerun Club (“MTHC”, “we”) is the booster club for Morehouse College Baseball. This policy explains
          what we collect on mthc1867.org and how we use it.
        </p>
      }
    >
      <h2>What we collect</h2>
      <ul>
        <li>Donor details you give us: name, email, donation amount and any note you leave for a player.</li>
        <li>
          Fundraiser contacts: during a player fundraiser, a player may give us the name, email address and/or mobile number of
          friends and family who agreed to hear about it.
        </li>
        <li>Basic records of whether an invitation was opened and whether a gift was made, so we stop reminding people who gave.</li>
      </ul>
      <p>
        Payments are processed by Square. We never see or store your card number.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To process and acknowledge donations, deliver good-luck notes to players and show supporter totals.</li>
        <li>To send fundraiser invitations and a limited number of reminders by email or text message.</li>
        <li>We do not sell, rent or trade personal information.</li>
      </ul>

      <h2>Text messaging (SMS)</h2>
      <p>
        <strong>
          No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. Text
          messaging opt-in data and consent will not be shared with any third parties.
        </strong>{' '}
        We use a messaging provider (Twilio) only to deliver our own texts. Reply STOP to any message to opt out, or HELP for help.
        See our <Link to="/fundraiser/texts" className="text-maroon underline">text message policy</Link>.
      </p>

      <h2>Opting out and your choices</h2>
      <p>
        Every email has a link to stop further emails, and every text can be answered with STOP. To have your information
        corrected or deleted, email <Mail />.
      </p>

      <h2>Keeping it safe</h2>
      <p>
        Data is stored in a private database with access limited to MTHC administrators. Fundraiser contact lists are used only
        for that fundraiser.
      </p>

      <h2>Contact</h2>
      <p>
        Maroon Tiger Homerun Club, Morehouse College, 830 Westview Dr SW, Atlanta, GA 30314 · <Mail />
      </p>
    </PolicyPage>
  );
}

export function Terms() {
  return (
    <PolicyPage
      title="Terms & Conditions"
      intro={<p>By using mthc1867.org or receiving messages from the Maroon Tiger Homerun Club (“MTHC”), you agree to these terms.</p>}
    >
      <h2>Donations</h2>
      <p>
        Donations support Morehouse College Baseball through MTHC and are processed by Square. Donations are final; if you
        believe a charge was made in error, email <Mail /> and we will make it right.
      </p>

      <h2>Fundraiser text messages</h2>
      <ul>
        <li>
          <strong>Program:</strong> MTHC Player Fundraiser texts. Messages invite you to support a Morehouse Baseball player and
          leave them a good-luck note.
        </li>
        <li>
          <strong>Who receives them:</strong> people a player added after they agreed to receive fundraiser texts. See{' '}
          <Link to="/fundraiser/texts" className="text-maroon underline">how opt-in works</Link>.
        </li>
        <li>
          <strong>Message frequency:</strong> up to 4 messages per fundraiser (one invitation and up to 3 reminders). Messages
          stop as soon as you give, when you opt out, or when the fundraiser ends on January 27, 2027.
        </li>
        <li>
          <strong>Message and data rates may apply.</strong>
        </li>
        <li>
          <strong>Opt out:</strong> reply STOP at any time. You will get one confirmation and no further texts.
        </li>
        <li>
          <strong>Help:</strong> reply HELP, or email <Mail />.
        </li>
        <li>Carriers are not liable for delayed or undelivered messages.</li>
      </ul>

      <h2>Notes to players</h2>
      <p>
        Good-luck notes are delivered to the player you choose. Please keep them kind; MTHC may remove notes that are abusive or
        inappropriate.
      </p>

      <h2>Privacy</h2>
      <p>
        Our <Link to="/privacy" className="text-maroon underline">Privacy Policy</Link> explains how we handle your information.
      </p>

      <h2>Contact</h2>
      <p>
        Maroon Tiger Homerun Club, Morehouse College, 830 Westview Dr SW, Atlanta, GA 30314 · <Mail />
      </p>
    </PolicyPage>
  );
}
