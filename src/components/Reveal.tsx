import React, { useEffect, useRef, useState } from 'react';

function useInView<T extends HTMLElement>(rootMargin = '0px 0px -60px 0px') {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.1, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, visible };
}

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export const Reveal: React.FC<RevealProps> = ({ children, className = '', delay = 0 }) => {
  const { ref, visible } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
};

export const RevealGroup: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  const { ref, visible } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className={`reveal-group ${visible ? 'is-visible' : ''} ${className}`.trim()}>
      {children}
    </div>
  );
};
