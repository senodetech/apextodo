import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AnalyticsService } from './services/analytics.service';
import { ToastContainerComponent } from './components/shared/toast-container/toast-container.component';
import { GlobalLoaderComponent } from './components/shared/global-loader/global-loader.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, GlobalLoaderComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast-container></app-toast-container>
    <app-global-loader></app-global-loader>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  private analytics = inject(AnalyticsService);
  private http = inject(HttpClient);

  ngOnInit(): void {
    this.analytics.init();

    // Silent background warm-up ping to pre-warm free-tier backend
    this.http.get(`${environment.apiUrl}/tasks/stats`, {
      headers: { 'x-silent-ping': 'true' }
    }).subscribe({
      error: () => {} // ignore error if unauthenticated or waking up
    });
  }
}

