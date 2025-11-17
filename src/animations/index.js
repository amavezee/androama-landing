// animations/index.js
import { initGSAPAnimations, initSmoothScroll, optimizePerformance } from './gsapAnimations.js';
import { HolographicLogo, AnimatedGradientBackground, ParallaxGrid } from './threeEffects.js';

/**
 * Main animations controller
 * Manages all animation systems and performance optimization
 */
export class AnimationController {
  constructor() {
    this.holographicLogo = null;
    this.gradientBackground = null;
    this.parallaxGrid = null;
    this.isInitialized = false;
    this.cleanupFunctions = [];
  }

  /**
   * Initialize all animation systems
   */
  async init() {
    if (this.isInitialized) return;

    try {
      // Initialize GSAP animations
      initGSAPAnimations();
      initSmoothScroll();
      
      // Initialize Three.js effects
      await this.initThreeEffects();
      
      // Initialize performance optimizations
      const cleanup = optimizePerformance();
      if (cleanup) this.cleanupFunctions.push(cleanup);
      
      // Bind resize events
      this.bindResizeEvents();
      
      this.isInitialized = true;
      console.log('🎬 Animation systems initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize animations:', error);
    }
  }

  /**
   * Initialize Three.js effects
   */
  async initThreeEffects() {
    // Wait for DOM to be ready
    await new Promise(resolve => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });

    // Initialize holographic logo
    const logoContainer = document.querySelector('.holographic-logo-container');
    if (logoContainer) {
      this.holographicLogo = new HolographicLogo(logoContainer);
      this.cleanupFunctions.push(() => this.holographicLogo?.dispose());
    }

    // Initialize animated gradient background
    const backgroundContainer = document.querySelector('.animated-background');
    if (backgroundContainer) {
      this.gradientBackground = new AnimatedGradientBackground(backgroundContainer);
      this.cleanupFunctions.push(() => this.gradientBackground?.dispose());
    }

    // Initialize parallax grid
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer) {
      this.parallaxGrid = new ParallaxGrid(mainContainer);
      this.cleanupFunctions.push(() => this.parallaxGrid?.dispose());
    }
  }

  /**
   * Bind resize events for responsive animations
   */
  bindResizeEvents() {
    const handleResize = () => {
      this.holographicLogo?.resize();
      this.gradientBackground?.resize();
    };

    window.addEventListener('resize', handleResize);
    this.cleanupFunctions.push(() => {
      window.removeEventListener('resize', handleResize);
    });
  }

  /**
   * Clean up all animations and resources
   */
  dispose() {
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];
    this.isInitialized = false;
    console.log('🧹 Animation systems cleaned up');
  }

  /**
   * Pause all animations (for performance)
   */
  pause() {
    if (this.holographicLogo) {
      this.holographicLogo.renderer.setAnimationLoop(null);
    }
    if (this.gradientBackground) {
      this.gradientBackground.renderer.setAnimationLoop(null);
    }
  }

  /**
   * Resume all animations
   */
  resume() {
    if (this.holographicLogo) {
      this.holographicLogo.animate();
    }
    if (this.gradientBackground) {
      this.gradientBackground.animate();
    }
  }
}

// Export singleton instance
export const animationController = new AnimationController();

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  // Initialize on page load
  window.addEventListener('load', () => {
    animationController.init();
  });
}
