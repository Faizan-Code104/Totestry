import React, { useEffect, useRef, useState } from "react";

const skipMotion = () =>
  typeof window === "undefined" ||
  !("IntersectionObserver" in window) ||
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Fades + lifts its children into place the first time they scroll into view.
 * <Reveal delay={90}>...</Reveal>   (delay in ms, for staggering grid items)
 */
const Reveal = ({
  as: Tag = "div",
  delay = 0,
  className = "",
  style,
  children,
  ...rest
}) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(skipMotion);

  useEffect(() => {
    const node = ref.current;

    if (!node || shown) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [shown]);

  return (
    <Tag
      ref={ref}
      className={`tt-reveal${shown ? " is-in" : ""}${className ? ` ${className}` : ""}`}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;