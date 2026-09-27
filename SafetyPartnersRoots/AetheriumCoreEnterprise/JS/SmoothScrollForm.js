import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// Lenis — těžší, důstojnější scroll
// ============================================================
const lenis = new Lenis({
  duration: 3.6,                                   // ← bylo 2.5, teď "sametové dveře"
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -8 * t)),  // pomalejší doběh
  smoothWheel: true,
  wheelMultiplier: 0.65,                           // ← nižší = scroll "váží víc"
  touchMultiplier: 1.1,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

window.lenis = lenis;

// ============================================================
// Scroll-triggered odhalení — Královský nástup
// ============================================================
const formSections = document.querySelectorAll(
  '.Form-FirstSection, .Form-SecondSection, .Form-ThirdSection'
);

formSections.forEach((section) => {
  const fields = section.querySelectorAll('label, input, button');

  gsap.from(fields, {
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      end: 'top 20%',
      scrub: 2.5,          // ← vysoké číslo = animace "dohání" scroll pomalu a plynule
    },
    y: 120,                // ← delší dráha, méně uspěchané
    opacity: 0,
    filter: 'blur(6px)',   // ← jemné odostření dodá "vynořování z mlhy"
    stagger: 0.15,         // ← pole se objevují jedno po druhém, ne najednou
    ease: 'power4.out',    // ← výrazně měkčí doběh než power2
  });
});

ScrollTrigger.refresh();

export default lenis;
