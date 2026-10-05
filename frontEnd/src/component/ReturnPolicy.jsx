import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Mail, Phone, X } from "lucide-react";

import {
  BUSINESS_INFO,
  getAddressLines,
  getEmailLink,
  getPhoneLink,
} from "../storeInfo";
import Reveal from "./Reveal";
import { PolicyContact, PolicyPage, PolicySection } from "./PolicyKit";

const UPDATED = { iso: "2026-10-04", label: "October 4, 2026" };

const SECTIONS = [
  { id: "eligibility", title: "Return eligibility" },
  { id: "starting", title: "Starting a return" },
  { id: "address", title: "Return address" },
  { id: "change-of-mind", title: "Change-of-mind returns" },
  { id: "damaged", title: "Damaged, defective, or incorrect products" },
  { id: "exchanges", title: "Exchanges" },
  { id: "fees", title: "Restocking fees" },
  { id: "non-returnable", title: "Non-returnable products" },
  { id: "inspection", title: "Return inspection" },
  { id: "refunds", title: "Refund timing" },
  { id: "missing-refunds", title: "Late or missing refunds" },
  { id: "undeliverable", title: "Refused and undeliverable orders" },
  { id: "questions", title: "Charge and order questions" },
  { id: "contact", title: "Contact" },
];

const RETURN_STEPS = [
  {
    title: "Request a return",
    description:
      "Contact our support team within 30 days of confirmed delivery and provide your order number and return reason.",
  },
  {
    title: "Receive authorization",
    description:
      "If approved, we will provide return instructions. Do not mail a product before authorization is provided.",
  },
  {
    title: "Ship the return",
    description:
      "Send the authorized product as instructed and retain your tracking number and shipping receipt.",
  },
  {
    title: "Refund processed",
    description:
      "After inspection and approval, the refund is issued to the original payment method within 5–7 business days.",
  },
];

