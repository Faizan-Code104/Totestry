import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Clock3, RotateCcw } from "lucide-react";

import { BUSINESS_INFO, getEmailLink } from "../storeInfo";
import {
  PolicyContact,
  PolicyGlance,
  PolicyPage,
  PolicySection,
} from "./PolicyKit";

const UPDATED = { iso: "2026-10-04", label: "October 4, 2026" };

const REQUEST_ITEMS = [
  "Customer name",
  "Order number",
  "Email address used for the order",
  "Reason for cancellation",
];

const OrderCancellationPolicy = () => {
  const brandName = BUSINESS_INFO.businessName;

  const SECTIONS = [
    { id: "requests", title: "Cancellation requests" },
    { id: "fulfillment", title: "Fulfillment and shipment" },
    { id: "refunds", title: "Cancellation refunds" },
    { id: "by-us", title: `Cancellations by ${brandName}` },
    { id: "address", title: "Shipping address changes" },
    { id: "contact", title: "Contact" },
  ];

  return (
    <PolicyPage
      name="Order Cancellation Policy"
      index="06"
      eyebrow={`${brandName} / Customer care / Order cancellation policy`}
      title={
        <>
          A change <em>of plans.</em>
        </>
      }
      summary="Customers may request an order cancellation before the order has shipped. Cancellation requests should be submitted as soon as possible."
      updated={UPDATED}
      sections={SECTIONS}
      help={{
        eyebrow: "Need to cancel an order?",
        title: "Let us know.",
        text: "Contact us as soon as possible before your order ships.",
      }}
    >
      <PolicyGlance
        title="Before it ships."
        facts={[
          { label: "Cancellation window", value: "Before shipment" },
          { label: "Refund method", value: "Original payment method" },
          { label: "Refund submission", value: "5–7 business days" },
        ]}
        reminders={[
          {
            Icon: Clock3,
            title: "Request early",
            text: "Contact us as soon as possible before the order enters shipment or tracking is issued.",
          },
          {
            Icon: ArrowUpRight,
            title: "Before shipment",
            text: "Cancellation and address-change requests are available only before shipment and cannot be guaranteed after fulfillment begins.",
          },
          {
            Icon: RotateCcw,
            title: "Refund",
            text: "Approved cancellations are refunded to the original payment method.",
          },
        ]}
      />

      <PolicySection id="requests" number={1} title="Cancellation requests">
        <p>
          Customers may request an order cancellation before the order has
          shipped.
        </p>
        <p>
          To request cancellation, contact{" "}
          {BUSINESS_INFO.email ? (
            <a href={getEmailLink()}>{BUSINESS_INFO.email}</a>
          ) : (
            <Link to="/contact">our customer support team</Link>
          )}{" "}
          as soon as possible and include:
        </p>

        <ul className="tt-policy-list">
          {REQUEST_ITEMS.map((item) => (
            <li key={item}>{item}.</li>
          ))}
        </ul>
      </PolicySection>

      <PolicySection
        id="fulfillment"
        number={2}
        title="Fulfillment and shipment"
      >
        <p>
          We cannot guarantee cancellation after an order has entered
          fulfillment.
        </p>
        <p>
          Once tracking has been issued or the order has shipped, the
          customer must follow our{" "}
          <Link to="/return-policy">Return and Refund Policy</Link>.
        </p>
      </PolicySection>

      <PolicySection id="refunds" number={3} title="Cancellation refunds">
        <p>
          Approved cancellations are refunded to the original payment method.
        </p>
        <p>
          The refund is generally submitted within{" "}
          <strong>5–7 business days</strong>, although the customer’s bank
          may require additional posting time.
        </p>
      </PolicySection>

      <PolicySection
        id="by-us"
        number={4}
        title={`Cancellations by ${brandName}`}
      >
        <p>
          If {brandName} cancels an order because of unavailable inventory, a
          pricing error, delivery restrictions, payment problems, or
          suspected fraud, any collected payment for the canceled products
          will be returned to the original payment method.
        </p>
      </PolicySection>

      <PolicySection id="address" number={5} title="Shipping address changes">
        <p>
          Shipping-address changes are also available only before shipment
          and cannot be guaranteed after fulfillment begins.
        </p>
        <p>
          Customers should contact us immediately if an address correction is
          needed.
        </p>
      </PolicySection>

      <PolicySection id="contact" number={6} title="Contact">
        <PolicyContact showHours contactLink />
      </PolicySection>
    </PolicyPage>
  );
};

export default OrderCancellationPolicy;