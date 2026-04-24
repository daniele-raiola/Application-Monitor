/**
 * ConfettiEffect.js
 * Confetti animation wrapper using canvas-confetti
 */

let confettiLib = null;

export class ConfettiEffect {
  constructor() {
    this.isLoaded = false;
    this.init();
  }

  async init() {
    if (confettiLib) {
      this.isLoaded = true;
      return;
    }

    try {
      const module = await import('https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/+esm');
      confettiLib = module.default;
      this.isLoaded = true;
    } catch (e) {
      console.error('Failed to load confetti library:', e);
    }
  }

  /**
   * Trigger confetti burst
   */
  async burst(options = {}) {
    if (!confettiLib) {
      await this.init();
    }

    if (!confettiLib) {
      console.warn('Confetti not available');
      return;
    }

    const {
      particleCount = 100,
      spread = 70,
      origin = { y: 0.6 }
    } = options;

    confettiLib({
      particleCount,
      spread,
      origin,
      colors: [
        '#2C3E8C', // primary
        '#E8A020', // accent/gold
        '#2D8C4E', // success
        '#5B8FD4', // drafting blue
        '#FF6B6B'  // soft red
      ],
      ticks: 200,
      gravity: 0.8,
      scalar: 1.2
    });
  }

  /**
   * Fire confetti from multiple cannons
   */
  async fireworks() {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 15, origin: { x: 0.5, y: 0.6 } };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 5;
      
      confettiLib({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confettiLib({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  }
}

export const confetti = new ConfettiEffect();