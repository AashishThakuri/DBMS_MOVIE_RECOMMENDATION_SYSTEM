
const initSmoothScrolling = () => {
  const lenis = new Lenis({ lerp: 0.12 });
  
  // Sync ScrollTrigger with Lenis' scroll updates.
  lenis.on('scroll', ScrollTrigger.update);
  
  // Ensure GSAP animations are in sync with Lenis' scroll frame updates.
  gsap.ticker.add(time => {
      lenis.raf(time * 1000); // Convert GSAP's time to milliseconds for Lenis.
  });
  
  // Turn off GSAP's default lag smoothing to avoid conflicts with Lenis.
  gsap.ticker.lagSmoothing(0);
};

// Activate the smooth scrolling feature.
initSmoothScrolling();
