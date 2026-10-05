import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";

import {
  BUSINESS_INFO,
  getAddressLines,
  getEmailLink,
  getPhoneLink,
} from "../storeInfo";
import Reveal from "./Reveal";

const EMPTY_FORM = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const Contact = () => {
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const sendingRef = useRef(false);

  const supportTime = [
    BUSINESS_INFO.supportHours,
    BUSINESS_INFO.timeZone,
  ]
    .filter(Boolean)
    .join(" ");

  const addressLines = getAddressLines();
  const emailLink = getEmailLink();
  const phoneLink = getPhoneLink();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (sendingRef.current) return;

    setSuccessMessage("");
    setErrorMessage("");

    if (!event.currentTarget.reportValidity()) return;

    const values = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        value.trim(),
      ])
    );

    if (Object.values(values).some((value) => !value)) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setErrorMessage(
        BUSINESS_INFO.email || BUSINESS_INFO.phoneDisplay
          ? "The message form is currently unavailable. Please use the contact details below."
          : "The message form is currently unavailable. Please try again later."
      );
      return;
    }

    sendingRef.current = true;
    setIsSubmitting(true);

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: values.name,
          from_email: values.email,
          subject: values.subject,
          message: values.message,
        },
        { publicKey }
      );

      setSuccessMessage(
        "Your message has been sent. Our support team will get back to you as soon as possible."
      );
      setFormData({ ...EMPTY_FORM });
    } catch {
      setErrorMessage(
        BUSINESS_INFO.email
          ? "We couldn't send your message. Please try again or email us directly."
          : "We couldn't send your message. Please try again."
      );
    } finally {
      sendingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* OPENING */}
      <section className="tt-info-hero" data-index="?">
        <p className="tt-eyebrow">
          <span className="tt-eyebrow-dot" />
          {BUSINESS_INFO.businessName} / The care desk
        </p>

        <h1>
          A question?
          <br />
          <em>Let&apos;s talk.</em>
        </h1>

        <p>
          A little help with your order, a detail about a bag, or something
          else on your mind. We&apos;re here to listen.
        </p>
      </section>

      <div className="tt-contact">
        {/* OTHER WAYS TO REACH US */}
        <aside className="tt-contact-ways" aria-labelledby="tt-contact-title">
          <Reveal>
            <p className="tt-eyebrow tt-eyebrow--accent">Prefer another way?</p>
            <h2 id="tt-contact-title">
              Stay <em>in touch.</em>
            </h2>
          </Reveal>

          <Reveal delay={80} className="tt-contact-way">
            <span className="tt-contact-icon">
              <Mail size={20} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div>
              <h3>Email us</h3>

              {BUSINESS_INFO.email && (
                <a href={emailLink}>
                  {BUSINESS_INFO.email}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              )}

              <p>We usually respond within 24 hours during business days.</p>
            </div>
          </Reveal>

          <Reveal delay={160} className="tt-contact-way">
            <span className="tt-contact-icon">
              <Phone size={20} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div>
              <h3>Give us a call</h3>

              {BUSINESS_INFO.phoneDisplay && phoneLink && (
                <a href={phoneLink}>
                  {BUSINESS_INFO.phoneDisplay}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              )}

              <p>Available during our business hours.</p>
            </div>
          </Reveal>

          <Reveal delay={240} className="tt-contact-way">
            <span className="tt-contact-icon">
              <Clock3 size={20} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div>
              <h3>Our hours</h3>

              {BUSINESS_INFO.businessDays && (
                <strong>{BUSINESS_INFO.businessDays}</strong>
              )}

              {supportTime && <p>{supportTime}</p>}
            </div>
          </Reveal>

          <Reveal delay={320} className="tt-contact-way">
            <span className="tt-contact-icon">
              <MapPin size={20} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div>
              <h3>Business location</h3>

              {addressLines.length > 0 && (
                <address>
                  {addressLines.map((line, index) => (
                    <React.Fragment key={`${index}-${line}`}>
                      {index > 0 && <br />}
                      {line}
                    </React.Fragment>
                  ))}
                </address>
              )}
            </div>
          </Reveal>
        </aside>

        {/* MESSAGE FORM */}
        <section className="tt-contact-form" aria-labelledby="tt-form-title">
          <div className="tt-contact-form-top">
            <div>
              <p className="tt-eyebrow">A note to our team</p>
              <h2 id="tt-form-title">How can we help?</h2>
            </div>

            <span className="tt-contact-mark" aria-hidden="true">
              <Mail size={30} strokeWidth={1.2} />
            </span>
          </div>

          <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
            <fieldset disabled={isSubmitting}>
              <legend className="sr-only">
                Your contact details and message
              </legend>

              <div className="tt-checkout-fields">
                <label className="tt-field" htmlFor="tt-contact-name">
                  <span>Your name</span>
                  <input
                    id="tt-contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    maxLength={80}
                    placeholder="Full name"
                    required
                  />
                </label>

                <label className="tt-field" htmlFor="tt-contact-email">
                  <span>Email address</span>
                  <input
                    id="tt-contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    maxLength={120}
                    placeholder="you@example.com"
                    required
                  />
                </label>

                <label
                  className="tt-field tt-field--full"
                  htmlFor="tt-contact-subject"
                >
                  <span>What&apos;s it about?</span>
                  <input
                    id="tt-contact-subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    maxLength={120}
                    placeholder="An order, a product, or a general question"
                    required
                  />
                </label>

                <label
                  className="tt-field tt-field--full"
                  htmlFor="tt-contact-message"
                >
                  <span>
                    Your message
                    <small id="tt-contact-count">
                      {formData.message.length} / 2000
                    </small>
                  </span>
                  <textarea
                    id="tt-contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    maxLength={2000}
                    placeholder="Tell us a little more..."
                    rows={6}
                    required
                    aria-describedby="tt-contact-count"
                  />
                </label>
              </div>
            </fieldset>

            {successMessage && (
              <div className="tt-feedback is-success" role="status">
                <CheckCircle2 size={20} aria-hidden="true" />
                <p>{successMessage}</p>
              </div>
            )}

            {errorMessage && (
              <div className="tt-feedback is-error" role="alert">
                <AlertCircle size={20} aria-hidden="true" />
                <p>{errorMessage}</p>
              </div>
            )}

            <div className="tt-contact-submit">
              <p>
                Include your order number if your question is about an
                existing order.
              </p>

              <button
                type="submit"
                className="tt-button tt-button--dark"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending your note…" : "Send your note"}
                {isSubmitting ? (
                  <Loader2 size={18} className="tt-spinner" aria-hidden="true" />
                ) : (
                  <Send size={17} strokeWidth={1.5} aria-hidden="true" />
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
};

export default Contact;