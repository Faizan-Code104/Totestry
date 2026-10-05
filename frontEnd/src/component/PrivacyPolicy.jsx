import React from "react";
import { Link } from "react-router-dom";

import { BUSINESS_INFO } from "../storeInfo";
import { PolicyContact, PolicyPage, PolicySection } from "./PolicyKit";

const UPDATED = { iso: "2026-10-04", label: "October 4, 2026" };

const PrivacyContact = ({ request = false }) =>
  BUSINESS_INFO.email ? (
    <a
      href={`mailto:${BUSINESS_INFO.email}${
        request ? "?subject=Privacy%20Request" : ""
      }`}
    >
      {BUSINESS_INFO.email}
    </a>
  ) : (
    <Link to="/contact">our customer support team</Link>
  );

const PrivacyPolicy = () => {
  const brand = BUSINESS_INFO.businessName;

  const sections = [
    {
      id: "business",
      title: "Business Information",
      body: [`Business information for ${brand}:`],
      contact: true,
    },
    {
      id: "collection",
      title: "Information We Collect",
      body: [
        "Depending on how you interact with our website, we may collect:",
      ],
      bullets: [
        "Name, billing address, shipping address, email address, and telephone number.",
        "Account login information, if you create an account.",
        "Products purchased, order value, transaction status, returns, refunds, and customer-service history.",
        "Information you provide through email, telephone, contact forms, reviews, or return requests.",
        "Internet Protocol address, device type, browser type, operating system, referring pages, pages viewed, and approximate location.",
        "Cookie, session, shopping-cart, and local-storage information.",
        "Fraud-prevention and transaction-verification information.",
      ],
    },
    {
      id: "payments",
      title: "Payment Information",
      body: [
        `${brand} is currently completing its online payment setup and does not accept Cash on Delivery.`,
        `When online payment processing is activated, payments will be handled by an authorized third-party payment processor. ${brand} will not intentionally store complete payment-card numbers or card security codes on its own systems.`,
        "Payment processors may collect and process payment information under their own privacy and security policies.",
      ],
    },
    {
      id: "usage",
      title: "How We Use Information",
      body: ["We may use personal information to:"],
      bullets: [
        "Operate and maintain our website.",
        "Create and manage customer accounts.",
        "Process, confirm, fulfill, and track orders.",
        "Communicate order, shipping, delivery, return, and refund information.",
        "Provide customer service.",
        "Verify transactions and prevent fraud or unauthorized activity.",
        "Improve our products, website, and customer experience.",
        "Maintain business, accounting, tax, and compliance records.",
        "Send marketing communications when the customer has chosen to receive them.",
        "Comply with legal obligations and enforce our policies.",
      ],
      after: [
        "We will not use personal information for materially different purposes without providing appropriate notice or obtaining consent when required.",
      ],
    },
    {
      id: "disclosure",
      title: "How We Disclose Information",
      body: [
        "We may disclose personal information to service providers that assist us with:",
      ],
      bullets: [
        "Website hosting and technical infrastructure.",
        "Order and inventory management.",
        "Payment processing.",
        "Shipping, tracking, and delivery.",
        "Email and customer communications.",
        "Website security and fraud prevention.",
        "Analytics and website performance.",
        "Accounting, legal, tax, and regulatory compliance.",
      ],
      after: [
        "These providers may access information only as reasonably necessary to perform services for us and are expected to protect it appropriately.",
        "We may also disclose information:",
      ],
      afterBullets: [
        "When required by law, subpoena, court order, or lawful government request.",
        "To investigate suspected fraud, security incidents, or violations of our policies.",
        `To protect the rights, safety, and property of ${brand}, our customers, or others.`,
        "In connection with a merger, financing, acquisition, reorganization, or sale of business assets.",
      ],
    },
    {
      id: "sharing",
      title: "Sale and Sharing of Personal Information",
      body: [
        "We do not sell personal information for money.",
        <>
          Certain analytics or advertising technologies, if enabled, may
          be treated as “sharing” or targeted advertising under some
          state privacy laws. Where legally required, eligible consumers
          may request to opt out by contacting <PrivacyContact />.
        </>,
      ],
    },
    {
      id: "cookies",
      title: "Cookies and Local Storage",
      body: [
        "Our website may use cookies, browser storage, session technologies, and similar tools to:",
      ],
      bullets: [
        "Keep the website operational.",
        "Maintain shopping-cart contents.",
        "Remember customer preferences.",
        "Support account login and security.",
        "Understand website traffic and performance.",
        "Detect fraud or suspicious activity.",
      ],
      after: [
        <>
          Additional information is available in our{" "}
          <Link to="/cookie-policy">Cookie Policy</Link>.
        </>,
      ],
    },
    {
      id: "marketing",
      title: "Marketing Communications",
      body: [
        <>
          Customers may unsubscribe from promotional emails by using
          the unsubscribe link included in the message or by contacting{" "}
          <PrivacyContact />.
        </>,
        "Transactional communications concerning an order, delivery, return, security issue, or account are not promotional and may still be sent when necessary.",
        "We do not send promotional text messages without the recipient’s appropriate consent. Consent to marketing is not a condition of purchase.",
      ],
    },
    {
      id: "retention",
      title: "Data Retention",
      body: [
        "We retain personal information only for as long as reasonably necessary to:",
      ],
      bullets: [
        "Fulfill orders and provide customer support.",
        "Process returns and refunds.",
        "Maintain accounting, tax, and business records.",
        "Prevent fraud and resolve disputes.",
        "Comply with legal and regulatory obligations.",
      ],
      after: [
        "Retention periods may differ according to the type of information and the reason it was collected.",
      ],
    },
    {
      id: "security",
      title: "Data Security",
      body: [
        "We use reasonable administrative, organizational, and technical safeguards designed to protect personal information. However, no website, transmission, or storage system can be guaranteed to be completely secure.",
        "Customers are responsible for maintaining the confidentiality of their account credentials and should contact us immediately if they suspect unauthorized account access.",
        "Please do not send complete payment-card details through email, telephone messages, or our contact form.",
      ],
    },
    {
      id: "rights",
      title: "Your Privacy Choices and Rights",
      body: [
        "Depending on your state of residence and applicable law, you may have the right to:",
      ],
      bullets: [
        "Request access to personal information we maintain about you.",
        "Request correction of inaccurate information.",
        "Request deletion of eligible personal information.",
        "Request a portable copy of eligible information.",
        "Opt out of certain targeted advertising, sales, or sharing.",
        "Withdraw consent where processing is based on consent.",
        "Appeal our response to an eligible privacy request.",
        "Not receive unlawful discriminatory treatment for exercising privacy rights.",
      ],
      after: [
        <>
          To submit a request,{" "}
          {BUSINESS_INFO.email ? "email " : "contact "}
          <PrivacyContact request /> with the subject “Privacy Request.”
        </>,
        "We may need to verify your identity before completing a request. An authorized agent may submit a request when permitted by law and after providing appropriate authorization.",
      ],
    },
    {
      id: "children",
      title: "Children’s Privacy",
      body: [
        "Our website and products are intended for adults. We do not knowingly collect personal information directly from children under 13. If you believe a child has provided personal information, contact us so we can review and delete it when required.",
        "Individuals under 18 should use the website only with the involvement and permission of a parent or legal guardian.",
      ],
    },
    {
      id: "third-parties",
      title: "Third-Party Websites",
      body: [
        "Our website may contain links to third-party websites or services. We are not responsible for the privacy, security, content, or practices of third parties. Customers should review the applicable third party’s policies before providing information.",
      ],
    },
    {
      id: "operations",
      title: "United States Operations",
      body: [
        `${brand} operates in the United States. Information may be processed and stored in the United States, where privacy laws may differ from those in other jurisdictions.`,
      ],
    },
    {
      id: "changes",
      title: "Changes to This Policy",
      body: [
        "We may update this Privacy Policy to reflect operational, legal, or technical changes. The revised version will be posted on this page with an updated “Last Updated” date.",
      ],
    },
    {
      id: "contact",
      title: "Contact Us",
      body: ["Questions or privacy requests may be directed to:"],
      contact: true,
    },
  ];

  return (
    <PolicyPage
      name="Privacy Policy"
      index="16"
      eyebrow={`${brand} / Privacy Policy / Your information`}
      title={
        <>
          Privacy, <em>with care.</em>
        </>
      }
      updated={UPDATED}
      sections={sections}
      introLabel="Privacy Policy · 16 sections"
      intro={
        <>
          {brand} (“{brand},” “we,” “us,” or “our”) respects your privacy.
          This Privacy Policy explains how we collect, use, disclose, retain,
          and protect personal information when you visit{" "}
          {BUSINESS_INFO.website ? (
            <a href={BUSINESS_INFO.website}>{BUSINESS_INFO.website}</a>
          ) : (
            "our website"
          )}
          , create an account, communicate with us, or purchase our products.
        </>
      }
      help={{
        eyebrow: "Privacy requests",
        title: "Let’s talk.",
        text: `If you have a question about this Privacy Policy or want to make a privacy-related request, you can contact ${brand} using the details in this policy.`,
      }}
    >
      {sections.map((section, index) => (
        <PolicySection
          key={section.id}
          id={section.id}
          number={index + 1}
          title={section.title}
        >
          {section.body?.map((paragraph, paragraphIndex) => (
            <p key={`body-${paragraphIndex}`}>{paragraph}</p>
          ))}

          {section.bullets && (
            <ul>
              {section.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}

          {section.after?.map((paragraph, paragraphIndex) => (
            <p key={`after-${paragraphIndex}`}>{paragraph}</p>
          ))}

          {section.afterBullets && (
            <ul>
              {section.afterBullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}

          {section.contact && (
            <PolicyContact
              showHours
              hoursLabel="Customer Support Hours"
              contactLink
            />
          )}
        </PolicySection>
      ))}
    </PolicyPage>
  );
};

export default PrivacyPolicy;