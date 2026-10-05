import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Clock3, MapPin, Package, Truck } from "lucide-react";

import { BUSINESS_INFO, getEmailLink } from "../storeInfo";
import Reveal from "./Reveal";
import {
  PolicyContact,
  PolicyGlance,
  PolicyPage,
  PolicySection,
} from "./PolicyKit";

const UPDATED = { iso: "2026-10-04", label: "October 4, 2026" };

const SECTIONS = [
  { id: "area", title: "Shipping area" },
  { id: "cost", title: "Shipping cost" },
  { id: "processing", title: "Order processing" },
  { id: "delivery", title: "Estimated delivery" },
  { id: "method", title: "Shipping method" },
  { id: "accuracy", title: "Address accuracy" },
  { id: "tracking", title: "Tracking" },
  { id: "lost", title: "Lost packages" },
  { id: "damaged", title: "Damaged packages" },
  { id: "undeliverable", title: "Refused or undeliverable packages" },
  { id: "split", title: "Split shipments" },
  { id: "contact", title: "Contact" },
];

const JOURNEY = [
  {
    icon: Package,
    title: "Order accepted",
    description:
      "After payment authorization and order acceptance, your order enters processing.",
  },
  {
    icon: Clock3,
    title: "Order processing",
    description:
      "Orders are normally processed within 1–2 business days, excluding weekends and federal holidays.",
  },
  {
    icon: Truck,
    title: "In transit",
    description:
      "After processing, standard delivery normally takes 3–7 business days through a recognized third-party carrier.",
  },
  {
    icon: MapPin,
    title: "Delivery",
    description:
      "Your order is delivered to the complete and accurate shipping address provided during checkout.",
  },
];

const SupportLink = () =>
  BUSINESS_INFO.email ? (
    <a href={getEmailLink()}>{BUSINESS_INFO.email}</a>
  ) : (
    <Link to="/contact">our support team</Link>
  );

