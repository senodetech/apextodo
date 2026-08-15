import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="brand-container" [ngClass]="[layout, size]">
      <!-- SVG Brand Squircle Icon -->
      <div class="logo-icon-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      </div>

      <!-- Typography Block -->
      <div class="brand-text-block" *ngIf="showText">
        <h1 class="brand-title">
          Apex<span class="brand-highlight">Tasks</span>
        </h1>
        <p class="brand-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .brand-container {
      display: flex;
      align-items: center;
      transition: all 0.2s ease;
      user-select: none;
    }

    /* Layout Variations */
    .brand-container.horizontal {
      flex-direction: row;
      gap: 14px;
      text-align: left;
    }

    .brand-container.vertical {
      flex-direction: column;
      gap: 12px;
      text-align: center;
    }

    /* Icon Box with Unified Gradient */
    .logo-icon-box {
      border-radius: 13px;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
      flex-shrink: 0;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .logo-icon-box:hover {
      transform: scale(1.05);
      box-shadow: 0 10px 28px rgba(99, 102, 241, 0.55);
    }

    /* Size Variations */
    .brand-container.sm .logo-icon-box {
      width: 32px;
      height: 32px;
      border-radius: 10px;
    }
    .brand-container.sm .logo-icon-box svg {
      width: 18px;
      height: 18px;
    }
    .brand-container.sm .brand-title {
      font-size: 1.1rem;
    }
    .brand-container.sm .brand-subtitle {
      font-size: 0.72rem;
    }

    .brand-container.md .logo-icon-box {
      width: 42px;
      height: 42px;
      border-radius: 12px;
    }
    .brand-container.md .logo-icon-box svg {
      width: 24px;
      height: 24px;
    }
    .brand-container.md .brand-title {
      font-size: 1.4rem;
    }
    .brand-container.md .brand-subtitle {
      font-size: 0.8rem;
    }

    .brand-container.lg .logo-icon-box {
      width: 54px;
      height: 54px;
      border-radius: 16px;
    }
    .brand-container.lg .logo-icon-box svg {
      width: 30px;
      height: 30px;
    }
    .brand-container.lg .brand-title {
      font-size: 1.95rem;
    }
    .brand-container.lg .brand-subtitle {
      font-size: 0.88rem;
    }

    /* Text Elements */
    .brand-text-block {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-family: var(--font-heading, -apple-system, sans-serif);
      font-weight: 800;
      color: #ffffff;
      margin: 0;
      line-height: 1.1;
      letter-spacing: -0.5px;
    }

    .brand-highlight {
      background: linear-gradient(135deg, #a855f7, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-subtitle {
      margin: 4px 0 0;
      color: var(--text-muted, #94a3b8);
      font-weight: 500;
      line-height: 1.2;
    }
  `]
})
export class BrandLogoComponent {
  @Input() layout: 'horizontal' | 'vertical' = 'horizontal';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() subtitle: string = 'Next-Gen Workspace';
  @Input() showText: boolean = true;
}
