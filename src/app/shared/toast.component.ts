import { Component, ChangeDetectionStrategy, model, input, OnDestroy, effect } from '@angular/core';
import { IconComponent } from './icon.component';


@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @if (visible()) {
      <div 
        class="toast-container" 
        [class]="type()"
      >
        <div class="toast-indicator"></div>
        <span class="toast-type-icon">
          @switch (type()) {
            @case ('success') { <app-icon name="check-circle" [size]="20" /> }
            @case ('error') { <app-icon name="x-circle" [size]="20" /> }
            @default { <app-icon name="info" [size]="20" /> }
          }
        </span>
        <div class="toast-content">
          <p class="toast-message">{{ message() }}</p>
        </div>
        <button class="toast-close" (click)="closeToast()"><app-icon name="x" [size]="16" /></button>
      </div>
    }
  `,
  styles: [`
    :host {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 9999;
    }
    .toast-container {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px 12px 0;
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      color: rgba(0, 0, 0, 0.87);
      min-width: 280px;
      max-width: 400px;
      animation: slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      overflow: hidden;
    }

    .toast-type-icon {
      display: flex;
      align-items: center;
      margin-left: 16px;
      flex-shrink: 0;
    }
    .success .toast-type-icon { color: #46a35e; }
    .error .toast-type-icon { color: #f44336; }
    .info .toast-type-icon { color: #3f51b5; }

    .success { border-left: 4px solid #46a35e; }
    .error { border-left: 4px solid #f44336; }
    .info { border-left: 4px solid #3f51b5; }

    .toast-indicator { display: none; }

    .toast-content { flex: 1; }

    .toast-message {
      margin: 0;
      font-size: 0.9rem;
      font-family: 'DM Sans', system-ui, sans-serif;
      font-weight: 500;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      color: rgba(0, 0, 0, 0.38);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      transition: color 0.2s;
    }

    .toast-close:hover {
      color: rgba(0, 0, 0, 0.87);
    }

    @keyframes slideIn {
      0% {
        transform: translateX(100%) scale(0.9);
        opacity: 0;
      }
      100% {
        transform: translateX(0) scale(1);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent implements OnDestroy {
  message = input.required<string>();
  type = input<'success' | 'error' | 'info'>('info');
  visible = model<boolean>(false);
  
  private timeoutId: any;

  constructor() {
    effect(() => {
      const isVisible = this.visible();
      // Las mutaciones se disparan desde un macrotask asincrono, evitando ciclos
      // restrictivos de Angular en "allowSignalWrites"
      if (isVisible) {
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
        }
        
        // Auto-hide after 3.5 seconds
        this.timeoutId = setTimeout(() => {
          this.closeToast();
        }, 3500);
      }
    }); // No allowSignalWrites: true flag required anymore
  }

  closeToast() {
    this.visible.set(false);
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
