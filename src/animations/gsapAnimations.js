// animations/gsapAnimations.js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize all GSAP animations and scroll triggers
 */
export const initGSAPAnimations = () => {
  // Hero section cinematic sequence
  initHeroAnimations();
  
  // Section entrance animations
  initSectionAnimations();
  
  // Micro-interactions
  initMicroInteractions();
  
  // Text animations
  initTextAnimations();
};

/**
 * Hero section cinematic animations
 */
const initHeroAnimations = () => {
  // Logo entrance sequence
  const logoTL = gsap.timeline({ delay: 0.5 });
  logoTL
    .from('.hero-logo', { 
      scale: 0, 
      rotation: 180, 
      opacity: 0, 
      duration: 1.5, 
      ease: 'back.out(1.7)' 
    })
    .from('.hero-logo-glow', { 
      scale: 0, 
      opacity: 0, 
      duration: 1, 
      ease: 'power2.out' 
    }, '-=0.5');

  // Title cinematic sequence
  const titleTL = gsap.timeline({ delay: 1 });
  titleTL
    .from('.hero-title', { 
      y: 100, 
      opacity: 0, 
      duration: 1.2, 
      ease: 'power3.out' 
    })
    .from('.hero-subtitle', { 
      y: 50, 
      opacity: 0, 
      duration: 1, 
      ease: 'power2.out' 
    }, '-=0.3')
    .from('.hero-description', { 
      y: 30, 
      opacity: 0, 
      duration: 0.8, 
      ease: 'power2.out' 
    }, '-=0.2');

  // Features badges animation
  gsap.from('.hero-features', { 
    y: 30, 
    opacity: 0, 
    duration: 1, 
    delay: 2, 
    ease: 'power2.out',
    stagger: 0.1 
  });

  // CTA buttons animation
  gsap.from('.hero-cta', { 
    y: 50, 
    opacity: 0, 
    duration: 1, 
    delay: 2.5, 
    ease: 'back.out(1.7)',
    stagger: 0.2 
  });
};

/**
 * Section entrance animations with ScrollTrigger
 */
const initSectionAnimations = () => {
  // Features section
  ScrollTrigger.create({
    trigger: '#features',
    start: 'top 80%',
    end: 'bottom 20%',
    animation: gsap.from('#features .feature-card', {
      y: 100,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.2
    })
  });

  // Technology section
  ScrollTrigger.create({
    trigger: '#technology',
    start: 'top 80%',
    animation: gsap.from('#technology .tech-hub', {
      scale: 0.8,
      opacity: 0,
      duration: 1.5,
      ease: 'power2.out'
    })
  });

  // Download section
  ScrollTrigger.create({
    trigger: '#download',
    start: 'top 80%',
    animation: gsap.from('#download .download-content', {
      y: 80,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out'
    })
  });
};

/**
 * Micro-interactions for buttons and icons
 */
const initMicroInteractions = () => {
  // Button hover effects
  gsap.utils.toArray('.btn-primary').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, { 
        scale: 1.05, 
        duration: 0.3, 
        ease: 'power2.out' 
      });
    });
    
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { 
        scale: 1, 
        duration: 0.3, 
        ease: 'power2.out' 
      });
    });
  });

  // Icon hover effects
  gsap.utils.toArray('.icon-hover').forEach(icon => {
    icon.addEventListener('mouseenter', () => {
      gsap.to(icon, { 
        rotation: 5, 
        scale: 1.1, 
        duration: 0.3, 
        ease: 'power2.out' 
      });
    });
    
    icon.addEventListener('mouseleave', () => {
      gsap.to(icon, { 
        rotation: 0, 
        scale: 1, 
        duration: 0.3, 
        ease: 'power2.out' 
      });
    });
  });
};

/**
 * Advanced text animations
 */
const initTextAnimations = () => {
  // Split text into characters for advanced animations
  gsap.utils.toArray('.text-split').forEach(text => {
    const chars = text.textContent.split('');
    text.innerHTML = chars.map(char => `<span class="char">${char}</span>`).join('');
    
    gsap.from(text.querySelectorAll('.char'), {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.02
    });
  });
};

/**
 * Smooth scroll setup
 */
export const initSmoothScroll = () => {
  gsap.registerPlugin(ScrollTrigger);
  
  ScrollTrigger.config({
    ignoreMobileResize: true
  });
};

/**
 * Performance optimization
 */
export const optimizePerformance = () => {
  // Use will-change for animated elements
  gsap.utils.toArray('.animated-element').forEach(el => {
    el.style.willChange = 'transform, opacity';
  });
  
  // Clean up on unmount
  return () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  };
};
