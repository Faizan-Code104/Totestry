import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Search, X } from "lucide-react";

import {
  BUSINESS_INFO,
  getEmailLink,
  getFullAddress,
  getPhoneLink,
} from "../storeInfo";
import Reveal from "./Reveal";

const brandName = BUSINESS_INFO.businessName;
const fullAddress = getFullAddress();

const supportHours = [
  BUSINESS_INFO.supportHours,
  BUSINESS_INFO.timeZone,
]
  .filter(Boolean)
  .join(" ");

const supportSchedule = [
  BUSINESS_INFO.businessDays,
  supportHours,
]
  .filter(Boolean)
  .join(", ");

const emailLink = getEmailLink();
const phoneLink = getPhoneLink();

const contactInstruction = BUSINESS_INFO.email
  ? `Contact us at ${BUSINESS_INFO.email}`
  : "Contact our customer support team";

const supportDetails = [
  BUSINESS_INFO.email && `Email: ${BUSINESS_INFO.email}.`,
  BUSINESS_INFO.phoneDisplay &&
    `Phone: ${BUSINESS_INFO.phoneDisplay}.`,
  supportSchedule && `Hours: ${supportSchedule}.`,
]
  .filter(Boolean)
  .join(" ");

const FAQS = [
  {
    category: "Business",
    question: `What is ${brandName}?`,
    answer:
      `${brandName} is our online store for handbags, bags, and related fashion accessories.`,
  },
  {
    category: "Product Information",
    question: "What products do you sell?",
    answer:
      "We sell handbags, tote bags, shoulder bags, crossbody bags, and related fashion accessories.",
  },
  {
    category: "Orders & Payment",
    question: "Are prices in U.S. dollars?",
    answer:
      "Yes. All prices are displayed and charged in United States dollars unless clearly stated otherwise.",
  },
  {
    category: "Orders & Payment",
    question: "Do you accept online payments?",
    answer:
      `${brandName} accepts online electronic payments only through methods displayed at checkout. Payment processing is currently being set up and will become available after an authorized payment provider is activated.`,
  },
  {
    category: "Orders & Payment",
    question: "Do you offer Cash on Delivery?",
    answer: `No. ${brandName} does not accept Cash on Delivery.`,
  },
  {
    category: "Orders & Payment",
    question: "Do you offer recurring subscriptions?",
    answer:
      "No. Product orders are one-time purchases and are not automatically recurring.",
  },
  {
    category: "Orders & Payment",
    question: "What will appear on my card statement?",
    answer:
      `After online payments are activated, the exact processor-approved billing descriptor will be displayed at checkout or in the order confirmation. It will identify the transaction as associated with ${brandName}.`,
  },
  {
    category: "Shipping",
    question: "How much does shipping cost?",
    answer:
      "We provide free standard shipping on eligible orders within our published U.S. shipping area.",
  },
  {
    category: "Shipping",
    question: "Where do you ship?",
    answer:
      "We currently ship within the contiguous 48 United States. We do not currently ship internationally or to Alaska, Hawaii, U.S. territories, APO/FPO/DPO addresses, or P.O. boxes.",
  },
  {
    category: "Shipping",
    question: "How long does processing take?",
    answer:
      "Orders are normally processed within 1–2 business days after payment authorization and order acceptance.",
  },
  {
    category: "Shipping",
    question: "How long does delivery take?",
    answer:
      "Standard delivery normally takes 3–7 business days after processing. The estimated total period is generally 4–9 business days.",
  },
  {
    category: "Shipping",
    question: "How can I track my order?",
    answer:
      "When tracking becomes available, it will be sent to the email address used for the order. Carrier tracking may take up to 48 hours to update after label creation.",
  },
  {
    category: "Shipping",
    question: "Can I change my shipping address?",
    answer:
      `${contactInstruction} immediately. Address changes are available only before shipment and cannot be guaranteed after fulfillment begins.`,
  },
  {
    category: "Orders & Payment",
    question: "Can I cancel my order?",
    answer:
      "A cancellation may be requested before the order ships. Once an order has shipped, the Return and Refund Policy applies.",
  },
  {
    category: "Returns & Refunds",
    question: "What is your return period?",
    answer:
      "Eligible products may be returned within 30 days of confirmed delivery.",
  },
  {
    category: "Returns & Refunds",
    question: "What condition must a returned item be in?",
    answer:
      "It must be unused, unworn, unwashed, unaltered, and in original condition with tags, accessories, and packaging.",
  },
  {
    category: "Returns & Refunds",
    question: "Do you charge a restocking fee?",
    answer:
      "No. We do not charge a restocking fee for an eligible return.",
  },
  {
    category: "Returns & Refunds",
    question: "Who pays for return shipping?",
    answer:
      `For a change-of-mind return, the customer pays return shipping. For a verified damaged, defective, or incorrect product, ${brandName} covers reasonable return-shipping costs.`,
  },
  {
    category: "Returns & Refunds",
    question: "What if my order arrives damaged or incorrect?",
    answer:
      `${contactInstruction} within 48 hours of delivery. Include the order number and clear photographs of the item, packaging, and shipping label.`,
  },
  {
    category: "Returns & Refunds",
    question: "Do you offer exchanges?",
    answer:
      "No. We provide refunds for eligible returns. A customer may place a separate order for another product.",
  },
  {
    category: "Returns & Refunds",
    question: "How long does a refund take?",
    answer:
      "An approved refund is issued to the original payment method within 5–7 business days after inspection. The bank or card issuer may take additional time to post it.",
  },
  {
    category: "Returns & Refunds",
    question: "Where should I send an authorized return?",
    answer: fullAddress
      ? `After receiving return authorization, send the product according to our instructions to: ${brandName}, ${fullAddress}. Do not mail an unauthorized return.`
      : "After receiving return authorization, send the product to the return address provided in our instructions. Do not mail an unauthorized return.",
  },
  {
    category: "Business",
    question: "Where is your inventory stored?",
    answer:
      `${brandName} fulfills customer orders from inventory held for sale by the business. Our published address is a business mailing and authorized return address and is not presented as a walk-in retail store.`,
  },
  {
    category: "Business",
    question: "Can I shop at your business address?",
    answer:
      `No walk-in retail shopping or customer pickup is offered unless ${brandName} confirms an appointment or pickup option in writing.`,
  },
  {
    category: "Support",
    question: "How can I contact customer support?",
    answer:
      `${supportDetails || "You can contact our team through the Contact page."} We generally respond within one business day.`,
  },
];

