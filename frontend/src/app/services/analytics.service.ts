import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../environments/environment';

declare const gtag: Function;

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private router = inject(Router);
  private measurementId = environment.gaMeasurementId;
  private initialized = false;

  init(): void {
    if (this.initialized || !this.measurementId || typeof window === 'undefined') {
      return;
    }

    // 1. Dynamically append Google tag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    // 2. Initialize gtag dataLayer
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtagFn(...args: any[]) {
      (window as any).dataLayer.push(arguments);
    }
    (window as any).gtag = (window as any).gtag || gtagFn;

    (window as any).gtag('js', new Date());
    (window as any).gtag('config', this.measurementId, {
      send_page_view: false, // SPA handles page views manually
    });

    this.initialized = true;

    // 3. Track SPA route transitions on NavigationEnd
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.trackPageView(event.urlAfterRedirects);
      });
  }

  trackPageView(url: string, title?: string): void {
    if (!this.initialized || typeof gtag === 'undefined') return;

    gtag('event', 'page_view', {
      page_path: url,
      page_title: title || document.title,
      page_location: window.location.href,
    });
  }

  trackEvent(eventName: string, params?: Record<string, any>): void {
    if (!this.initialized || typeof gtag === 'undefined') return;

    gtag('event', eventName, params);
  }
}