const ShippingPolicy = () => {
  const brand = BUSINESS_INFO.businessName;

  return (
    <PolicyPage
      name="Shipping Policy"
      index="48"
      eyebrow={`${brand} / Shipping Policy / Shipping information`}
      title={
        <>
          On its way, <em>with care.</em>
        </>
      }
      updated={UPDATED}
      sections={SECTIONS}
      introLabel="The delivery details"
      intro={
        <>
          This Shipping Policy applies to physical products purchased from{" "}
          {brand} through{" "}
          {BUSINESS_INFO.website ? (
            <a href={BUSINESS_INFO.website}>{BUSINESS_INFO.website}</a>
          ) : (
            "our website"
          )}
          .
        </>
      }
      help={{
        eyebrow: "Already submitted an order?",
        title: "Follow its journey.",
        text: "Check the latest available status using your order number.",
        to: "/track-order",
        label: "Track order",
      }}
    >
      {/* OVERVIEW */}
      <PolicyGlance
        eyebrow="Shipping overview"
        facts={[
          { label: "Shipping area", value: "Contiguous 48 U.S. states" },
          { label: "Order processing", value: "1–2 business days" },
          { label: "Shipping cost", value: "Free standard shipping" },
        ]}
        note={
          <>
            Estimated total time from order acceptance to delivery is
            generally <strong>4–9 business days</strong>. Delivery estimates
            are not guaranteed.
          </>
        }
      />

      {/* ORDER JOURNEY */}
      <Reveal
        as="section"
        className="tt-return-block"
        aria-labelledby="tt-shipping-journey"
      >
        <p className="tt-eyebrow tt-eyebrow--accent">Order journey</p>
        <h2 id="tt-shipping-journey">From checkout to your door.</h2>

        <ol className="tt-return-steps">
          {JOURNEY.map((step, index) => {
            const Icon = step.icon;

            return (
              <li key={step.title}>
                <span className="tt-step-head">
                  {String(index + 1).padStart(2, "0")}
                  <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            );
          })}
        </ol>

        <Link to="/track-order" className="tt-text-arrow tt-shipping-track">
          Track your order
          <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
        </Link>
      </Reveal>

      <PolicySection id="area" number={1} title="Shipping area">
        <p>
          We currently ship to deliverable addresses within the
          contiguous 48 United States.
        </p>
        <p>
          We do not currently ship internationally or to Alaska,
          Hawaii, U.S. territories, APO/FPO/DPO addresses, or P.O.
          boxes.
        </p>
      </PolicySection>

      <PolicySection id="cost" number={2} title="Shipping cost">
        <p>
          {brand} provides <strong>free standard shipping</strong>{" "}
          on eligible orders within our published U.S. shipping area.
        </p>
        <p>
          Customers will not be charged a standard shipping fee
          unless a different charge is clearly disclosed before
          completing the order.
        </p>
      </PolicySection>

      <PolicySection
        id="processing"
        number={3}
        title="Order processing"
      >
        <p>
          Orders are normally processed within{" "}
          <strong>1–2 business days</strong> after payment
          authorization and order acceptance.
        </p>
        <p>
          Business days are Monday through Friday and exclude
          federal holidays. Orders submitted during weekends or
          holidays begin processing on the following business day.
        </p>
        <p>
          An order confirmation does not mean the order has
          shipped. Customers will receive a separate shipping
          confirmation when tracking becomes available.
        </p>
      </PolicySection>

      <PolicySection
        id="delivery"
        number={4}
        title="Estimated delivery"
      >
        <p>
          After processing, standard delivery normally takes{" "}
          <strong>3–7 business days</strong>.
        </p>
        <p>
          The estimated total period from order acceptance to
          delivery is generally <strong>4–9 business days</strong>.
        </p>
        <p>
          Delivery estimates are not guarantees. Severe weather,
          carrier disruptions, incorrect addresses, holidays,
          emergencies, or other circumstances outside our control
          may cause delays.
        </p>
        <p>
          If we cannot ship within the promised period, we will
          notify the customer and provide available options,
          including cancellation and refund when required.
        </p>
      </PolicySection>

      <PolicySection
        id="method"
        number={5}
        title="Shipping method"
      >
        <p>
          Orders are shipped using standard ground or parcel
          delivery through a recognized third-party carrier. The
          carrier used may depend on the destination, package
          size, and operational availability.
        </p>
        <p>
          Available tracking information will be included in the
          shipping confirmation.
        </p>
      </PolicySection>

      <PolicySection
        id="accuracy"
        number={6}
        title="Address accuracy"
      >
        <p>
          Customers are responsible for providing a complete and
          accurate delivery address.
        </p>
        <p>
          Contact <SupportLink /> immediately if an address needs
          to be corrected. We cannot guarantee changes after an
          order enters fulfillment or has shipped.
        </p>
        <p>
          {brand} is not responsible for delays or failed delivery
          caused by incorrect or incomplete information supplied
          by the customer.
        </p>
      </PolicySection>

      <PolicySection id="tracking" number={7} title="Tracking">
        <p>
          Tracking information may take up to 48 hours to update
          after a label is created.
        </p>
        <p>
          A carrier’s “delivered” scan does not always mean the
          package was handed directly to the recipient. Customers
          should check the delivery area, household members,
          property staff, and carrier notices before reporting a
          missing delivery.
        </p>
        <p>
          You can also use your {brand} order number on our{" "}
          <Link to="/track-order">Order Tracking page</Link>.
        </p>
      </PolicySection>

      <PolicySection
        id="lost"
        number={8}
        title="Lost packages"
      >
        <p>
          If tracking does not update for an unusual period or a
          package appears lost, contact{" "}
          {BUSINESS_INFO.email ? (
            <>us at <SupportLink /></>
          ) : (
            <SupportLink />
          )}{" "}
          with the order number.
        </p>
        <p>
          We will review the shipment with the carrier and provide
          an appropriate resolution based on the investigation
          and applicable law.
        </p>
      </PolicySection>

      <PolicySection
        id="damaged"
        number={9}
        title="Damaged packages"
      >
        <p>
          If a package arrives visibly damaged, photograph the
          package and product and contact us within{" "}
          <strong>48 hours of delivery</strong>.
        </p>
        <p>
          Please retain the item, packaging, labels, and shipping
          materials until we complete our review.
        </p>
      </PolicySection>

      <PolicySection
        id="undeliverable"
        number={10}
        title="Refused or undeliverable packages"
      >
        <p>
          A shipment returned because of refusal, an incorrect
          address, repeated failed delivery, or failure to collect
          the package may be treated as a return.
        </p>
        <p>
          Any additional reshipping charge will be disclosed and
          approved before reshipment. If a refund is requested,
          unavoidable carrier charges incurred because of an
          incorrect address or refused delivery may be deducted
          where legally permitted.
        </p>
      </PolicySection>

      <PolicySection
        id="split"
        number={11}
        title="Split shipments"
      >
        <p>
          If an order contains multiple products, products may
          arrive in separate packages. Additional standard
          shipping will not be charged unless disclosed before
          purchase.
        </p>
      </PolicySection>

      <PolicySection id="contact" number={12} title="Contact">
        <PolicyContact showHours hoursLabel="Support Hours" contactLink />
      </PolicySection>
    </PolicyPage>
  );
};

export default ShippingPolicy;