// Email, phone and contact-page link — read from storeInfo.js
const SupportContact = () => {
  const emailLink = getEmailLink();
  const phoneLink = getPhoneLink();

  return (
    <div className="tt-policy-links">
      {BUSINESS_INFO.email && (
        <a href={emailLink}>
          <Mail size={17} aria-hidden="true" />
          <span>{BUSINESS_INFO.email}</span>
        </a>
      )}

      {BUSINESS_INFO.phoneDisplay && phoneLink && (
        <a href={phoneLink}>
          <Phone size={17} aria-hidden="true" />
          <span>{BUSINESS_INFO.phoneDisplay}</span>
        </a>
      )}

      <Link to="/contact">
        Contact our team
        <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
};

// Business name and address — read from storeInfo.js
const BusinessAddress = () => (
  <address className="tt-policy-address">
    <strong>{BUSINESS_INFO.businessName}</strong>
    {getAddressLines().map((line, index) => (
      <span key={`${index}-${line}`}>{line}</span>
    ))}
  </address>
);

const ReturnPolicy = () => {
  const brand = BUSINESS_INFO.businessName;

  const hasAddress = Boolean(
    BUSINESS_INFO.addressLine1 ||
      BUSINESS_INFO.addressLine2 ||
      BUSINESS_INFO.country,
  );

  const eligible = [
    "Unused and unworn",
    "Unwashed and unaltered",
    "Free from stains, odors, scratches, or customer-caused damage",
    "Original tags, accessories, and packaging are included",
    "Order number or proof of purchase is provided",
    "Return is requested within 30 days of confirmed delivery",
  ];

  const notEligible = [
    "Used, worn, washed, altered, or customer-damaged products",
    "Products missing tags, accessories, components, or original packaging",
    "Products showing misuse, improper cleaning, or ordinary wear",
    "Products returned more than 30 days after delivery",
    "Products mailed without authorization",
    `Products not purchased directly from ${brand}`,
  ];

  return (
    <PolicyPage
      name="Return & Refund Policy"
      index="30"
      eyebrow={`${brand} / Return & Refund Policy / Returns & refunds`}
      title={
        <>
          A little <em>reconsideration.</em>
        </>
      }
      summary={`${brand} accepts eligible returns requested within 30 days of confirmed delivery. Products must meet the return conditions described below.`}
      updated={UPDATED}
      sections={SECTIONS}
      help={{
        eyebrow: "Our team can help",
        title: "Need to start a return?",
        text: "Contact our support team before mailing your return.",
      }}
    >
      {/* RETURN WINDOW */}
      <Reveal className="tt-return-window">
        <div>
          <p className="tt-eyebrow">Return window</p>
          <p className="tt-return-days">
            <strong>30</strong> days
          </p>
        </div>

        <div>
          <p>From confirmed delivery, subject to eligibility.</p>
          <a href="#policy-starting">
            Start with authorization
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </Reveal>

      {/* CONDITIONS */}
      <Reveal
        as="section"
        className="tt-return-block"
        aria-labelledby="tt-return-conditions"
      >
        <p className="tt-eyebrow tt-eyebrow--accent">Before you begin</p>
        <h2 id="tt-return-conditions">Check the conditions.</h2>

        <div className="tt-return-conditions">
          <div className="tt-card">
            <h3>Eligible for return</h3>
            <ul>
              {eligible.map((item) => (
                <li key={item}>
                  <Check size={16} strokeWidth={2.2} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="tt-card is-negative">
            <h3>May not be eligible</h3>
            <ul>
              {notEligible.map((item) => (
                <li key={item}>
                  <X size={16} strokeWidth={2.2} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>

      {/* PROCESS */}
      <Reveal
        as="section"
        className="tt-return-block"
        aria-labelledby="tt-return-process"
      >
        <p className="tt-eyebrow tt-eyebrow--accent">How to return an item</p>
        <h2 id="tt-return-process">The return journey.</h2>

        <ol className="tt-return-steps">
          {RETURN_STEPS.map((step, index) => (
            <li key={step.title}>
              <span aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      <p className="tt-eyebrow tt-eyebrow--accent tt-return-full">
        The full policy
      </p>

      <PolicySection id="eligibility" number={1} title="Return eligibility">
        <p>
          To qualify for a return, the product must be unused and
          unworn, unwashed and unaltered, free from stains, odors,
          scratches, or customer-caused damage, and returned with its
          original tags, accessories, and packaging.
        </p>
        <p>
          The return must also be accompanied by the order number or
          proof of purchase.
        </p>
        <p>
          Products returned without authorization or outside the
          return period may be refused.
        </p>
      </PolicySection>

      <PolicySection id="starting" number={2} title="Starting a return">
        <p>
          Before mailing a return, contact our support team using the
          following details:
        </p>

        <SupportContact />

        <p>Please provide:</p>
        <ul>
          <li>Customer name.</li>
          <li>Order number.</li>
          <li>Product being returned.</li>
          <li>Reason for return.</li>
          <li>
            Photographs if the item is damaged, defective, or incorrect.
          </li>
        </ul>
        <p>
          If approved, we will provide return instructions. Do not
          mail a product until return authorization has been provided.
        </p>
      </PolicySection>

      <PolicySection id="address" number={3} title="Return address">
        <p>
          {hasAddress
            ? "Authorized returns should be sent as instructed to:"
            : "Authorized returns should be sent to the address provided in our return instructions."}
        </p>

        {hasAddress && <BusinessAddress />}

        <p>
          The customer should retain the return tracking number and
          shipping receipt until the refund is completed.
        </p>
      </PolicySection>

      <PolicySection
        id="change-of-mind"
        number={4}
        title="Change-of-mind returns"
      >
        <p>
          If a customer changes their mind, orders the wrong item,
          or no longer wants the product:
        </p>
        <ul>
          <li>The customer is responsible for return-shipping costs.</li>
          <li>The return shipment should include tracking.</li>
          <li>
            {brand} is not responsible for a return lost before it
            reaches us.
          </li>
          <li>
            The product must satisfy all return-eligibility requirements.
          </li>
        </ul>
      </PolicySection>

      <PolicySection
        id="damaged"
        number={5}
        title="Damaged, defective, or incorrect products"
      >
        <p>
          A damaged, defective, or incorrect product should be
          reported within <strong>48 hours of delivery</strong>.
        </p>
        <p>The customer should provide photographs of:</p>
        <ul>
          <li>The product.</li>
          <li>The packaging.</li>
          <li>The shipping label.</li>
          <li>The damaged or incorrect area.</li>
        </ul>
        <p>
          After verification, {brand} will provide appropriate return
          instructions and cover reasonable return-shipping costs.
        </p>
      </PolicySection>

      <PolicySection id="exchanges" number={6} title="Exchanges">
        <p>We do <strong>not offer direct exchanges</strong>.</p>
        <p>
          A customer who wants another color, style, or product may
          return the eligible original product for a refund and
          place a separate order.
        </p>
      </PolicySection>

      <PolicySection id="fees" number={7} title="Restocking fees">
        <p>
          {brand} does <strong>not charge a restocking fee</strong>{" "}
          for an eligible return.
        </p>
      </PolicySection>

      <PolicySection
        id="non-returnable"
        number={8}
        title="Non-returnable products"
      >
        <p>A return may be refused if the product:</p>
        <ul>
          <li>Was used, worn, washed, altered, or damaged after delivery.</li>
          <li>
            Is missing tags, accessories, components, or original packaging.
          </li>
          <li>Shows signs of misuse, improper cleaning, or ordinary wear.</li>
          <li>Is returned more than 30 days after delivery.</li>
          <li>Was mailed without authorization.</li>
          <li>Was not purchased directly from {brand}.</li>
        </ul>
        <p>
          These exclusions do not limit legal rights concerning
          defective or misrepresented products.
        </p>
      </PolicySection>

      <PolicySection id="inspection" number={9} title="Return inspection">
        <p>
          Returned products are inspected after receipt. We will
          notify the customer whether the return has been approved
          or rejected.
        </p>
        <p>
          If a return does not meet the stated conditions, we will
          explain the reason and may ask the customer to pay for
          shipment of the product back to them.
        </p>
      </PolicySection>

      <PolicySection id="refunds" number={10} title="Refund timing">
        <p>
          Approved refunds are issued to the{" "}
          <strong>
            original payment method within 5–7 business days after inspection
          </strong>.
        </p>
        <p>
          The customer’s bank or card issuer may require additional
          time to post the credit. {brand} does not control
          financial-institution posting times.
        </p>
        <p>
          Shipping charges paid for expedited or optional delivery
          services, if any, are not refundable unless the return
          resulted from our error or applicable law requires otherwise.
        </p>
      </PolicySection>

      <PolicySection
        id="missing-refunds"
        number={11}
        title="Late or missing refunds"
      >
        <p>If an approved refund does not appear:</p>
        <ol>
          <li>Review the original payment account.</li>
          <li>Contact the bank or card issuer.</li>
          <li>Allow for the institution’s processing period.</li>
          <li>
            Contact{" "}
            {BUSINESS_INFO.email ? (
              <a href={getEmailLink()}>
                {BUSINESS_INFO.email}
              </a>
            ) : (
              <Link to="/contact">our support team</Link>
            )}{" "}
            if the refund still cannot be located.
          </li>
        </ol>
      </PolicySection>

      <PolicySection
        id="undeliverable"
        number={12}
        title="Refused and undeliverable orders"
      >
        <p>
          Packages returned because of refusal, an inaccurate
          address, or repeated failed delivery may be processed
          under this policy.
        </p>
        <p>
          Actual carrier costs caused by refusal or inaccurate
          customer information may be deducted from the refund
          where legally permitted.
        </p>
      </PolicySection>

      <PolicySection
        id="questions"
        number={13}
        title="Charge and order questions"
      >
        <p>
          Contact us before initiating a payment dispute so we can
          investigate the order promptly. This request does not
          restrict any rights a customer may have through their
          card issuer or applicable law.
        </p>
      </PolicySection>

      <PolicySection id="contact" number={14} title="Contact">
        <PolicyContact showHours hoursLabel="Support Hours" contactLink />
      </PolicySection>
    </PolicyPage>
  );
};

export default ReturnPolicy;