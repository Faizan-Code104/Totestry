import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, ArrowUpRight, Mail, Phone } from "lucide-react";

import {
  BUSINESS_INFO,
  getAddressLines,
  getEmailLink,
  getPhoneLink,
  getSupportHours,
} from "../storeInfo";
import Reveal from "./Reveal";

/* =====================================================================
   Shared building blocks for every policy page (cookie, privacy,
   shipping, returns, payment, cancellation, terms).
   The policy TEXT stays inside each policy file — this file only holds
   the layout, so all policy pages look the same.
   ===================================================================== */

const pad = (number) => String(number).padStart(2, "0");

const sectionDomId = (id) => `policy-${id}`;

/**
 * One numbered section of a policy.
 */
export const PolicySection = ({ id, number, title, children }) => (
  <Reveal
    as="section"
    id={sectionDomId(id)}
    className="tt-info-section tt-policy-section"
    aria-labelledby={`policy-title-${id}`}
  >
    <h2 id={`policy-title-${id}`}>
      <span aria-hidden="true">{pad(number)}</span>
      {title}
    </h2>

    {children}
  </Reveal>
);

/**
 * Highlighted remark inside a section.
 */
export const PolicyNote = ({ children }) => (
  <div className="tt-policy-callout">{children}</div>
);

/**
 * Business name, address, email and phone — all read from storeInfo.js.
 */
export const PolicyContact = ({
  showHours = false,
  hoursLabel = "Hours",
  contactLink = false,
}) => {
  const addressLines = getAddressLines();
  const emailLink = getEmailLink();
  const phoneLink = getPhoneLink();
  const hours = getSupportHours();

  return (
    <div className="tt-policy-contact">
      <address>
        <strong>{BUSINESS_INFO.businessName}</strong>

        {addressLines.map((line, index) => (
          <React.Fragment key={`${index}-${line}`}>
            {index > 0 && <br />}
            {line}
          </React.Fragment>
        ))}
      </address>

      <div>
        {BUSINESS_INFO.email && (
          <a href={emailLink}>
            <Mail size={17} strokeWidth={1.5} aria-hidden="true" />
            <span>
              <small>Email</small>
              {BUSINESS_INFO.email}
            </span>
          </a>
        )}

        {BUSINESS_INFO.phoneDisplay && phoneLink && (
          <a href={phoneLink}>
            <Phone size={17} strokeWidth={1.5} aria-hidden="true" />
            <span>
              <small>Phone</small>
              {BUSINESS_INFO.phoneDisplay}
            </span>
          </a>
        )}

        {showHours && hours && (
          <p>
            {hoursLabel}: {hours}
          </p>
        )}

        {contactLink && (
          <Link to="/contact" className="tt-policy-contact-link">
            Contact our team
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
};

/**
 * "At a glance" summary card: key facts plus short reminders.
 *
 * eyebrow    small label (default "At a glance")
 * title      optional heading
 * facts      [{ label, value }]
 * note       optional closing line (JSX allowed)
 * reminders  [{ Icon, title, text }]
 */
export const PolicyGlance = ({
  eyebrow = "At a glance",
  title,
  facts = [],
  reminders = [],
  note,
}) => (
  <Reveal className="tt-policy-glance">
    <p className="tt-eyebrow">{eyebrow}</p>
    {title && <h2>{title}</h2>}

    {facts.length > 0 && (
      <dl>
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
    )}

    {reminders.length > 0 && (
      <div className="tt-policy-reminders">
        {reminders.map(({ Icon, title: heading, text }) => (
          <div key={heading}>
            <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
            <h3>{heading}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
    )}

    {note && <p className="tt-policy-glance-note">{note}</p>}
  </Reveal>
);

/**
 * Page frame: hero, section navigation, intro, help card, footer.
 *
 * index        big faded number/text behind the hero ("05")
 * eyebrow      small line above the title
 * title        the page title (JSX allowed)
 * summary      one line under the title
 * updated      { iso: "2026-10-04", label: "October 4, 2026" }
 * sections     [{ id, title }] — builds the side navigation
 * introLabel   small label above the intro paragraph
 * intro        the opening paragraph of the policy (JSX)
 * help         { eyebrow?, title, text, to?, label? } — card under the
 *              navigation (links to the contact page by default)
 * name         "Cookie Policy" — used for labels
 */
export const PolicyPage = ({
  index,
  eyebrow,
  title,
  summary,
  updated,
  sections = [],
  introLabel,
  intro,
  help,
  name,
  children,
}) => {
  const [activeId, setActiveId] = useState(sections[0]?.id || "");

  // A plain string, so the effect below only re-runs when the ids change
  const sectionIds = sections.map((section) => section.id).join("|");

  // Highlights the section currently being read in the side navigation
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id.replace(/^policy-/, ""));
          }
        });
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );

    sectionIds.split("|").forEach((id) => {
      const node = document.getElementById(sectionDomId(id));

      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return (
    <>
      <section className="tt-info-hero" data-index={index}>
        <p className="tt-eyebrow">
          <span className="tt-eyebrow-dot" />
          {eyebrow}
        </p>

        <h1>{title}</h1>

        {summary && <p>{summary}</p>}

        {updated && (
          <p className="tt-policy-updated">
            Last updated: <time dateTime={updated.iso}>{updated.label}</time>
          </p>
        )}
      </section>

      <div className="tt-info-layout">
        <aside className="tt-policy-side">
          <nav className="tt-info-nav" aria-label={`${name} sections`}>
            <p>Inside this policy</p>

            {sections.map((section, position) => (
              <a
                key={section.id}
                href={`#${sectionDomId(section.id)}`}
                className={activeId === section.id ? "is-active" : undefined}
              >
                <span>{pad(position + 1)}</span>
                {section.title}
              </a>
            ))}
          </nav>

          {help && (
            <div className="tt-policy-help">
              <Mail size={21} strokeWidth={1.4} aria-hidden="true" />
              {help.eyebrow && <small>{help.eyebrow}</small>}
              <h2>{help.title}</h2>
              <p>{help.text}</p>

              <Link to={help.to || "/contact"}>
                {help.label || "Contact us"}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          )}
        </aside>

        <article className="tt-info-content" aria-label={name}>
          {intro && (
            <Reveal className="tt-policy-intro">
              {introLabel && (
                <p className="tt-eyebrow tt-eyebrow--accent">{introLabel}</p>
              )}
              <p className="tt-info-intro">{intro}</p>
            </Reveal>
          )}

          {children}

          <footer className="tt-policy-footer">
            <span>
              {BUSINESS_INFO.businessName} / {name}
            </span>

            <button type="button" onClick={scrollToTop}>
              Back to top
              <ArrowUp size={14} strokeWidth={2.2} aria-hidden="true" />
            </button>
          </footer>
        </article>
      </div>
    </>
  );
};

export default PolicyPage;