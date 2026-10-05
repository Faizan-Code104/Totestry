import React from "react";
import { Link } from "react-router-dom";

import { BUSINESS_INFO, getFullAddress, getEmailLink } from "../storeInfo";
import { PolicyPage, PolicySection } from "./PolicyKit";

const brand = BUSINESS_INFO.businessName;

const UPDATED = { iso: "2026-10-04", label: "October 4, 2026" };

// Business name, address, email, phone and hours — read from storeInfo.js
const BusinessDetails = ({ showHours = false }) => {
  const address = getFullAddress();

  const supportSchedule = [
    BUSINESS_INFO.businessDays,
    BUSINESS_INFO.supportHours,
    BUSINESS_INFO.timeZone,
  ]
    .filter(Boolean)
    .join(", ");

  const phone = BUSINESS_INFO.phoneDisplay || BUSINESS_INFO.phoneHref;
  const phoneHref = BUSINESS_INFO.phoneHref
    ? `tel:${BUSINESS_INFO.phoneHref.replace(/^tel:/i, "")}`
    : "";

  return (
    <address className="tt-policy-address">
      <strong>{brand}</strong>

      {address && <span>{address}</span>}

      {BUSINESS_INFO.email && (
        <span>
          Email: <a href={getEmailLink()}>{BUSINESS_INFO.email}</a>
        </span>
      )}

      {phone && (
        <span>
          Phone: {phoneHref ? <a href={phoneHref}>{phone}</a> : phone}
        </span>
      )}

      {showHours && supportSchedule && (
        <span>Support Hours: {supportSchedule}</span>
      )}
    </address>
  );
};

