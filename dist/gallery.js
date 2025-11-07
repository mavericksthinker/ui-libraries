/* ===================================
   DEFAULT GALLERY - MINIMAL JAVASCRIPT
   Version: 1.0.0

   Features included:
   - Basic gallery navigation (prev/next)
   - Thumbnails interaction
   - Manual zoom controls
   - Image counter
   - Animated pills pagination
   - Autoplay with progress animation
   - Swipe gestures
   - Lightbox/modal
   - Image captions
   - Keyboard navigation
   - Lazy loading

   Features NOT included:
   - Multi-slide carousel
   - Hover zoom
   - Video support
   - Continuous/infinite variants
   - Testimonial cards
   =================================== */

(function() {
  'use strict';

  // Configuration
  const config = {
    animationDuration: 300,
    zoom: {
      min: 1,
      max: 2.5,
      step: 0.15,
      wheelSensitivity: 0.001
    },
    performance: {
      touchThrottle: 16,
      wheelThrottle: 16,
      panThrottle: 8
    },
    autoplay: {
      enabled: false,
      interval: 3000,
      pauseOnHover: true,
      loop: true,
      stopOnInteraction: false,
      pauseInLightbox: true
    },
    lightbox: {
      enabled: true
    },
    swipe: {
      enabled: true,
      threshold: 50,
      allowDrag: true
    },
    lazyLoad: {
      enabled: true,
      preloadNext: 2
    }
  };

  // Throttle function for performance
  function throttle(func, delay) {
    let lastCall = 0;
    let timeoutId = null;

    return function(...args) {
      const now = Date.now();
      const timeSinceLastCall = now - lastCall;

      if (timeSinceLastCall >= delay) {
        lastCall = now;
        func.apply(this, args);
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          lastCall = Date.now();
          func.apply(this, args);
        }, delay - timeSinceLastCall);
      }
    };
  }

  // Request animation frame wrapper
  function rafThrottle(func) {
    let rafId = null;
    let lastArgs = null;

    return function(...args) {
      lastArgs = args;

      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          func.apply(this, lastArgs);
          rafId = null;
        });
      }
    };
  }

  // Get gallery elements
  const elements = {
    container: document.querySelector('.gallery-container'),
    wrapper: document.querySelector('.gallery-wrapper'),
    mainContainer: document.querySelector('.gallery-main'),
    thumbnails: document.querySelectorAll('.gallery-thumbnail'),
    thumbnailsContainer: document.querySelector('.gallery-thumbnails'),
    prevButton: document.querySelector('.gallery-main .gallery-nav-button.prev'),
    nextButton: document.querySelector('.gallery-main .gallery-nav-button.next'),
    counterCurrent: document.querySelector('.gallery-main .gallery-counter .current'),
    counterTotal: document.querySelector('.gallery-main .gallery-counter .total'),
    zoomInBtn: document.querySelector('.gallery-main .zoom-in'),
    zoomOutBtn: document.querySelector('.gallery-main .zoom-out'),
    zoomResetBtn: document.querySelector('.gallery-main .zoom-reset'),
    zoomLevel: document.querySelector('.gallery-main .zoom-level'),
    lightbox: document.querySelector('.lightbox'),
    lightboxImage: document.querySelector('.lightbox-image'),
    lightboxContent: document.querySelector('.lightbox-content'),
    lightboxClose: document.querySelector('.lightbox-close'),
    lightboxPrevButton: document.querySelector('.lightbox .gallery-nav-button.prev'),
    lightboxNextButton: document.querySelector('.lightbox .gallery-nav-button.next'),
    lightboxCounterCurrent: document.querySelector('.lightbox .gallery-counter .current'),
    lightboxCounterTotal: document.querySelector('.lightbox .gallery-counter .total'),
    lightboxThumbnails: document.querySelector('.lightbox-thumbnails'),
    lightboxZoomInBtn: document.querySelector('.lightbox .zoom-in'),
    lightboxZoomOutBtn: document.querySelector('.lightbox .zoom-out'),
    lightboxZoomResetBtn: document.querySelector('.lightbox .zoom-reset'),
    lightboxZoomLevel: document.querySelector('.lightbox .zoom-level'),
    pagination: document.querySelector('.gallery-main-content .gallery-pagination'),
    lightboxPagination: document.querySelector('.lightbox .gallery-pagination'),
    autoplayBtn: document.querySelector('.autoplay-btn'),
    autoplayProgressCircle: document.querySelector('.autoplay-progress-ring .progress'),
    caption: document.querySelector('.gallery-main .image-caption'),
    captionTitle: document.querySelector('.gallery-main .caption-title, .gallery-main .image-caption-title'),
    captionDescription: document.querySelector('.gallery-main .caption-description, .gallery-main .image-caption-description'),
    lightboxCaptionTitle: document.querySelector('.lightbox .caption-title, .lightbox .image-caption-title'),
    lightboxCaptionDescription: document.querySelector('.lightbox .caption-description, .lightbox .image-caption-description'),
    swipeIndicatorLeft: document.querySelector('.gallery-main .swipe-indicator.left'),
    swipeIndicatorRight: document.querySelector('.gallery-main .swipe-indicator.right'),
    lightboxSwipeIndicatorLeft: document.querySelector('.lightbox .swipe-indicator.left'),
    lightboxSwipeIndicatorRight: document.querySelector('.lightbox .swipe-indicator.right')
  };

  let currentIndex = 0;
  const allImages = document.querySelectorAll('.gallery-main-image');
  const totalImages = allImages.length;

  // Gallery state
  let isLightboxOpen = false;
  let zoomLevel = 1;
  let isZoomed = false;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  // Lightbox zoom state
  let lightboxZoomLevel = 1;
  let lightboxIsZoomed = false;
  let lightboxPanX = 0;
  let lightboxPanY = 0;
  let lightboxIsDragging = false;
  let lightboxStartX = 0;
  let lightboxStartY = 0;

  // Autoplay state
  let isAutoplayActive = false;
  let autoplayInterval = null;
  let autoplayProgress = 0;
  let wasAutoplayActiveBeforeLightbox = false;
  let autoplayAnimationFrame = null;

  // Swipe state
  let swipeStartX = 0;
  let swipeStartY = 0;
  let swipeCurrentX = 0;
  let swipeCurrentY = 0;
  let isSwiping = false;
  let swipeStartTime = 0;

  // Helper to get the current active image
  function getCurrentImage() {
    return allImages[currentIndex];
  }

  function init() {
    if (totalImages === 0) {
      console.error('No images found in gallery!');
      return;
    }

    // Ensure only the first image is active
    allImages.forEach((img, index) => {
      if (index === 0) {
        img.classList.add('active', 'gallery-visible');
        img.classList.remove('gallery-hidden');
      } else {
        img.classList.remove('active');
        img.classList.add('gallery-hidden');
        img.classList.remove('gallery-visible');
      }
    });

    bindEvents();
    updateCounter();
    updateNavigationButtons();
    preloadImages();
    if (config.lightbox.enabled) {
      initLightboxThumbnails();
    }
    initPagination();
    initSwipeGestures();
    initAutoplayControls();
    updateCaption(currentIndex);
    initLazyLoad();

    // Start autoplay if enabled
    const autoplayAttr = elements.mainContainer?.getAttribute('data-autoplay');
    if (autoplayAttr === 'true' || config.autoplay.enabled) {
      startAutoplay();
    }

    console.log('Gallery initialized with', totalImages, 'images');
  }

  function bindEvents() {
    // Thumbnails
    if (elements.thumbnails) {
      elements.thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', () => goToSlide(index));
        thumbnail.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goToSlide(index);
          }
        });
      });
    }

    // Navigation buttons
    if (elements.prevButton) {
      elements.prevButton.addEventListener('click', (e) => {
        e.stopPropagation();
        goToPrevious();
      });
    }

    if (elements.nextButton) {
      elements.nextButton.addEventListener('click', (e) => {
        e.stopPropagation();
        goToNext();
      });
    }

    // Main container click (opens lightbox)
    if (elements.mainContainer) {
      elements.mainContainer.addEventListener('click', (e) => {
        if (e.target.closest('.zoom-controls') || e.target.closest('.gallery-nav-button')) {
          return;
        }

        const enableZoom = elements.mainContainer.dataset.enableZoom !== 'false';
        const zoomMode = elements.mainContainer.dataset.zoomMode;

        if (config.lightbox.enabled && enableZoom && elements.lightbox && zoomMode !== 'hover' && !isZoomed) {
          openLightbox();
        }
      });
    }

    // Zoom controls
    if (elements.zoomInBtn) {
      elements.zoomInBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        zoomIn();
      });
    }

    if (elements.zoomOutBtn) {
      elements.zoomOutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        zoomOut();
      });
    }

    if (elements.zoomResetBtn) {
      elements.zoomResetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetZoom();
      });
    }

    // Throttled event handlers
    const throttledWheel = throttle(handleWheel, config.performance.wheelThrottle);
    const throttledPanMove = rafThrottle(handlePanMove);

    const wheelHandler = (e) => {
      if (elements.mainContainer.dataset.zoomMode === 'manual') {
        e.preventDefault();
        throttledWheel(e);
      }
    };

    elements.mainContainer.addEventListener('wheel', wheelHandler, { passive: false });
    elements.mainContainer.addEventListener('mousedown', handlePanStart);
    document.addEventListener('mousemove', throttledPanMove);
    document.addEventListener('mouseup', handlePanEnd);

    // Lightbox event bindings
    if (config.lightbox.enabled) {
      if (elements.lightboxClose) {
        elements.lightboxClose.addEventListener('click', closeLightbox);
      }

      if (elements.lightbox) {
        elements.lightbox.addEventListener('click', (e) => {
          if (e.target === elements.lightbox) closeLightbox();
        });
      }

      if (elements.lightboxPrevButton) {
        elements.lightboxPrevButton.addEventListener('click', (e) => {
          e.stopPropagation();
          goToPrevious();
        });
      }

      if (elements.lightboxNextButton) {
        elements.lightboxNextButton.addEventListener('click', (e) => {
          e.stopPropagation();
          goToNext();
        });
      }

      if (elements.lightboxZoomInBtn) {
        elements.lightboxZoomInBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          lightboxZoomIn();
        });
      }

      if (elements.lightboxZoomOutBtn) {
        elements.lightboxZoomOutBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          lightboxZoomOut();
        });
      }

      if (elements.lightboxZoomResetBtn) {
        elements.lightboxZoomResetBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          lightboxResetZoom();
        });
      }

      // Lightbox wheel and pan
      if (elements.lightboxContent) {
        const throttledLightboxWheel = throttle(handleLightboxWheel, config.performance.wheelThrottle);
        const throttledLightboxPanMove = rafThrottle(handleLightboxPanMove);

        const lightboxWheelHandler = (e) => {
          e.preventDefault();
          throttledLightboxWheel(e);
        };

        elements.lightboxContent.addEventListener('wheel', lightboxWheelHandler, { passive: false });
        elements.lightboxContent.addEventListener('mousedown', handleLightboxPanStart);
        document.addEventListener('mousemove', throttledLightboxPanMove);
        document.addEventListener('mouseup', handleLightboxPanEnd);
      }
    }

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboard);
  }

  function handleKeyboard(e) {
    if (e.target.matches('input, textarea')) return;

    switch(e.key) {
      case 'Escape':
        if (isLightboxOpen && config.lightbox.enabled && elements.lightbox) {
          lightboxIsZoomed ? lightboxResetZoom() : closeLightbox();
        } else if (isZoomed) {
          resetZoom();
        }
        e.preventDefault();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        goToPrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        goToNext();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(totalImages - 1);
        break;
    }
  }

  // Zoom functions
  function zoomIn() {
    if (elements.mainContainer.dataset.zoomMode !== 'manual') return;
    zoomLevel = Math.min(zoomLevel + config.zoom.step, config.zoom.max);
    applyZoom();
  }

  function zoomOut() {
    if (elements.mainContainer.dataset.zoomMode !== 'manual') return;
    zoomLevel = Math.max(zoomLevel - config.zoom.step, config.zoom.min);
    applyZoom();
  }

  function resetZoom() {
    zoomLevel = 1;
    panX = 0;
    panY = 0;
    applyZoom();
  }

  function applyZoom() {
    isZoomed = zoomLevel > 1;
    elements.mainContainer.classList.toggle('zoomed', isZoomed);

    const currentImg = getCurrentImage();
    if (currentImg) {
      currentImg.style.transform = `translate(-50%, -50%) translate(${panX}px, ${panY}px) scale(${zoomLevel}) translateZ(0)`;
    }

    if (elements.zoomLevel) {
      elements.zoomLevel.textContent = Math.round(zoomLevel * 100) + '%';
    }

    if (elements.zoomOutBtn) {
      elements.zoomOutBtn.disabled = zoomLevel <= config.zoom.min;
    }
    if (elements.zoomInBtn) {
      elements.zoomInBtn.disabled = zoomLevel >= config.zoom.max;
    }
  }

  function handleWheel(e) {
    if (elements.mainContainer.dataset.zoomMode !== 'manual') return;
    const delta = -e.deltaY * config.zoom.wheelSensitivity;
    zoomLevel = Math.max(config.zoom.min, Math.min(config.zoom.max, zoomLevel + delta));
    applyZoom();
  }

  function handlePanStart(e) {
    if (!isZoomed || elements.mainContainer.dataset.zoomMode !== 'manual') return;
    isDragging = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
  }

  function handlePanMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    applyZoom();
  }

  function handlePanEnd() {
    isDragging = false;
  }

  // Lightbox zoom functions
  function lightboxZoomIn() {
    lightboxZoomLevel = Math.min(lightboxZoomLevel + config.zoom.step, config.zoom.max);
    applyLightboxZoom();
  }

  function lightboxZoomOut() {
    lightboxZoomLevel = Math.max(lightboxZoomLevel - config.zoom.step, config.zoom.min);
    applyLightboxZoom();
  }

  function lightboxResetZoom() {
    lightboxZoomLevel = 1;
    lightboxPanX = 0;
    lightboxPanY = 0;
    applyLightboxZoom();
  }

  function applyLightboxZoom() {
    lightboxIsZoomed = lightboxZoomLevel > 1;
    elements.lightboxContent.classList.toggle('zoomed', lightboxIsZoomed);
    elements.lightboxImage.style.transform = `translate(${lightboxPanX}px, ${lightboxPanY}px) scale(${lightboxZoomLevel})`;
    elements.lightboxImage.style.transformOrigin = 'center center';
    elements.lightboxZoomLevel.textContent = Math.round(lightboxZoomLevel * 100) + '%';

    elements.lightboxZoomOutBtn.disabled = lightboxZoomLevel <= config.zoom.min;
    elements.lightboxZoomInBtn.disabled = lightboxZoomLevel >= config.zoom.max;
  }

  function handleLightboxWheel(e) {
    const delta = -e.deltaY * config.zoom.wheelSensitivity;
    lightboxZoomLevel = Math.max(config.zoom.min, Math.min(config.zoom.max, lightboxZoomLevel + delta));
    applyLightboxZoom();
  }

  function handleLightboxPanStart(e) {
    if (!lightboxIsZoomed) return;
    lightboxIsDragging = true;
    lightboxStartX = e.clientX - lightboxPanX;
    lightboxStartY = e.clientY - lightboxPanY;
  }

  function handleLightboxPanMove(e) {
    if (!lightboxIsDragging) return;
    e.preventDefault();
    lightboxPanX = e.clientX - lightboxStartX;
    lightboxPanY = e.clientY - lightboxStartY;
    applyLightboxZoom();
  }

  function handleLightboxPanEnd() {
    lightboxIsDragging = false;
  }

  // Navigation functions
  function goToPrevious() {
    if (currentIndex > 0) goToSlide(currentIndex - 1);
  }

  function goToNext() {
    if (currentIndex < totalImages - 1) goToSlide(currentIndex + 1);
  }

  function goToSlide(index, isAutoNavigation = false) {
    if (index === currentIndex || index < 0 || index >= totalImages) return;

    resetZoom();
    lightboxResetZoom();

    // Update thumbnails
    if (elements.thumbnails && elements.thumbnails.length > 0) {
      if (elements.thumbnails[currentIndex]) {
        elements.thumbnails[currentIndex].classList.remove('active');
      }
      if (elements.thumbnails[index]) {
        elements.thumbnails[index].classList.add('active');
      }
    }

    updateMainImage(index);

    if (isLightboxOpen) updateLightboxImage(index);

    scrollThumbnailIntoView(index);

    currentIndex = index;
    updateCounter();
    updateNavigationButtons();
    updateLightboxThumbnails();
    updatePagination();
    updateCaption(index);
    lazyLoadImages(index);

    // Handle autoplay
    if (isAutoplayActive && !isAutoNavigation) {
      if (config.autoplay.stopOnInteraction) {
        stopAutoplay();
      } else {
        pauseAutoplay();
        autoplayProgress = 0;
        updateAutoplayProgressRing();
        resumeAutoplay();
      }
    }
  }

  function updateMainImage(index) {
    elements.mainContainer.classList.add('loading');

    // Hide all images
    allImages.forEach((img, i) => {
      img.classList.remove('active');
      img.classList.add('gallery-hidden');
      img.classList.remove('gallery-visible');
      if (i !== index) {
        img.style.transform = 'translate(-50%, -50%) translateZ(0)';
      }
    });

    // Show the selected image
    setTimeout(() => {
      if (allImages[index]) {
        allImages[index].classList.add('active');
        allImages[index].classList.add('gallery-visible');
        allImages[index].classList.remove('gallery-hidden');
      }
      elements.mainContainer.classList.remove('loading');
    }, 200);
  }

  function scrollThumbnailIntoView(index) {
    if (!elements.thumbnails || !elements.thumbnails[index] || !elements.thumbnailsContainer) return;

    const thumbnail = elements.thumbnails[index];
    const container = elements.thumbnailsContainer;
    const isVertical = elements.wrapper.dataset.thumbnailPosition === 'left' ||
                      elements.wrapper.dataset.thumbnailPosition === 'right';

    if (isVertical) {
      const thumbnailTop = thumbnail.offsetTop;
      const thumbnailBottom = thumbnailTop + thumbnail.offsetHeight;
      const scrollTop = container.scrollTop;
      const scrollBottom = scrollTop + container.clientHeight;

      if (thumbnailTop < scrollTop) {
        container.scrollTop = thumbnailTop - 20;
      } else if (thumbnailBottom > scrollBottom) {
        container.scrollTop = thumbnailBottom - container.clientHeight + 20;
      }
    } else {
      const thumbnailLeft = thumbnail.offsetLeft;
      const thumbnailRight = thumbnailLeft + thumbnail.offsetWidth;
      const scrollLeft = container.scrollLeft;
      const scrollRight = scrollLeft + container.clientWidth;

      if (thumbnailLeft < scrollLeft) {
        container.scrollLeft = thumbnailLeft - 20;
      } else if (thumbnailRight > scrollRight) {
        container.scrollLeft = thumbnailRight - container.clientWidth + 20;
      }
    }
  }

  function updateCounter() {
    if (elements.counterCurrent) {
      elements.counterCurrent.textContent = currentIndex + 1;
    }
    if (elements.counterTotal) {
      elements.counterTotal.textContent = totalImages;
    }

    if (isLightboxOpen && config.lightbox.enabled) {
      if (elements.lightboxCounterCurrent) {
        elements.lightboxCounterCurrent.textContent = currentIndex + 1;
      }
      if (elements.lightboxCounterTotal) {
        elements.lightboxCounterTotal.textContent = totalImages;
      }
    }
  }

  function updateNavigationButtons() {
    if (elements.prevButton) {
      elements.prevButton.disabled = currentIndex === 0;
    }
    if (elements.nextButton) {
      elements.nextButton.disabled = currentIndex === totalImages - 1;
    }

    if (isLightboxOpen && config.lightbox.enabled) {
      if (elements.lightboxPrevButton) {
        elements.lightboxPrevButton.disabled = currentIndex === 0;
      }
      if (elements.lightboxNextButton) {
        elements.lightboxNextButton.disabled = currentIndex === totalImages - 1;
      }
    }
  }

  // Lightbox functions
  function openLightbox() {
    if (!config.lightbox.enabled || !elements.lightbox) return;

    if (config.autoplay.pauseInLightbox) {
      wasAutoplayActiveBeforeLightbox = isAutoplayActive;
      if (isAutoplayActive) {
        stopAutoplay();
      }
    }

    isLightboxOpen = true;
    elements.lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    updateLightboxImage(currentIndex);
    updateCounter();
    updateNavigationButtons();
    lightboxResetZoom();
  }

  function closeLightbox() {
    if (!config.lightbox.enabled || !elements.lightbox) return;

    isLightboxOpen = false;
    elements.lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxResetZoom();

    if (config.autoplay.pauseInLightbox && wasAutoplayActiveBeforeLightbox) {
      startAutoplay();
      wasAutoplayActiveBeforeLightbox = false;
    }
  }

  function updateLightboxImage(index) {
    if (!config.lightbox.enabled || !elements.lightboxImage || !allImages[index]) return;

    elements.lightboxImage.style.opacity = '0';

    const imgElement = allImages[index];
    const imgSrc = imgElement.src || imgElement.dataset.lazySrc;

    if (!imgSrc) return;

    const img = new Image();
    img.src = imgSrc;

    img.onload = () => {
      setTimeout(() => {
        elements.lightboxImage.src = imgSrc;
        elements.lightboxImage.alt = imgElement.alt || `Image ${index + 1}`;
        elements.lightboxImage.style.opacity = '1';
      }, 200);
    };
  }

  function initLightboxThumbnails() {
    if (!config.lightbox.enabled || !elements.lightboxThumbnails) return;

    elements.lightboxThumbnails.innerHTML = '';

    allImages.forEach((imgElement, index) => {
      const thumb = document.createElement('div');
      thumb.className = 'lightbox-thumbnail';
      if (index === 0) thumb.classList.add('active');

      const img = document.createElement('img');
      img.src = imgElement.src || imgElement.dataset.lazySrc;
      img.alt = imgElement.alt || `Image ${index + 1}`;

      thumb.appendChild(img);
      thumb.addEventListener('click', () => goToSlide(index));

      elements.lightboxThumbnails.appendChild(thumb);
    });
  }

  function updateLightboxThumbnails() {
    if (!config.lightbox.enabled || !isLightboxOpen || !elements.lightboxThumbnails) return;

    const lightboxThumbs = elements.lightboxThumbnails.querySelectorAll('.lightbox-thumbnail');
    lightboxThumbs.forEach((thumb, index) => {
      thumb.classList.toggle('active', index === currentIndex);
    });
  }

  function preloadImages() {
    allImages.forEach(imgElement => {
      if (imgElement.dataset.lazySrc && !imgElement.src) {
        const img = new Image();
        img.src = imgElement.dataset.lazySrc;
      }
    });
  }

  // Swipe gestures
  function initSwipeGestures() {
    if (!elements.mainContainer) return;

    elements.mainContainer.addEventListener('touchstart', handleSwipeStart, { passive: true });
    elements.mainContainer.addEventListener('touchmove', handleSwipeMove, { passive: false });
    elements.mainContainer.addEventListener('touchend', handleSwipeEnd, { passive: true });

    if (config.swipe.allowDrag) {
      elements.mainContainer.addEventListener('mousedown', handleSwipeStart);
      document.addEventListener('mousemove', handleSwipeMove);
      document.addEventListener('mouseup', handleSwipeEnd);
    }

    if (elements.lightboxContent) {
      elements.lightboxContent.addEventListener('touchstart', handleSwipeStart, { passive: true });
      elements.lightboxContent.addEventListener('touchmove', handleSwipeMove, { passive: false });
      elements.lightboxContent.addEventListener('touchend', handleSwipeEnd, { passive: true });

      if (config.swipe.allowDrag) {
        elements.lightboxContent.addEventListener('mousedown', handleSwipeStart);
      }
    }
  }

  function handleSwipeStart(e) {
    const enabledAttr = elements.mainContainer.getAttribute('data-enable-swipe');
    if (enabledAttr === 'false' || isZoomed || (isLightboxOpen && lightboxIsZoomed)) return;

    const point = e.touches ? e.touches[0] : e;
    swipeStartX = point.clientX;
    swipeStartY = point.clientY;
    swipeCurrentX = point.clientX;
    swipeCurrentY = point.clientY;
    swipeStartTime = Date.now();
    isSwiping = false;
  }

  function handleSwipeMove(e) {
    const enabledAttr = elements.mainContainer.getAttribute('data-enable-swipe');
    if (enabledAttr === 'false' || !swipeStartX || isZoomed || (isLightboxOpen && lightboxIsZoomed)) return;

    const point = e.touches ? e.touches[0] : e;
    swipeCurrentX = point.clientX;
    swipeCurrentY = point.clientY;

    const deltaX = swipeCurrentX - swipeStartX;
    const deltaY = swipeCurrentY - swipeStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isSwiping = true;
      if (e.cancelable) e.preventDefault();

      if (deltaX > 20) {
        showSwipeIndicator('left');
      } else if (deltaX < -20) {
        showSwipeIndicator('right');
      }
    }
  }

  function handleSwipeEnd(e) {
    const enabledAttr = elements.mainContainer.getAttribute('data-enable-swipe');
    if (enabledAttr === 'false' || !swipeStartX) return;

    const deltaX = swipeCurrentX - swipeStartX;

    hideSwipeIndicators();

    if (isSwiping && Math.abs(deltaX) > config.swipe.threshold) {
      if (deltaX > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }

    swipeStartX = 0;
    swipeStartY = 0;
    swipeCurrentX = 0;
    swipeCurrentY = 0;
    isSwiping = false;
  }

  function showSwipeIndicator(direction) {
    if (isLightboxOpen) {
      if (direction === 'left' && currentIndex > 0 && elements.lightboxSwipeIndicatorLeft) {
        elements.lightboxSwipeIndicatorLeft.classList.add('visible');
      } else if (direction === 'right' && currentIndex < totalImages - 1 && elements.lightboxSwipeIndicatorRight) {
        elements.lightboxSwipeIndicatorRight.classList.add('visible');
      }
    } else {
      if (direction === 'left' && currentIndex > 0 && elements.swipeIndicatorLeft) {
        elements.swipeIndicatorLeft.classList.add('visible');
      } else if (direction === 'right' && currentIndex < totalImages - 1 && elements.swipeIndicatorRight) {
        elements.swipeIndicatorRight.classList.add('visible');
      }
    }
  }

  function hideSwipeIndicators() {
    if (elements.swipeIndicatorLeft) elements.swipeIndicatorLeft.classList.remove('visible');
    if (elements.swipeIndicatorRight) elements.swipeIndicatorRight.classList.remove('visible');
    if (elements.lightboxSwipeIndicatorLeft) elements.lightboxSwipeIndicatorLeft.classList.remove('visible');
    if (elements.lightboxSwipeIndicatorRight) elements.lightboxSwipeIndicatorRight.classList.remove('visible');
  }

  // Autoplay functions
  function initAutoplayControls() {
    if (elements.autoplayBtn) {
      elements.autoplayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAutoplayState();
      });
    }

    // NOTE: Removed duplicate event listener for .autoplay-toggle buttons
    // These buttons already get event listeners when created in initPagination()
    // Adding them again here causes double-toggle which cancels itself out

    if (config.autoplay.pauseOnHover && elements.mainContainer) {
      elements.mainContainer.addEventListener('mouseenter', () => {
        if (isAutoplayActive) pauseAutoplay();
      });
      elements.mainContainer.addEventListener('mouseleave', () => {
        if (isAutoplayActive) resumeAutoplay();
      });
    }
  }

  function toggleAutoplayState() {
    if (isAutoplayActive) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  }

  function startAutoplay() {
    isAutoplayActive = true;

    if (elements.autoplayBtn) {
      elements.autoplayBtn.classList.add('playing');
      elements.autoplayBtn.textContent = '⏸';
    }

    autoplayProgress = 0;
    updateAutoplayProgress();
    scheduleNextSlide();

    const toggleBtns = document.querySelectorAll('.autoplay-toggle');
    toggleBtns.forEach(btn => {
      btn.setAttribute('data-icon', '⏸');
    });

    if (elements.pagination && elements.pagination.dataset.style === 'animated-pills') {
      elements.pagination.classList.add('autoplay-active');
      if (elements.lightboxPagination) {
        elements.lightboxPagination.classList.add('autoplay-active');
      }
    }
  }

  function stopAutoplay() {
    isAutoplayActive = false;

    if (elements.autoplayBtn) {
      elements.autoplayBtn.classList.remove('playing');
      elements.autoplayBtn.textContent = '▶';
    }

    if (autoplayInterval) {
      clearTimeout(autoplayInterval);
      autoplayInterval = null;
    }
    if (autoplayAnimationFrame) {
      cancelAnimationFrame(autoplayAnimationFrame);
      autoplayAnimationFrame = null;
    }
    autoplayProgress = 0;

    updateAutoplayProgressRing();
    updateAnimatedPillProgress();

    if (elements.container) {
      elements.container.style.removeProperty('--pill-progress');
    }

    const toggleBtns = document.querySelectorAll('.autoplay-toggle');
    toggleBtns.forEach(btn => {
      btn.setAttribute('data-icon', '▶');
    });

    if (elements.pagination && elements.pagination.dataset.style === 'animated-pills') {
      elements.pagination.classList.remove('autoplay-active');
      if (elements.lightboxPagination) {
        elements.lightboxPagination.classList.remove('autoplay-active');
      }
    }
  }

  function pauseAutoplay() {
    if (autoplayInterval) {
      clearTimeout(autoplayInterval);
      autoplayInterval = null;
    }
    if (autoplayAnimationFrame) {
      cancelAnimationFrame(autoplayAnimationFrame);
      autoplayAnimationFrame = null;
    }
  }

  function resumeAutoplay() {
    if (isAutoplayActive) {
      scheduleNextSlide();
    }
  }

  function scheduleNextSlide() {
    autoplayProgress = 0;
    updateAutoplayProgress();

    autoplayInterval = setTimeout(() => {
      const checkProgress = () => {
        if (autoplayProgress >= 99.5) {
          if (currentIndex === totalImages - 1) {
            if (config.autoplay.loop) {
              goToSlide(0, true);
              if (isAutoplayActive) {
                scheduleNextSlide();
              }
            } else {
              stopAutoplay();
            }
          } else {
            goToSlide(currentIndex + 1, true);
            if (isAutoplayActive) {
              scheduleNextSlide();
            }
          }
        } else {
          requestAnimationFrame(checkProgress);
        }
      };
      checkProgress();
    }, config.autoplay.interval);
  }

  function updateAutoplayProgress() {
    const startTime = Date.now();

    function animate() {
      if (!isAutoplayActive || !autoplayInterval) return;

      const elapsed = Date.now() - startTime;
      autoplayProgress = Math.min(100, (elapsed / config.autoplay.interval) * 100);
      updateAutoplayProgressRing();
      updateAnimatedPillProgress();

      if (autoplayProgress < 100) {
        autoplayAnimationFrame = requestAnimationFrame(animate);
      }
    }

    autoplayAnimationFrame = requestAnimationFrame(animate);
  }

  function updateAutoplayProgressRing() {
    if (!elements.autoplayProgressCircle) return;

    const circumference = 2 * Math.PI * 15;
    const offset = circumference - (autoplayProgress / 100) * circumference;
    elements.autoplayProgressCircle.style.strokeDashoffset = offset;
  }

  function updateAnimatedPillProgress() {
    if (!elements.pagination) return;

    const style = elements.pagination.dataset.style;
    if (style === 'animated-pills') {
      elements.container.style.setProperty('--pill-progress', `${autoplayProgress}%`);
    }
  }

  // Caption functions
  function updateCaption(index) {
    if (!allImages[index]) return;

    const imgElement = allImages[index];
    const title = imgElement.dataset.captionTitle || imgElement.alt || '';
    const description = imgElement.dataset.captionDesc || '';

    if (elements.captionTitle) {
      elements.captionTitle.textContent = title;
    }
    if (elements.captionDescription) {
      elements.captionDescription.textContent = description;
    }
    if (elements.lightboxCaptionTitle) {
      elements.lightboxCaptionTitle.textContent = title;
    }
    if (elements.lightboxCaptionDescription) {
      elements.lightboxCaptionDescription.textContent = description;
    }
  }

  // Lazy loading
  function initLazyLoad() {
    if (!config.lazyLoad.enabled) return;
    lazyLoadImages(currentIndex);
  }

  function lazyLoadImages(index) {
    if (!config.lazyLoad.enabled) return;

    preloadImage(index);

    for (let i = 1; i <= config.lazyLoad.preloadNext; i++) {
      const nextIndex = index + i;
      if (nextIndex < totalImages) {
        preloadImage(nextIndex);
      }
    }
  }

  function preloadImage(index) {
    if (!allImages[index]) return;

    const imgElement = allImages[index];
    const url = imgElement.src || imgElement.dataset.lazySrc;

    if (url) {
      const img = new Image();
      img.src = url;
      if (!imgElement.src && imgElement.dataset.lazySrc) {
        imgElement.src = url;
      }
    }
  }

  // Pagination functions
  function initPagination() {
    if (!elements.pagination) return;

    const style = elements.pagination.dataset.style || 'animated-pills';

    elements.pagination.innerHTML = '';

    // Create wrapper for pagination items FIRST
    const paginationWrapper = document.createElement('div');
    paginationWrapper.className = 'pagination-items-wrapper';
    paginationWrapper.setAttribute('data-pagination-bg', 'light');
    elements.pagination.appendChild(paginationWrapper);

    // Create pill items
    for (let i = 0; i < totalImages; i++) {
      const item = document.createElement('div');
      item.className = 'pagination-item';
      if (i === 0) item.classList.add('active');
      item.dataset.index = i;
      item.addEventListener('click', () => goToSlide(i));
      paginationWrapper.appendChild(item);
    }

    // Create autoplay toggle button AFTER pagination items (on the right)
    const showAutoplayToggle = elements.wrapper.getAttribute('data-show-autoplay-toggle') !== 'false';
    if (showAutoplayToggle) {
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'autoplay-toggle';
      toggleBtn.setAttribute('aria-label', 'Toggle autoplay');
      toggleBtn.setAttribute('data-icon', isAutoplayActive ? '⏸' : '▶');
      toggleBtn.setAttribute('data-play-bg', 'light');
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAutoplayState();
        toggleBtn.setAttribute('data-icon', isAutoplayActive ? '⏸' : '▶');
      });
      elements.pagination.appendChild(toggleBtn);
    }

    if (isAutoplayActive) {
      elements.pagination.classList.add('autoplay-active');
    }

    // Initialize lightbox pagination
    if (elements.lightboxPagination) {
      elements.lightboxPagination.innerHTML = '';

      const lightboxWrapper = document.createElement('div');
      lightboxWrapper.className = 'pagination-items-wrapper';
      lightboxWrapper.setAttribute('data-pagination-bg', 'light');
      elements.lightboxPagination.appendChild(lightboxWrapper);

      allImages.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'pagination-item';
        if (index === 0) item.classList.add('active');
        item.dataset.index = index;
        item.addEventListener('click', () => goToSlide(index));
        lightboxWrapper.appendChild(item);
      });

      if (showAutoplayToggle) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'autoplay-toggle';
        toggleBtn.setAttribute('aria-label', 'Toggle autoplay');
        toggleBtn.setAttribute('data-icon', isAutoplayActive ? '⏸' : '▶');
        toggleBtn.setAttribute('data-play-bg', 'light');
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleAutoplayState();
          toggleBtn.setAttribute('data-icon', isAutoplayActive ? '⏸' : '▶');
        });
        elements.lightboxPagination.appendChild(toggleBtn);
      }

      if (isAutoplayActive) {
        elements.lightboxPagination.classList.add('autoplay-active');
      }
    }
  }

  function updatePagination() {
    if (!elements.pagination) return;

    const style = elements.pagination.dataset.style;

    if (isAutoplayActive) {
      elements.container.style.setProperty('--pill-progress', '0%');
    } else {
      elements.container.style.removeProperty('--pill-progress');
    }

    const items = elements.pagination.querySelectorAll('.pagination-item');
    items.forEach((item, index) => {
      item.classList.toggle('active', index === currentIndex);
    });

    if (config.lightbox.enabled && elements.lightboxPagination && isLightboxOpen) {
      const lightboxItems = elements.lightboxPagination.querySelectorAll('.pagination-item');
      lightboxItems.forEach((item, index) => {
        item.classList.toggle('active', index === currentIndex);
      });
    }
  }

  // Initialize gallery
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
