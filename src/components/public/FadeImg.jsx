import { useState, useEffect, useRef } from 'react';

export default function FadeImg({ src, alt, style, className }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease-out',
      }}
    />
  );
}
