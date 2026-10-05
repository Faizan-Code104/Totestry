import React from "react";

import { BUSINESS_INFO } from "../storeInfo";
import {
  PolicyContact,
  PolicyNote,
  PolicyPage,
  PolicySection,
} from "./PolicyKit";

const UPDATED = { iso: "2026-10-04", label: "October 4, 2026" };

const SECTIONS = [
  { id: "about", title: "About these technologies" },
  { id: "essential", title: "Essential technologies" },
  { id: "preferences", title: "Preference technologies" },
  { id: "analytics", title: "Analytics technologies" },
  { id: "advertising", title: "Advertising technologies" },
  { id: "payment", title: "Payment information" },
  { id: "managing", title: "Managing cookies" },
  { id: "changes", title: "Policy changes" },
  { id: "contact", title: "Contact" },
];

const CookiePolicy = () => {
  return (
    <PolicyPage
      name="Cookie Policy"
      index="09"
      eyebrow={`${BUSINESS_INFO.businessName} / Website information`}
      title={
        <>
          Cookie <em>Policy.</em>
        </>
      }
      summary="Cookies, local storage, and similar website technologies."
      updated={UPDATED}
      sections={SECTIONS}
      introLabel="Cookies & similar technologies"
      intro={
        <>
          This Cookie Policy explains how {BUSINESS_INFO.businessName} uses
          cookies, local storage, session technologies, and similar tools
          {BUSINESS_INFO.website ? (
            <>
              {" "}
              on <a href={BUSINESS_INFO.website}>{BUSINESS_INFO.website}</a>
            </>
          ) : (
            " on our website"
          )}
          .
        </>
      }
      help={{
        title: "A privacy question?",
        text: "Contact us if you have questions about cookies or website privacy.",
      }}
    >
      <PolicySection
        id="about"
        number={1}
        title="What are cookies and similar technologies?"
      >
        <p>
          Cookies are small files stored through a browser. Local storage and
          session storage allow a website to remember information on a
          device.
        </p>
        <p>
          These technologies may help operate website features, maintain a
          shopping cart, remember preferences, support account access, and
          understand website performance.
        </p>
      </PolicySection>

      <PolicySection id="essential" number={2} title="Essential technologies">
        <p>These support necessary functions such as:</p>

        <ul className="tt-policy-list">
          <li>Website navigation.</li>
          <li>Shopping-cart operation.</li>
          <li>Account login.</li>
          <li>Security.</li>
          <li>Fraud prevention.</li>
          <li>Remembering privacy choices.</li>
        </ul>

        <PolicyNote>
          <p>
            Disabling essential technologies may prevent parts of the website
            from working correctly.
          </p>
        </PolicyNote>
      </PolicySection>

      <PolicySection
        id="preferences"
        number={3}
        title="Preference technologies"
      >
        <p>
          These remember selections such as account settings, display
          preferences, or shopping-cart contents.
        </p>
      </PolicySection>

      <PolicySection id="analytics" number={4} title="Analytics technologies">
        <p>
          If enabled, analytics technologies help us understand how visitors
          use the website, identify technical errors, and improve
          performance.
        </p>
      </PolicySection>

      <PolicySection
        id="advertising"
        number={5}
        title="Advertising technologies"
      >
        <p>
          If advertising tools are enabled, they may help measure advertising
          performance or provide relevant advertising. Where required by law,
          these technologies will be subject to consent or opt-out rights.
        </p>
      </PolicySection>

      <PolicySection id="payment" number={6} title="Payment information">
        <p>
          Cookies and local storage used by {BUSINESS_INFO.businessName} are
          not intended to store complete payment-card numbers or card
          security codes.
        </p>
        <p>
          When payments are activated, payment providers may use their own
          necessary security and fraud-prevention technologies.
        </p>
      </PolicySection>

      <PolicySection id="managing" number={7} title="Managing cookies">
        <p>
          Customers may block, delete, or restrict cookies through browser
          settings. Doing so may affect shopping-cart, account, and website
          functionality.
        </p>
        <p>
          Where a cookie-preference tool is available, customers may use it
          to manage non-essential technologies.
        </p>
        <p>
          We will recognize legally required browser-based opt-out signals
          where applicable and technically supported.
        </p>
      </PolicySection>

      <PolicySection id="changes" number={8} title="Changes">
        <p>
          We may update this Cookie Policy when our technology, providers, or
          legal obligations change. Updates will be posted with a revised
          date.
        </p>
      </PolicySection>

      <PolicySection id="contact" number={9} title="Contact">
        <PolicyContact />
      </PolicySection>
    </PolicyPage>
  );
};

export default CookiePolicy;