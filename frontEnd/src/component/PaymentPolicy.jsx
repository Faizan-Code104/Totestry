import React from "react";
import { Link } from "react-router-dom";

import { BUSINESS_INFO } from "../storeInfo";
import {
  PolicyContact,
  PolicyGlance,
  PolicyNote,
  PolicyPage,
  PolicySection,
} from "./PolicyKit";

const UPDATED = { iso: "2026-10-04", label: "October 4, 2026" };

const SECTIONS = [
  { id: "methods", title: "Payment methods" },
  { id: "status", title: "Current status" },
  { id: "currency", title: "Currency" },
  { id: "processing", title: "Processing" },
  { id: "authorization", title: "Authorization" },
  { id: "purchases", title: "Purchases" },
  { id: "descriptor", title: "Billing descriptor" },
  { id: "declined", title: "Declined payments" },
  { id: "refunds", title: "Refunds" },
  { id: "contact", title: "Contact" },
];

const PaymentPolicy = () => {
  const brandName = BUSINESS_INFO.businessName;

  return (
    <PolicyPage
      name="Payment Policy"
      index="10"
      eyebrow={`${brandName} / Website information / Payment information`}
      title={
        <>
          Payment <em>Policy.</em>
        </>
      }
      summary={`${brandName} accepts online electronic payments only through the payment methods displayed at checkout. Our online payment setup is currently being completed.`}
      updated={UPDATED}
      sections={SECTIONS}
      help={{
        eyebrow: "A little assistance",
        title: "Have a payment question?",
        text: "Contact our support team for assistance.",
      }}
    >
      <PolicyGlance
        eyebrow="Payment information"
        facts={[
          { label: "Payment type", value: "Online electronic payments" },
          { label: "Currency", value: "United States dollars (USD)" },
          { label: "Purchases", value: "One-time purchases" },
        ]}
      />

      <PolicySection
        id="methods"
        number={1}
        title="Online payments only"
      >
        <p>
          {brandName} accepts online electronic payments only through
          the payment methods displayed at checkout.
        </p>
        <p>We do not accept:</p>

        <ul className="tt-policy-list">
          <li>Cash on Delivery.</li>
          <li>Payment by cash through the mail.</li>
          <li>Personal checks.</li>
          <li>Telephone collection of complete payment-card details.</li>
        </ul>
      </PolicySection>

      <PolicySection
        id="status"
        number={2}
        title="Current payment status"
      >
        <p>
          {brandName} is currently completing its secure online
          payment setup.
        </p>
        <PolicyNote>
          <p>
            Until an active payment method is displayed at checkout
            and payment is successfully authorized, no completed
            online purchase will be accepted and no card payment
            will be collected through the website.
          </p>
        </PolicyNote>
      </PolicySection>

      <PolicySection id="currency" number={3} title="Currency">
        <p>
          All product prices and transactions are stated in{" "}
          <strong>United States dollars (USD)</strong>.
        </p>
        <p>
          Applicable sales tax will be calculated and disclosed at
          checkout where required.
        </p>
      </PolicySection>

      <PolicySection
        id="processing"
        number={4}
        title="Payment processing"
      >
        <p>
          Once online payments are activated, transactions will be
          processed by an authorized third-party payment processor.
        </p>
        <p>
          {brandName} will not intentionally store complete card
          numbers or card security codes on its own systems.
          Customers should never send complete card information
          through email, contact forms, or voicemail.
        </p>
      </PolicySection>

      <PolicySection
        id="authorization"
        number={5}
        title="Authorization"
      >
        <p>
          Submitting payment authorizes the payment processor to
          verify and charge the selected payment method for the
          total amount displayed at checkout.
        </p>
        <p>
          An authorization does not guarantee acceptance. Orders
          remain subject to payment approval, inventory availability,
          fraud review, and order confirmation.
        </p>
      </PolicySection>

      <PolicySection
        id="purchases"
        number={6}
        title="One-time purchases"
      >
        <p>
          {brandName} sells products through one-time purchases. We
          do not automatically enroll product customers in recurring
          subscriptions.
        </p>
        <p>
          Any future recurring service would require separate, clear
          disclosure and express customer authorization before billing.
        </p>
      </PolicySection>

      <PolicySection
        id="descriptor"
        number={7}
        title="Billing descriptor"
      >
        <p>
          Once payment processing is activated, the exact
          processor-approved billing descriptor will be displayed
          at checkout or in the order confirmation.
        </p>
        <p>
          The descriptor will identify the charge as associated
          with {brandName}.
        </p>
      </PolicySection>

      <PolicySection
        id="declined"
        number={8}
        title="Declined payments"
      >
        <p>
          A payment may be declined by the card issuer, payment
          processor, or fraud-prevention system. Customers should
          verify their information or contact their financial
          institution.
        </p>
        <p>{brandName} does not control issuer decline decisions.</p>
      </PolicySection>

      <PolicySection id="refunds" number={9} title="Refunds">
        <p>
          Approved refunds are returned to the original payment
          method in accordance with our{" "}
          <Link to="/return-policy">Return and Refund Policy</Link>.
        </p>
      </PolicySection>

      <PolicySection id="contact" number={10} title="Contact">
        <PolicyContact showHours contactLink />
      </PolicySection>
    </PolicyPage>
  );
};

export default PaymentPolicy;