const TOPICS = [
  {
    name: "Business",
    subtitle: "About the business",
  },
  {
    name: "Product Information",
    subtitle: "Our bags and accessories",
  },
  {
    name: "Orders & Payment",
    subtitle: "Purchases, payments, and cancellations",
  },
  {
    name: "Shipping",
    subtitle: "Delivery and tracking",
  },
  {
    name: "Returns & Refunds",
    subtitle: "Returns, conditions, and refunds",
  },
  {
    name: "Support",
    subtitle: "Get in touch",
  },
];

const FAQs = () => {
  const [activeTopic, setActiveTopic] = useState("Orders & Payment");
  const [query, setQuery] = useState("");

  const searchText = query.trim().toLowerCase();

  const visibleFaqs = useMemo(
    () =>
      FAQS.filter((faq) =>
        searchText
          ? `${faq.question} ${faq.answer} ${faq.category}`
              .toLowerCase()
              .includes(searchText)
          : faq.category === activeTopic
      ),
    [activeTopic, searchText]
  );

  const selectTopic = (name) => {
    setActiveTopic(name);
    setQuery("");
  };

  return (
    <>
      {/* OPENING */}
      <section className="tt-info-hero" data-index="?">
        <p className="tt-eyebrow">
          <span className="tt-eyebrow-dot" />
          {brandName} / Customer care
        </p>

        <h1>
          A little <em>guidance.</em>
        </h1>

        <p>Choose a topic and find the details you need.</p>

        <label className="tt-faq-search" htmlFor="tt-faq-search">
          <Search size={20} strokeWidth={1.6} aria-hidden="true" />
          <span className="sr-only">Search every topic</span>
          <input
            id="tt-faq-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search every topic — shipping, returns, payments…"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </label>
      </section>

      <section className="tt-wrap tt-faq-page" aria-labelledby="tt-faq-title">
        {/* TOPICS */}
        <nav className="tt-faq-topics" aria-label="FAQ topics">
          {TOPICS.map((topic, index) => {
            const isActive = !searchText && activeTopic === topic.name;

            return (
              <button
                key={topic.name}
                type="button"
                aria-pressed={isActive}
                aria-controls="tt-faq-answers"
                className={isActive ? "is-active" : undefined}
                onClick={() => selectTopic(topic.name)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{topic.name}</strong>
                <small>{topic.subtitle}</small>
              </button>
            );
          })}
        </nav>

        {/* ANSWERS */}
        <div id="tt-faq-answers" className="tt-faq-reader">
          <div className="tt-cart-heading">
            <div>
              <p className="tt-eyebrow tt-eyebrow--accent">
                {searchText ? "Across all topics" : "The details"}
              </p>
              <h2 id="tt-faq-title">
                {searchText ? "Search results" : activeTopic}
              </h2>
            </div>

            <span role="status" aria-live="polite" aria-atomic="true">
              {visibleFaqs.length}{" "}
              {visibleFaqs.length === 1 ? "answer" : "answers"}
            </span>
          </div>

          <div key={searchText ? "search" : activeTopic} className="tt-faq">
            {visibleFaqs.length ? (
              visibleFaqs.map((faq, index) => (
                <details
                  key={faq.question}
                  open={index === 0}
                  style={{ animationDelay: `${Math.min(index, 6) * 55}ms` }}
                >
                  <summary>
                    <span>
                      {searchText && <small>{faq.category}</small>}
                      {faq.question}
                    </span>
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))
            ) : (
              <div className="tt-state tt-faq-empty">
                <h3>No matching answers.</h3>
                <p>Try another word or choose a topic.</p>
                <button
                  type="button"
                  className="tt-button tt-button--dark"
                  onClick={() => setQuery("")}
                >
                  Return to {activeTopic}
                  <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* STILL NEED A HAND */}
      <section className="tt-story tt-faq-help">
        <Reveal className="tt-story-copy">
          <p className="tt-eyebrow">A conversation can help</p>

          <h2>
            Let&apos;s talk <em>it through.</em>
          </h2>

          <Link to="/contact" className="tt-button tt-button--light">
            Contact support
            <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </Reveal>

        <Reveal delay={120} className="tt-faq-details">
          <p className="tt-eyebrow">Still need a hand?</p>

          {BUSINESS_INFO.email && <a href={emailLink}>{BUSINESS_INFO.email}</a>}

          {BUSINESS_INFO.phoneDisplay && phoneLink && (
            <a href={phoneLink}>{BUSINESS_INFO.phoneDisplay}</a>
          )}

          {!BUSINESS_INFO.email &&
            !(BUSINESS_INFO.phoneDisplay && phoneLink) && (
              <Link to="/contact">Contact our team</Link>
            )}

          {supportSchedule && (
            <p>
              {BUSINESS_INFO.businessDays}
              {BUSINESS_INFO.businessDays && supportHours && <br />}
              {supportHours}
            </p>
          )}
        </Reveal>
      </section>

      <div style={{ height: 90 }} />
    </>
  );
};

export default FAQs;