import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  Layers3,
  Ruler,
  Sparkles,
} from "lucide-react";

import storeInfo from "../storeInfo";
import Reveal from "./Reveal";

const principles = [
  {
    number: "01",
    title: "Everyday use",
    description:
      "We look for bags that make sense across normal routines, from daily errands to plans that take you somewhere new.",
  },
  {
    number: "02",
    title: "Useful details",
    description:
      "Practical layouts, usable storage, and comfortable carrying options are part of what we consider.",
  },
  {
    number: "03",
    title: "Easy styling",
    description:
      "Versatile shapes and colors help a bag move naturally between different looks and occasions.",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Shape & silhouette",
    description:
      "We look for handbags with balanced proportions and versatile forms that work across everyday routines.",
    Icon: Ruler,
  },
  {
    number: "02",
    title: "Practical details",
    description:
      "Storage, carrying comfort, closures, and usable interior layouts are considered as part of the selection.",
    Icon: Layers3,
  },
  {
    number: "03",
    title: "Style versatility",
    description:
      "We favor designs that can move easily between work, errands, travel, casual plans, and social occasions.",
    Icon: Sparkles,
  },
  {
    number: "04",
    title: "Clear information",
    description:
      "Each product page is intended to present the available product details so shoppers can review before ordering.",
    Icon: CheckCircle2,
  },
];

const About = () => {
  return (
    <>
      {/* OPENING */}
      <section className="tt-info-hero" data-index="01">
        <p className="tt-eyebrow">
          <span className="tt-eyebrow-dot" />
          {storeInfo.businessName} / Our story
        </p>

        <h1>
          Life moves.
          <br />
          <em>Carry it well.</em>
        </h1>

        <p>
          {storeInfo.businessName} is focused on women&apos;s handbags
          selected for everyday versatility, practical use, and modern
          styling.
        </p>
      </section>

      {/* BRAND STATEMENT */}
      <section className="tt-wrap tt-about-statement">
        <Reveal>
          <p className="tt-eyebrow tt-eyebrow--accent">
            The thought behind the collection
          </p>

          <h2 className="tt-about-quote">
            A handbag should feel useful <em>before it feels complicated.</em>
          </h2>
        </Reveal>

        <Reveal delay={120} className="tt-about-aside">
          <p>
            Our approach centers on styles that move naturally through
            different parts of the day—from work and errands to travel and
            everyday plans.
          </p>

          <Link to="/shop" className="tt-text-arrow">
            Meet the collection
            <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </Reveal>
      </section>

      {/* PRINCIPLES */}
      <section className="tt-wrap tt-about-tight">
        <Reveal className="tt-section-title">
          <div>
            <p className="tt-eyebrow tt-eyebrow--accent">
              Our perspective / 03 principles
            </p>
            <h2>
              What we
              <br />
              <em>carry forward.</em>
            </h2>
          </div>

          <p>
            A few simple ideas guide the way we look at a bag and the place it
            can have in your day.
          </p>
        </Reveal>

        <div className="tt-about-principles">
          {principles.map((item, index) => (
            <Reveal
              as="article"
              key={item.number}
              delay={index * 90}
              className="tt-about-principle"
            >
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* EDITORIAL STORY */}
      <section className="tt-story">
        <div className="tt-story-image">
          <img
            src="/about.jpg"
            alt={`${storeInfo.businessName} handbag in an editorial setting`}
            loading="lazy"
          />
          <span>THE EVERYDAY EDIT</span>
        </div>

        <Reveal className="tt-story-copy">
          <p className="tt-eyebrow">{storeInfo.businessName} / Our direction</p>

          <h2>
            Room for <em>your everyday.</em>
          </h2>

          <p>
            Rather than building around one occasion, we focus on versatile
            bags that support different routines and personal styles.
          </p>

          <p>
            We want {storeInfo.businessName} to feel clear, considered, and
            easy to navigate—from discovering a bag to reviewing its available
            details.
          </p>

          <div className="tt-about-tags">
            <span>Modern style</span>
            <span>Practical use</span>
            <span>Clear information</span>
          </div>
        </Reveal>
      </section>

      {/* SELECTION NOTES */}
      <section className="tt-wrap">
        <Reveal className="tt-section-title">
          <div>
            <p className="tt-eyebrow tt-eyebrow--accent">How we choose</p>
            <h2>
              The selection
              <br />
              <em>notes.</em>
            </h2>
          </div>

          <p>
            Our selection process is built around practical considerations and
            straightforward product information.
          </p>
        </Reveal>

        <div className="tt-card-grid">
          {processSteps.map(({ number, title, description, Icon }, index) => (
            <Reveal key={number} delay={(index % 2) * 110}>
              <article className="tt-card tt-about-step">
                <div>
                  <span>{number} / 04</span>
                  <Icon size={26} strokeWidth={1.4} aria-hidden="true" />
                </div>

                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* COLLECTION INVITATION */}
      <Reveal as="section" className="tt-wrap tt-closing tt-about-tight">
        <p className="tt-eyebrow tt-eyebrow--accent">Your next chapter</p>

        <h2>
          Find a shape for
          <br />
          <em>the day ahead.</em>
        </h2>

        <Link to="/shop" className="tt-button tt-button--dark">
          Explore the collection
          <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
        </Link>
      </Reveal>
    </>
  );
};

export default About;