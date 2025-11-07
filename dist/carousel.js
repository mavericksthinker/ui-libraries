/**
 * Scroll-Based Navigation Carousel
 * Standalone implementation
 * Version: 1.0.0
 */

(function() {
  'use strict';

  // ============================================
  // BASE CAROUSEL CLASS - Shared functionality
  // ============================================
  class BaseCarousel {
    constructor(element) {
      this.carousel = element;
      this.viewport = element.querySelector('.carousel-viewport');
      this.track = element.querySelector('.carousel-track');
      this.slides = Array.from(element.querySelectorAll('.carousel-slide'));
      this.totalSlides = this.slides.length;

      // Common state
      this.currentIndex = 0;
      this.isDragging = false;
      this.startX = 0;
      this.currentX = 0;
      this.startTransform = 0;

      // Base configuration
      this.baseConfig = {
        enableKeyboard: element.dataset.enableKeyboard !== 'false',
        enableTouch: element.dataset.enableTouch !== 'false',
        autoplay: element.dataset.autoplay === 'true',
        autoplayDelay: parseInt(element.dataset.autoplayDelay) || 5000
      };

      this.config = { ...this.baseConfig };
    }

    // Shared event listeners
    setupCommonListeners() {
      // Keyboard navigation
      if (this.config.enableKeyboard) {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
      }

      // Touch/drag navigation
      if (this.config.enableTouch) {
        this.track.addEventListener('mousedown', (e) => this.handleDragStart(e));
        this.track.addEventListener('touchstart', (e) => this.handleDragStart(e), { passive: true });

        document.addEventListener('mousemove', (e) => this.handleDragMove(e));
        document.addEventListener('touchmove', (e) => this.handleDragMove(e), { passive: false });

        document.addEventListener('mouseup', (e) => this.handleDragEnd(e));
        document.addEventListener('touchend', (e) => this.handleDragEnd(e));
      }
    }

    handleKeydown(e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.next();
      }
    }

    handleDragStart(e) {
      this.isDragging = true;
      this.startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
      this.currentX = this.startX;

      const transform = window.getComputedStyle(this.track).transform;
      if (transform !== 'none') {
        const matrix = new DOMMatrix(transform);
        this.startTransform = matrix.m41;
      } else {
        this.startTransform = 0;
      }

      this.track.style.transition = 'none';
      this.track.style.cursor = 'grabbing';
    }

    handleDragMove(e) {
      if (!this.isDragging) return;

      e.preventDefault();
      this.currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
      const deltaX = this.currentX - this.startX;

      this.track.style.transform = `translateX(${this.startTransform + deltaX}px)`;
    }

    handleDragEnd(e) {
      if (!this.isDragging) return;

      this.isDragging = false;
      this.track.style.cursor = 'grab';

      const deltaX = this.currentX - this.startX;
      const threshold = this.viewport.offsetWidth * 0.2;

      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          this.prev();
        } else {
          this.next();
        }
      } else {
        this.updatePosition(true);
      }
    }
  }

  // ============================================
  // SCROLL-BASED CAROUSEL
  // ============================================
  class ScrollBasedCarousel extends BaseCarousel {
    constructor(element) {
      super(element);

      this.navDotsContainer = element.querySelector('.nav-dots');
      this.playPauseBtn = element.querySelector('.play-pause-btn');
      this.prevArrow = element.querySelector('.arrow-prev');
      this.nextArrow = element.querySelector('.arrow-next');

      // Scroll-based specific config
      this.config = {
        ...this.config,
        slideWidth: element.dataset.slideWidth || '30%',
        peekAmount: element.dataset.peekAmount || '10%',
        slideGap: element.dataset.slideGap || '12px',
        slideBackground: element.dataset.slideBackground || 'rgba(30, 30, 30, 0.8)',
        borderRadius: element.dataset.borderRadius || '24px',
        scrollBy: element.dataset.scrollBy || 'viewport'
      };

      this.currentPosition = 0;
      this.totalPositions = 0;
      this.scrollPositions = [];
      this.visibleSlides = 3;
      this.dots = [];
      this.isPlaying = false;
      this.autoplayInterval = null;
      this.autoplayProgressInterval = null;

      this.init();
    }

    init() {
      console.log('🎠 Scroll-Based Carousel initialized', {
        slides: this.totalSlides,
        config: this.config
      });

      this.updateResponsiveConfig();
      this.calculateScrollPositions();
      this.applyStyling();
      this.generateDots();
      this.setupEventListeners();
      this.updatePosition();
      this.updateUI();

      if (this.config.autoplay) {
        this.startAutoplay();
      }

      window.addEventListener('resize', () => {
        this.updateResponsiveConfig();
        this.calculateScrollPositions();
        this.applyStyling();
        this.regenerateDots();
        this.goToPosition(this.currentPosition, false);
      });
    }

    updateResponsiveConfig() {
      const width = window.innerWidth;

      if (width <= 734) {
        this.config.slideWidth = '90%';
        this.visibleSlides = 1;
      } else if (width <= 1068) {
        this.config.slideWidth = '45%';
        this.visibleSlides = 2;
      } else {
        this.config.slideWidth = this.baseConfig.slideWidth || '30%';
        this.visibleSlides = 3;
      }
    }

    calculateScrollPositions() {
      const maxScrollPositions = this.totalSlides - this.visibleSlides + 1;
      this.totalPositions = Math.max(1, maxScrollPositions);
      this.scrollPositions = Array.from({ length: this.totalPositions }, (_, i) => i);
    }

    applyStyling() {
      this.carousel.style.setProperty('--slide-background', this.config.slideBackground);
      this.carousel.style.setProperty('--border-radius', this.config.borderRadius);

      const slideWidth = this.config.slideWidth;
      const gap = this.config.slideGap;

      this.slides.forEach((slide) => {
        slide.style.width = slideWidth;
        slide.style.marginRight = gap;
      });

      const slideWidthPercent = parseFloat(slideWidth);
      const totalVisibleWidth = slideWidthPercent * this.visibleSlides;
      const peekPercent = 10;
      const padding = `calc((100% - ${totalVisibleWidth}% - ${peekPercent}%) / 2)`;

      this.viewport.style.paddingLeft = padding;
      this.viewport.style.paddingRight = padding;
    }

    generateDots() {
      if (!this.navDotsContainer) return;

      this.navDotsContainer.innerHTML = '';
      this.dots = [];

      this.scrollPositions.forEach((position, index) => {
        const dot = document.createElement('button');
        dot.className = 'nav-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        dot.setAttribute('data-position', position);
        dot.setAttribute('aria-label', `Go to position ${position + 1}`);
        dot.setAttribute('tabindex', index === 0 ? '0' : '-1');

        if (index === 0) dot.classList.add('active');

        const pill = document.createElement('span');
        pill.className = 'pill-progress';
        pill.setAttribute('role', 'presentation');
        dot.appendChild(pill);

        this.navDotsContainer.appendChild(dot);
        this.dots.push(dot);
      });
    }

    regenerateDots() {
      this.generateDots();
      this.setupDotListeners();
    }

    setupEventListeners() {
      this.setupCommonListeners();
      this.setupDotListeners();

      if (this.playPauseBtn) {
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
      }

      if (this.prevArrow) {
        this.prevArrow.addEventListener('click', () => this.prev());
      }

      if (this.nextArrow) {
        this.nextArrow.addEventListener('click', () => this.next());
      }
    }

    setupDotListeners() {
      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', () => this.goToPosition(index));
      });
    }

    goToPosition(positionIndex, smooth = true) {
      positionIndex = Math.max(0, Math.min(positionIndex, this.totalPositions - 1));

      if (positionIndex === this.currentPosition && smooth) return;

      this.currentPosition = positionIndex;
      this.updateScrollPosition(smooth);
      this.updateUI();

      if (this.isPlaying) {
        this.stopAutoplay();
        this.startAutoplay();
      }
    }

    updateScrollPosition(smooth = true) {
      const slideWidth = this.slides[0].offsetWidth;
      const gap = parseFloat(this.config.slideGap);
      const offset = this.currentPosition * (slideWidth + gap);

      if (smooth) {
        this.track.style.transition = 'transform 0.7s cubic-bezier(0.4, 0.0, 0.2, 1)';
      } else {
        this.track.style.transition = 'none';
      }

      this.track.style.transform = `translateX(-${offset}px)`;
      this.track.offsetHeight; // Force reflow
    }

    updatePosition(smooth = true) {
      this.updateScrollPosition(smooth);
    }

    updateUI() {
      // Update dots
      this.dots.forEach((dot, index) => {
        const isActive = index === this.currentPosition;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', isActive);
        dot.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      // Update arrow states
      if (this.prevArrow) {
        this.prevArrow.disabled = this.currentPosition === 0;
      }

      if (this.nextArrow) {
        this.nextArrow.disabled = this.currentPosition === this.totalPositions - 1;
      }
    }

    next() {
      this.goToPosition(this.currentPosition + 1);
    }

    prev() {
      this.goToPosition(this.currentPosition - 1);
    }

    startAutoplay() {
      if (this.isPlaying) return;

      this.isPlaying = true;
      this.updatePlayPauseButton();

      const activeDot = this.dots[this.currentPosition];
      if (activeDot) {
        activeDot.classList.add('animating');
        const progressBar = activeDot.querySelector('.pill-progress');
        if (progressBar) {
          progressBar.style.transitionDuration = `${this.config.autoplayDelay}ms`;
          progressBar.style.width = '100%';
        }
      }

      this.autoplayInterval = setTimeout(() => {
        const nextPosition = (this.currentPosition + 1) % this.totalPositions;
        this.goToPosition(nextPosition);

        this.autoplayInterval = null;
        this.startAutoplay();
      }, this.config.autoplayDelay);
    }

    stopAutoplay() {
      if (!this.isPlaying) return;

      this.isPlaying = false;
      this.updatePlayPauseButton();

      if (this.autoplayInterval) {
        clearTimeout(this.autoplayInterval);
        this.autoplayInterval = null;
      }

      this.dots.forEach(dot => {
        dot.classList.remove('animating');
        const progressBar = dot.querySelector('.pill-progress');
        if (progressBar) {
          progressBar.style.width = '0%';
        }
      });
    }

    togglePlayPause() {
      if (this.isPlaying) {
        this.stopAutoplay();
      } else {
        this.startAutoplay();
      }
    }

    updatePlayPauseButton() {
      if (!this.playPauseBtn) return;

      const playIcon = this.playPauseBtn.querySelector('.play-icon');
      const pauseIcon = this.playPauseBtn.querySelector('.pause-icon');

      if (this.isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        this.playPauseBtn.setAttribute('aria-label', 'Pause carousel');
      } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        this.playPauseBtn.setAttribute('aria-label', 'Play carousel');
      }
    }
  }

  // ============================================
  // AUTO-INITIALIZATION
  // ============================================
  function initCarousels() {
    const carousels = document.querySelectorAll('[data-variant="scroll-based"]');

    carousels.forEach(carousel => {
      try {
        new ScrollBasedCarousel(carousel);
      } catch (error) {
        console.error('Failed to initialize carousel:', error);
      }
    });

    console.log(`✅ Initialized ${carousels.length} scroll-based carousel(s)`);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousels);
  } else {
    initCarousels();
  }

})();
