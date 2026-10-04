import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// Lenis — stejné nastavení jako na registračním formuláři,
// aby scroll působil na celé cestě konzistentně
// ============================================================
const lenis = new Lenis({
  duration: 3.6,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -8 * t)),
  smoothWheel: true,
  wheelMultiplier: 0.65,
  touchMultiplier: 1.1,
});

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
});

gsap.ticker.lagSmoothing(0);

// POZNÁMKA: pokud FormToPaySubscriber.js nebo StudentImport.js
// taky vytváří vlastní Lenis instanci, budou se dvě instance
// prát o scroll handler. Na stránce smí běžet jen jedna.
window.lenis = lenis;

// ============================================================
// Scroll-triggered odhalení — přizpůsobeno reálným sekcím
// Summary.html (levý panel kroků, střední souhrn, pravý import)
// ============================================================
function revealSection(el, opts = {}) {
  gsap.from(el, {
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      end: 'top 30%',
      scrub: 2.5,
    },
    y: 80,
    opacity: 0,
    filter: 'blur(6px)',
    ease: 'power4.out',
    ...opts,
  });
}

// Levý panel — kroky se odhalí jeden po druhém
const stepItems = document.querySelectorAll('.SummarySteps .StepItem');
if (stepItems.length) {
  gsap.from(stepItems, {
    scrollTrigger: {
      trigger: '.SummarySteps',
      start: 'top 85%',
      end: 'top 30%',
      scrub: 2.5,
    },
    y: 60,
    opacity: 0,
    filter: 'blur(4px)',
    stagger: 0.15,
    ease: 'power4.out',
  });
}

// Střední panel — celý box se souhrnem
const summarySection = document.querySelector('.SummaryPanel');
if (summarySection) revealSection(summarySection);

// Pravý panel — import studentů
const importPanel = document.querySelector('.importPanel');
if (importPanel) revealSection(importPanel, { y: 100 });

// ============================================================
// #summaryContent se plní asynchronně z FormToPaySubscriber.js
// (čte sessionStorage). Dokud se to nestane, ScrollTrigger má
// spočítané pozice podle prázdného/loading stavu → po naplnění
// je stránka jinak vysoká a trigger body sedí špatně.
// MutationObserver po každé změně obsahu přepočítá pozice.
// ============================================================
const summaryContentEl = document.getElementById('summaryContent');
if (summaryContentEl) {
  const observer = new MutationObserver(() => {
    ScrollTrigger.refresh();
  });
  observer.observe(summaryContentEl, { childList: true, subtree: true });
}

ScrollTrigger.refresh();

export default lenis;
