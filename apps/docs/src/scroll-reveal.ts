import worldsUrl from './assets/cast-worlds-v1.png?url';

export function mountScrollReveal(root: HTMLElement) {
  const lifetime = new AbortController();
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sections = [
    ...root.querySelectorAll<HTMLElement>(
      'main > section:not(.hero), main > footer',
    ),
  ];
  const gallery = root.querySelector<HTMLElement>('.cast-gallery');
  const reveal = (node: HTMLElement) => node.classList.add('is-revealed');
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal(entry.target as HTMLElement);
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.06 },
  );
  const galleryObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.35) continue;
        reveal(entry.target as HTMLElement);
        galleryObserver.unobserve(entry.target);
      }
    },
    { threshold: 0.35, rootMargin: '0px 0px -80px 0px' },
  );
  for (const section of sections) {
    section.classList.add('scroll-reveal');
    if (motion.matches) reveal(section);
    else observer.observe(section);
  }
  if (gallery) {
    gallery.classList.add('cast-reveal');
    if (motion.matches) reveal(gallery);
    else galleryObserver.observe(gallery);
  }
  // The large illustration is fetched only when the gallery approaches the viewport.
  const load = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting) || !gallery) return;
      gallery.style.setProperty('--cast-worlds', `url("${worldsUrl}")`);
      load.disconnect();
    },
    { rootMargin: '350px 0px' },
  );
  if (gallery) load.observe(gallery);
  function showAll() {
    if (!motion.matches) return;
    sections.forEach(reveal);
    if (gallery) reveal(gallery);
    observer.disconnect();
    galleryObserver.disconnect();
  }
  motion.addEventListener('change', showAll, { signal: lifetime.signal });
  root.addEventListener(
    'focusin',
    (event) => {
      if (!(event.target instanceof HTMLElement)) return;
      for (const node of [...sections, ...(gallery ? [gallery] : [])]) {
        if (node.contains(event.target)) {
          reveal(node);
          observer.unobserve(node);
          galleryObserver.unobserve(node);
        }
      }
    },
    { signal: lifetime.signal },
  );
  return () => {
    lifetime.abort();
    observer.disconnect();
    galleryObserver.disconnect();
    load.disconnect();
  };
}