const sections = [
  {
    title: "Business Operator",
    content: (
      <>
        <p>The website and {brand} brand are operated by:</p>
        <BusinessDetails />
      </>
    ),
  },
  {
    title: "Eligibility",
    content: (
      <>
        <p>
          You must be at least 18 years old or have the involvement and
          permission of a parent or legal guardian to use this website or
          place an order.
        </p>
        <p>
          You agree to provide accurate, current, and complete information.
        </p>
      </>
    ),
  },
  {
    title: "Products",
    content: (
      <>
        <p>
          {brand} sells handbags, tote bags, crossbody bags, shoulder bags,
          and related fashion accessories.
        </p>
        <p>
          We make reasonable efforts to display product descriptions,
          materials, dimensions, colors, availability, and images
          accurately. Colors and appearance may vary slightly depending on
          lighting, photography, manufacturing variations, and device-screen
          settings.
        </p>
        <p>
          Product images are illustrative of the item offered. Customers
          should review the complete product description before purchasing.
        </p>
      </>
    ),
  },
  {
    title: "Prices and Currency",
    content: (
      <>
        <p>
          All prices are displayed and charged in United States dollars
          unless clearly stated otherwise.
        </p>
        <p>
          Applicable sales tax will be calculated and disclosed during
          checkout where required.
        </p>
        <p>
          We may correct accidental pricing, description, inventory, or
          typographical errors. If an error affects an order, we will
          contact the customer before fulfillment and provide the option to
          accept the correction or receive a cancellation and full refund.
        </p>
      </>
    ),
  },
  {
    title: "Online Orders",
    content: (
      <>
        <p>
          Submitting an order is an offer to purchase. An order is not
          accepted until:
        </p>
        <ul>
          <li>Required payment is successfully authorized.</li>
          <li>We confirm product availability.</li>
          <li>We issue an order confirmation.</li>
        </ul>
        <p>
          We may decline or cancel an order because of inventory errors,
          inaccurate information, suspected fraud, payment failure, delivery
          restrictions, pricing errors, or legal requirements.
        </p>
        <p>
          If we cancel a paid order, the full amount collected for the
          canceled items will be refunded to the original payment method.
        </p>
      </>
    ),
  },
  {
    title: "Payment",
    content: (
      <>
        <p>
          {brand} accepts online electronic payments only through the
          payment methods displayed at checkout. We do not accept Cash on
          Delivery.
        </p>
        <p>
          Online payment processing is currently being set up. Until an
          active payment method is displayed and payment is successfully
          authorized, no completed purchase will be accepted through the
          website.
        </p>
        <p>
          Once activated, payments will be securely processed by an
          authorized third-party payment provider. {brand} does not offer
          subscription billing or automatically recurring product charges.
        </p>
        <p>
          The exact approved billing descriptor will be disclosed at
          checkout or in the order confirmation before live card payments
          are accepted.
        </p>
      </>
    ),
  },
  {
    title: "Fraud Prevention",
    content: (
      <>
        <p>
          We may use reasonable verification and fraud-prevention measures.
          An order may be held, canceled, or declined if:
        </p>
        <ul>
          <li>Billing or shipping information cannot be verified.</li>
          <li>Payment authorization fails.</li>
          <li>The order appears unauthorized or fraudulent.</li>
          <li>
            Additional verification requested from the customer is not
            provided.
          </li>
          <li>
            The transaction violates payment-network or legal requirements.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Shipping",
    content: (
      <>
        <p>Orders are generally processed within 1–2 business days.</p>
        <p>
          After processing, estimated standard delivery is 3–7 business
          days. These periods exclude weekends, federal holidays, severe
          weather, carrier delays, and circumstances outside our reasonable
          control.
        </p>
        <p>
          Free standard shipping is offered on eligible orders delivered
          within our published U.S. shipping area.
        </p>
        <p>
          Complete shipping terms are provided in our{" "}
          <Link to="/shipping-policy">Shipping Policy</Link>.
        </p>
      </>
    ),
  },
  {
    title: "Order Tracking",
    content: (
      <>
        <p>
          When tracking is available, customers will receive tracking
          information through the email address provided with the order.
        </p>
        <p>
          Tracking updates are supplied by the carrier and may take time to
          appear after a shipping label is created.
        </p>
      </>
    ),
  },
  {
    title: "Cancellations and Address Changes",
    content: (
      <>
        <p>
          Customers should contact us immediately to request a cancellation
          or shipping-address change.
        </p>
        <p>
          A cancellation or modification is available only before the order
          has shipped. Once an order has shipped, it is governed by our
          Return and Refund Policy.
        </p>
        <p>
          We cannot guarantee that an address can be changed after an order
          enters fulfillment.
        </p>
      </>
    ),
  },
  {
    title: "Returns and Refunds",
    content: (
      <>
        <p>
          Eligible products may be returned within 30 days of confirmed
          delivery.
        </p>
        <p>
          Returned products must generally be unused, unworn, unaltered, and
          in their original condition with tags and original packaging.
        </p>
        <p>
          We do not offer direct product exchanges. Customers may return an
          eligible item for a refund and place a separate order for another
          product.
        </p>
        <p>
          No restocking fee is charged on an eligible return. Change-of-mind
          return shipping is the customer’s responsibility. {brand} covers
          reasonable return shipping for verified damaged, defective, or
          incorrect items.
        </p>
        <p>
          Complete conditions are provided in our{" "}
          <Link to="/return-policy">Return and Refund Policy</Link>.
        </p>
      </>
    ),
  },
  {
    title: "Customer Accounts",
    content: (
      <>
        <p>
          Customers may be allowed to purchase as a guest or create an
          account. You are responsible for:
        </p>
        <ul>
          <li>Keeping account credentials confidential.</li>
          <li>Providing accurate information.</li>
          <li>Restricting unauthorized access to your device.</li>
          <li>Notifying us promptly of suspected unauthorized activity.</li>
        </ul>
        <p>
          We may suspend or close accounts used for fraud, abuse, unlawful
          conduct, or violations of these Terms.
        </p>
      </>
    ),
  },
  {
    title: "Acceptable Use",
    content: (
      <>
        <p>You may not:</p>
        <ul>
          <li>Use the website for unlawful or fraudulent activity.</li>
          <li>
            Attempt unauthorized access to accounts, systems, or data.
          </li>
          <li>
            Introduce malicious code or interfere with website operation.
          </li>
          <li>
            Scrape or copy website content for unauthorized commercial use.
          </li>
          <li>Misrepresent your identity or payment authority.</li>
          <li>
            Place orders using stolen or unauthorized payment credentials.
          </li>
          <li>Infringe intellectual-property or privacy rights.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Intellectual Property",
    content: (
      <>
        <p>
          The {brand} name, website design, written content, graphics,
          logos, and original website materials are owned by or licensed to{" "}
          {brand} and are protected by applicable intellectual-property laws.
        </p>
        <p>
          No content may be reproduced, distributed, modified, or
          commercially exploited without written permission, except for
          lawful personal use.
        </p>
      </>
    ),
  },
  {
    title: "Third-Party Services",
    content: (
      <>
        <p>
          The website may rely on third-party services for payment
          processing, hosting, communications, shipping, tracking, or other
          functions.
        </p>
        <p>
          We are not responsible for an independent third party’s systems or
          policies, but we remain responsible for our obligations to
          customers under applicable law.
        </p>
      </>
    ),
  },
  {
    title: "Product Use and Care",
    content: (
      <>
        <p>
          Customers must follow product descriptions and care instructions.
          Damage caused by misuse, accidents, unauthorized alterations,
          improper cleaning, ordinary wear, or failure to follow
          instructions is not considered a manufacturing defect.
        </p>
        <p>
          Nothing in these Terms excludes warranties or consumer rights that
          cannot legally be excluded.
        </p>
      </>
    ),
  },
  {
    title: "Website Availability",
    content: (
      <p>
        We may update, suspend, or restrict website functionality for
        maintenance, security, technical, or business reasons. We do not
        guarantee uninterrupted or error-free availability.
      </p>
    ),
  },
  {
    title: "Disclaimer",
    content: (
      <>
        <p>
          To the maximum extent permitted by law, the website and its
          content are provided on an “as available” basis. We do not
          guarantee that every product or website feature will always remain
          available.
        </p>
        <p>
          This disclaimer does not limit any non-waivable legal rights or
          obligations relating to paid products.
        </p>
      </>
    ),
  },
  {
    title: "Limitation of Liability",
    content: (
      <>
        <p>
          To the maximum extent permitted by law, {brand} will not be
          liable for indirect, incidental, special, punitive, or
          consequential damages arising from use of the website.
        </p>
        <p>
          For a claim concerning a purchased product, our aggregate
          liability will not exceed the amount the customer paid for the
          product giving rise to the claim, except where a greater remedy is
          required by law.
        </p>
      </>
    ),
  },
  {
    title: "Indemnification",
    content: (
      <p>
        You agree to be responsible for losses or claims caused by your
        unlawful use of the website, fraudulent activity, infringement of
        another party’s rights, or material violation of these Terms.
      </p>
    ),
  },
  {
    title: "Delays Outside Our Control",
    content: (
      <>
        <p>
          We are not responsible for delays caused by events reasonably
          outside our control, including severe weather, natural disasters,
          carrier interruptions, labor disruptions, government actions,
          emergencies, or failures of third-party infrastructure.
        </p>
        <p>
          If a material shipping delay occurs, we will provide notice and
          available options as required by law.
        </p>
      </>
    ),
  },
  {
    title: "Governing Law and Venue",
    content: (
      <>
        <p>
          These Terms are governed by the laws of the State of Texas,
          without regard to conflict-of-law principles.
        </p>
        <p>
          Subject to any consumer rights that cannot be waived, disputes
          relating to these Terms or the website will be brought in an
          appropriate state or federal court located in Harris County,
          Texas.
        </p>
        <p>
          Before filing a claim, the parties are encouraged to attempt
          resolution by contacting one another in writing.
        </p>
      </>
    ),
  },
  {
    title: "Severability",
    content: (
      <p>
        If any provision is determined to be unlawful or unenforceable,
        the remaining provisions will continue in effect.
      </p>
    ),
  },
  {
    title: "No Waiver",
    content: (
      <p>
        Failure to enforce a provision of these Terms does not waive the
        right to enforce it later.
      </p>
    ),
  },
  {
    title: "Assignment",
    content: (
      <p>
        Customers may not transfer their rights or obligations under these
        Terms without our written consent. {brand} may transfer these Terms
        in connection with a merger, acquisition, financing,
        reorganization, or sale of business assets.
      </p>
    ),
  },
  {
    title: "Entire Agreement",
    content: (
      <p>
        These Terms and the policies linked from the website constitute
        the entire agreement concerning website use and product purchases,
        except for any additional terms expressly accepted during
        checkout.
      </p>
    ),
  },
  {
    title: "Changes to These Terms",
    content: (
      <>
        <p>
          We may update these Terms when our business, website, payment
          arrangements, or legal obligations change. Updated Terms will be
          posted with a revised “Last Updated” date.
        </p>
        <p>
          Changes will not retroactively reduce rights relating to an order
          already accepted unless permitted by law.
        </p>
      </>
    ),
  },
  {
    title: "Contact",
    content: (
      <>
        <BusinessDetails showHours />
        <p>
          <Link to="/contact">Visit our contact page for assistance.</Link>
        </p>
      </>
    ),
  },
];

// Side navigation entries (ids are section-1, section-2, …)
const NAV_SECTIONS = sections.map((section, index) => ({
  id: `section-${index + 1}`,
  title: section.title,
}));

const TermsAndConditions = () => {
  return (
    <PolicyPage
      name="Terms & Conditions"
      index={String(sections.length)}
      eyebrow={`${brand} / Website & purchase terms`}
      title={
        <>
          Terms &amp; <em>Conditions.</em>
        </>
      }
      summary={`These Terms explain the conditions that apply when you use our website or purchase from ${brand}.`}
      updated={UPDATED}
      sections={NAV_SECTIONS}
      introLabel={`Your agreement · ${sections.length} sections`}
      intro={
        <>
          These Terms and Conditions (“Terms”) govern your access to and use
          of{" "}
          {BUSINESS_INFO.website ? (
            <a href={BUSINESS_INFO.website}>{BUSINESS_INFO.website}</a>
          ) : (
            "our website"
          )}{" "}
          and any purchase from {brand}. By using our website or placing an
          order, you agree to these Terms.
        </>
      }
      help={{
        eyebrow: "Please read before ordering",
        title: "A question about these Terms?",
        text: "Visit our contact page for assistance.",
      }}
    >
      {sections.map((section, index) => (
        <PolicySection
          key={section.title}
          id={`section-${index + 1}`}
          number={index + 1}
          title={section.title}
        >
          {section.content}
        </PolicySection>
      ))}
    </PolicyPage>
  );
};

export default TermsAndConditions;