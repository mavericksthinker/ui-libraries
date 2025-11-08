/**
 * =====================================================
 * FLOATING ACTION BUTTON - SCRIPT V2.0
 * =====================================================
 * Apple-style bounce physics with scroll velocity detection
 * Matches iPhone 17 Pro "All Access Pass" animation
 *
 * @author Claude
 * @version 2.0.0
 * @license MIT
 */

(function () {
  'use strict';

  /**
   * Default configuration
   */
  const DEFAULT_CONFIG = {
    threshold: 0.3,
    rootMargin: '0px',
    bounceThreshold: 30, // Scroll delta to trigger bounce
    bounceDebounce: 150, // Time between bounces
    textRevealDelay: 150, // Delay before text appears after icon bounce (ms)
    enableScrollBounce: false, // Disable scroll bounce by default
    enableKeyboard: true,
    enableReducedMotion: true,
    logErrors: false,
  };

  /**
   * FloatingActionButton Class
   */
  class FloatingActionButton {
    constructor(container, options = {}) {
      if (!container || !(container instanceof HTMLElement)) {
        this.logError('Invalid container element');
        return;
      }

      this.container = container;
      this.fab = container.querySelector('.fab');
      this.config = { ...DEFAULT_CONFIG, ...options };

      // Parse data attributes
      this.parseDataAttributes();

      // State
      this.currentState = 'hidden';
      this.isAnimating = false;
      this.lastScrollY = window.scrollY;
      this.lastBounceTime = 0;
      this.observedSections = [];
      this.intersectionStates = new Map();

      // Bound methods for event listeners
      this.handleScroll = this.throttle(this._handleScroll.bind(this), 16); // ~60fps

      // Initialize
      this.init();
    }

    /**
     * Parse data attributes
     */
    parseDataAttributes() {
      const {
        hideOn,
        threshold,
        haloColor,
        position,
        rootMargin,
        bounceThreshold,
      } = this.container.dataset;

      if (hideOn) {
        this.hideSectionIds = hideOn
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean);
      } else {
        this.hideSectionIds = [];
      }

      if (threshold) {
        const parsed = parseFloat(threshold);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.config.threshold = parsed;
        }
      }

      if (haloColor) {
        this.setHaloColor(haloColor);
      }

      if (position) {
        this.position = position;
      }

      if (rootMargin) {
        this.config.rootMargin = rootMargin;
      }

      if (bounceThreshold) {
        const parsed = parseInt(bounceThreshold, 10);
        if (!isNaN(parsed) && parsed > 0) {
          this.config.bounceThreshold = parsed;
        }
      }
    }

    /**
     * Set custom halo color
     */
    setHaloColor(color) {
      this.container.style.setProperty('--fab-halo-color', color);
    }

    /**
     * Initialize
     */
    init() {
      // Check if this is a pill button (always expanded, no bounce)
      this.isPillButton = this.container.classList.contains('fab-pill');

      // If no data-hide-on attribute, show button immediately
      if (this.hideSectionIds.length === 0) {
        console.log('[FAB] No data-hide-on specified - button will always be visible');
        this.showImmediately();
        return;
      }

      this.findSections();

      // If no valid sections found, show button immediately
      if (this.observedSections.length === 0) {
        console.log('[FAB] No valid sections found - button will always be visible');
        this.showImmediately();
        return;
      }

      // Valid sections exist - use hide/show logic
      this.setupObserver();

      // Setup scroll bounce if enabled (disabled by default)
      if (this.config.enableScrollBounce && !this.isPillButton) {
        this.setupScrollListener();
      }

      if (this.config.enableKeyboard) {
        this.setupKeyboard();
      }

      if (this.config.enableReducedMotion) {
        this.setupReducedMotion();
      }

      // Set initial state
      this.setState('hidden');
    }

    /**
     * Show button immediately (for always-visible mode)
     */
    showImmediately() {
      if (this.config.enableKeyboard) {
        this.setupKeyboard();
      }

      if (this.config.enableReducedMotion) {
        this.setupReducedMotion();
      }

      // Show immediately with bounce animation
      this.setState('icon-visible');
    }

    /**
     * Find sections to observe
     */
    findSections() {
      this.hideSectionIds.forEach((id) => {
        const section = document.getElementById(id);
        if (section) {
          this.observedSections.push(section);
          this.intersectionStates.set(id, false);
        } else {
          this.logError(`Section with ID "${id}" not found`);
        }
      });
    }

    /**
     * Setup IntersectionObserver
     */
    setupObserver() {
      const observerOptions = {
        root: null,
        rootMargin: this.config.rootMargin,
        threshold: this.config.threshold,
      };

      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        observerOptions
      );

      this.observedSections.forEach((section) => {
        this.observer.observe(section);
      });
    }

    /**
     * Setup scroll listener for bounce effect
     */
    setupScrollListener() {
      window.addEventListener('scroll', this.handleScroll, { passive: true });
    }

    /**
     * Handle scroll for bounce effect
     */
    _handleScroll() {
      // Only bounce when fully visible (text expanded)
      if (this.currentState !== 'fully-visible') {
        this.lastScrollY = window.scrollY;
        return;
      }

      const currentScrollY = window.scrollY;
      const scrollDelta = Math.abs(currentScrollY - this.lastScrollY);

      // Check if scroll delta exceeds threshold
      if (scrollDelta > this.config.bounceThreshold) {
        const now = Date.now();
        const timeSinceLastBounce = now - this.lastBounceTime;

        // Debounce bounces
        if (timeSinceLastBounce > this.config.bounceDebounce) {
          this.triggerBounce();
          this.lastBounceTime = now;
        }
      }

      this.lastScrollY = currentScrollY;
    }

    /**
     * Trigger bounce animation
     */
    triggerBounce() {
      this.container.setAttribute('data-bouncing', 'true');

      // Remove bounce state after animation
      setTimeout(() => {
        this.container.setAttribute('data-bouncing', 'false');
      }, parseFloat(getComputedStyle(this.container).getPropertyValue('--fab-bounce-duration') || '0.5') * 1000);
    }

    /**
     * Handle intersection changes
     */
    handleIntersection(entries) {
      entries.forEach((entry) => {
        const sectionId = entry.target.id;
        this.intersectionStates.set(sectionId, entry.isIntersecting);
      });

      const shouldHide = Array.from(this.intersectionStates.values()).some(
        (isIntersecting) => isIntersecting
      );

      if (shouldHide && this.currentState !== 'hidden') {
        this.hide();
      } else if (!shouldHide && this.currentState !== 'icon-visible' && this.currentState !== 'fully-visible') {
        this.show();
      }
    }

    /**
     * Set state with proper transitions (3-stage: hidden → icon-visible → fully-visible)
     */
    setState(newState, immediate = false) {
      if (this.currentState === newState && !immediate) {
        return;
      }

      const oldState = this.currentState;
      this.currentState = newState;
      this.container.setAttribute('data-state', newState);

      // Update ARIA
      if (newState === 'hidden') {
        this.container.setAttribute('aria-hidden', 'true');
        this.removeFocusable();
      } else if (newState === 'fully-visible') {
        this.container.setAttribute('aria-hidden', 'false');
        this.restoreFocusable();
      }

      // Handle 3-stage state transitions
      if (newState === 'icon-visible') {
        // Stage 2: Icon bounces in
        this.isAnimating = true;
        const bounceDuration = parseFloat(getComputedStyle(this.container).getPropertyValue('--fab-appear-duration') || '0.7') * 1000;

        // After bounce animation completes, transition to fully-visible (text appears)
        setTimeout(() => {
          this.setState('fully-visible');
          this.isAnimating = false;
        }, bounceDuration + this.config.textRevealDelay);
      }
    }

    /**
     * Show the FAB (3-stage: hidden → icon-visible → fully-visible)
     * Pill buttons skip bounce and go directly to fully-visible
     */
    show() {
      if (this.isAnimating) return;

      if (this.isPillButton) {
        // Pill buttons: no bounce, directly to fully-visible
        this.setState('fully-visible');
      } else {
        // Regular buttons: start with icon-visible (which will auto-transition to fully-visible)
        this.setState('icon-visible');
      }
    }

    /**
     * Hide the FAB
     */
    hide() {
      if (this.isAnimating) return;
      this.setState('hidden');
    }

    /**
     * Remove from tab order
     */
    removeFocusable() {
      const focusable = this.container.querySelector('button, a, [tabindex]');
      if (focusable) {
        this._originalTabIndex = focusable.getAttribute('tabindex') || '0';
        focusable.setAttribute('tabindex', '-1');
      }
    }

    /**
     * Restore to tab order
     */
    restoreFocusable() {
      const focusable = this.container.querySelector('button, a, [tabindex="-1"]');
      if (focusable) {
        focusable.setAttribute('tabindex', this._originalTabIndex || '0');
      }
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboard() {
      const button = this.container.querySelector('.fab__button, .fab__link');

      if (button) {
        button.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            button.blur();
          }
        });
      }
    }

    /**
     * Setup reduced motion support
     */
    setupReducedMotion() {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

      const handleReducedMotion = (e) => {
        if (e.matches) {
          this.container.style.setProperty('--fab-appear-duration', '0.2s');
          this.container.style.setProperty('--fab-expand-duration', '0.2s');
          this.container.style.setProperty('--fab-bounce-duration', '0.1s');
        } else {
          this.container.style.removeProperty('--fab-appear-duration');
          this.container.style.removeProperty('--fab-expand-duration');
          this.container.style.removeProperty('--fab-bounce-duration');
        }
      };

      handleReducedMotion(mediaQuery);

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleReducedMotion);
      } else {
        mediaQuery.addListener(handleReducedMotion);
      }
    }

    /**
     * Throttle function
     */
    throttle(func, delay) {
      let lastCall = 0;
      return (...args) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          func.apply(this, args);
        }
      };
    }

    /**
     * Log errors
     */
    logError(message) {
      if (this.config.logErrors) {
        console.error(`[FloatingActionButton] ${message}`);
      }
    }

    /**
     * Destroy instance
     */
    destroy() {
      if (this.observer) {
        this.observer.disconnect();
      }

      window.removeEventListener('scroll', this.handleScroll);

      this.observedSections = [];
      this.intersectionStates.clear();
    }

    /**
     * Update sections dynamically
     */
    updateSections(sectionIds) {
      if (this.observer) {
        this.observer.disconnect();
      }

      this.hideSectionIds = sectionIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

      this.observedSections = [];
      this.intersectionStates.clear();

      this.findSections();
      this.setupObserver();
    }
  }

  /**
   * Auto-initialize all FAB containers
   */
  function autoInit() {
    const containers = document.querySelectorAll('.fab-container');

    containers.forEach((container) => {
      if (container.hasAttribute('data-fab-initialized')) {
        return;
      }

      const instance = new FloatingActionButton(container);
      container.__fabInstance = instance;
      container.setAttribute('data-fab-initialized', 'true');
    });
  }

  /**
   * Public API
   */
  window.FloatingActionButton = FloatingActionButton;

  /**
   * Auto-initialize on DOM ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  window.addEventListener('load', autoInit);

  /**
   * Add screen-reader only styles
   */
  if (!document.getElementById('fab-sr-styles')) {
    const style = document.createElement('style');
    style.id = 'fab-sr-styles';
    style.textContent = `
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
    `;
    document.head.appendChild(style);
  }
})();
