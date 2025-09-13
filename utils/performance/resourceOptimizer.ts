/**
 * Resource Optimization for Portfolio Site
 * Implements intelligent preloading, prefetching, and resource optimization
 */

interface ResourceConfig {
  priority: 'high' | 'medium' | 'low';
  type: 'preload' | 'prefetch' | 'dns-prefetch' | 'preconnect';
  as?: string;
  crossorigin?: boolean;
}

class ResourceOptimizer {
  private preloadedResources = new Set<string>();
  private prefetchedResources = new Set<string>();
  private connectionEstablished = new Set<string>();

  /**
   * Preload critical resources
   */
  preloadResource(url: string, config: ResourceConfig) {
    if (this.preloadedResources.has(url)) return;

    const link = document.createElement('link');
    link.rel = config.type;
    link.href = url;

    if (config.as) {
      link.setAttribute('as', config.as);
    }
    if (config.crossorigin) {
      link.setAttribute('crossorigin', '');
    }

    document.head.appendChild(link);
    this.preloadedResources.add(url);
  }

  /**
   * Prefetch non-critical resources
   */
  prefetchResource(url: string) {
    if (this.prefetchedResources.has(url)) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
    this.prefetchedResources.add(url);
  }

  /**
   * Establish connection to external domains
   */
  preconnect(domain: string) {
    if (this.connectionEstablished.has(domain)) return;

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    document.head.appendChild(link);
    this.connectionEstablished.add(domain);
  }

  /**
   * DNS prefetch for external domains
   */
  dnsPrefetch(domain: string) {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  }

  /**
   * Optimize images with intersection observer
   */
  optimizeImages() {
    if (!('IntersectionObserver' in window)) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }

  /**
   * Optimize fonts loading
   */
  optimizeFonts() {
    // Preload critical fonts
    const criticalFonts = ['/fonts/InterVariable.ttf', '/fonts/Nohemi-VF.ttf'];

    criticalFonts.forEach((font) => {
      this.preloadResource(font, {
        priority: 'high',
        type: 'preload',
        as: 'font',
        crossorigin: true,
      });
    });

    // Add font-display: swap for better performance
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter Variable';
        src: url('/fonts/InterVariable.ttf') format('truetype');
        font-display: swap;
      }
      @font-face {
        font-family: 'Nohemi Variable';
        src: url('/fonts/Nohemi-VF.ttf') format('truetype');
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Optimize critical CSS
   */
  optimizeCriticalCSS() {
    // Inline critical CSS for above-the-fold content
    const criticalCSS = `
      :root {
        --semantic-color-background-primary: #ffffff;
        --semantic-color-foreground-primary: #000000;
        --semantic-color-border-primary: #e5e5e5;
        --core-shape-radius-medium: 8px;
      }
      body {
        margin: 0;
        font-family: 'Inter Variable', sans-serif;
        background: var(--semantic-color-background-primary);
        color: var(--semantic-color-foreground-primary);
      }
      .hero {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `;

    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);
  }

  /**
   * Optimize third-party resources
   */
  optimizeThirdPartyResources() {
    // Preconnect to external domains
    const externalDomains = [
      'https://wrgenoqnojvalkscpiib.supabase.co',
      'https://lh3.googleusercontent.com',
      'https://cdn.bsky.app',
      'https://video.bsky.app',
    ];

    externalDomains.forEach((domain) => {
      this.preconnect(domain);
      this.dnsPrefetch(domain);
    });
  }

  /**
   * Optimize navigation
   */
  optimizeNavigation() {
    // Prefetch likely next pages
    const likelyPages = ['/articles', '/blueprints', '/work', '/tools'];

    // Prefetch on idle
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        likelyPages.forEach((page) => {
          this.prefetchResource(page);
        });
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        likelyPages.forEach((page) => {
          this.prefetchResource(page);
        });
      }, 1000);
    }
  }

  /**
   * Initialize all optimizations
   */
  initialize() {
    if (typeof window === 'undefined') return;

    this.optimizeFonts();
    this.optimizeCriticalCSS();
    this.optimizeThirdPartyResources();
    this.optimizeNavigation();
    this.optimizeImages();
  }

  /**
   * Get optimization statistics
   */
  getStats() {
    return {
      preloadedResources: this.preloadedResources.size,
      prefetchedResources: this.prefetchedResources.size,
      establishedConnections: this.connectionEstablished.size,
    };
  }
}

// Export singleton instance
export const resourceOptimizer = new ResourceOptimizer();

// Initialize on DOM ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      resourceOptimizer.initialize();
    });
  } else {
    resourceOptimizer.initialize();
  }
}
