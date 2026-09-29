'use client';

import { useEffect, useState } from 'react';

type StitchScreenProps = {
  desktop: string;
  mobile: string;
  title: string;
};

/** Load just the authored layout for the current viewport. */
export default function StitchScreen({ desktop, mobile, title }: StitchScreenProps) {
  const [mobileLayout, setMobileLayout] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setMobileLayout(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  if (mobileLayout === null) return <main className="screen-host" aria-label={title} />;

  return (
    <main className="screen-host" aria-label={title}>
      <iframe
        className="screen-frame"
        src={mobileLayout ? mobile : desktop}
        title={`${title}${mobileLayout ? ' mobile' : ' desktop'}`}
        scrolling="yes"
      />
    </main>
  );
}
