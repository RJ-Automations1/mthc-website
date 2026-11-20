import { Link } from 'react-router-dom';
import { PolicyPage } from '../Legal';

/** Public page that shows carriers how people opt in to fundraiser texts. */
export default function FundraiserTexts() {
  return (
    <PolicyPage
      title="Fundraiser Text Messages"
      intro={
        <p>
          How the Maroon Tiger Homerun Club (MTHC) Player Fundraiser for Morehouse College Baseball collects permission before
          sending text messages, what we send, and how to stop.
        </p>
      }
    >
      <h2>How people opt in</h2>
      <ol className="list-decimal pl-6 space-y-2">
        <li>Each player asks friends and family in person whether they’d like an invitation to the player’s fundraiser by text.</li>
        <li>
          The player signs in to their private player portal on mthc1867.org with their name and PIN and enters the names and
          mobile numbers of the people who said yes.
        </li>
        <li>
          Before any phone number can be saved, the player must check this box. Numbers without it are rejected, and we never
          text a number that wasn’t saved this way:
        </li>
      </ol>

      <figure className="rounded-xl border-2 border-dashed border-gold/60 bg-cream p-4 sm:p-5">
        <figcaption className="text-xs uppercase tracking-wider text-gray-500 mb-3">Player portal: add supporters</figcaption>
        <div className="grid sm:grid-cols-3 gap-2 mb-3 text-sm">
          {['Aunt Pam', 'pam@email.com', '404-555-1234'].map((v) => (
            <div key={v} className="rounded-lg border bg-white px-3 py-2 text-gray-500">{v}</div>
          ))}
        </div>
        <label className="flex items-start gap-2 text-xs text-gray-700 leading-relaxed">
          <input type="checkbox" checked readOnly className="mt-0.5 h-4 w-4 accent-maroon shrink-0" />
          <span>
            Everyone I add with a phone number told me they agree to get texts from the Maroon Tiger Homerun Club (MTHC) about my
            fundraiser: an invitation and up to 3 reminders, ending January 27, 2027. Msg &amp; data rates may apply. They can
            reply STOP to opt out or HELP for help. <span className="text-maroon underline">Text policy</span>
          </span>
        </label>
      </figure>

      <h2>What we send</h2>
      <ul>
        <li>One invitation, then at most 3 reminders (about 3 days later, 10 days later, and 2 days before the fundraiser ends).</li>
        <li>Up to 4 messages total. Texts are sent only between 10am and 7pm Eastern.</li>
        <li>Texts stop as soon as the person gives, replies STOP, or when the fundraiser ends on January 27, 2027.</li>
        <li>Every text starts with “MTHC:” and includes how to opt out.</li>
      </ul>
      <p className="font-semibold text-ink">Sample invitation:</p>
      <blockquote className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-800 max-w-md">
        MTHC: Hi Pam! Jordan Smith of Morehouse Baseball invited you — give any amount &amp; send Jordan a good-luck note:
        https://mthc1867.org/fundraiser/jordan-smith?c=AB12CD Msg &amp; data rates may apply. Reply HELP for help, STOP to opt out.
      </blockquote>
      <p className="font-semibold text-ink">Sample reminder:</p>
      <blockquote className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-800 max-w-md">
        MTHC: Hi Pam, friendly reminder from Jordan's Morehouse Baseball fundraiser! Any amount helps:
        https://mthc1867.org/fundraiser/jordan-smith?c=AB12CD Reply STOP to opt out.
      </blockquote>

      <h2>Stop or get help</h2>
      <ul>
        <li>Reply <strong>STOP</strong> to any text to opt out. You’ll get one confirmation and nothing more.</li>
        <li>
          Reply <strong>HELP</strong> for help, or email{' '}
          <a href="mailto:Info@mthc1867.org" className="text-maroon underline">Info@mthc1867.org</a>.
        </li>
        <li>Message and data rates may apply. Carriers are not liable for delayed or undelivered messages.</li>
      </ul>

      <h2>Your information</h2>
      <p>
        No mobile information will be shared with third parties or affiliates for marketing or promotional purposes, and opt-in
        data and consent are never shared. Read our{' '}
        <Link to="/privacy" className="text-maroon underline">Privacy Policy</Link> and{' '}
        <Link to="/terms" className="text-maroon underline">Terms &amp; Conditions</Link>.
      </p>
    </PolicyPage>
  );
}
