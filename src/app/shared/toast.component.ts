import { Component, ChangeDetectionStrategy, model, input, OnDestroy, effect } from '@angular/core';


@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div 
        class="toast-container" 
        [class]="type()"
      >
        <div class="toast-indicator"></div>
        <div class="toast-content">
          <p class="toast-message">{{ message() }}</p>
        </div>
        <button class="toast-close" (click)="closeToast()">×</button>
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
      background: rgba(26, 28, 35, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      color: #fff;
      min-width: 280px;
      max-width: 400px;
      animation: slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      overflow: hidden;
    }

    /* Types */
    .success {
      border-left: 4px solid #10b981;
    }
    .success .toast-indicator {
      background: #10b981;
      height: 100%;
      width: 4px;
      position: absolute;
      left: 0;
    }

    .error {
      border-left: 4px solid #ef4444;
    }
    .error .toast-indicator {
      background: #ef4444;
      height: 100%;
      width: 4px;
      position: absolute;
      left: 0;
    }

    .info {
      border-left: 4px solid #3b82f6;
    }
    .info .toast-indicator {
      background: #3b82f6;
      height: 100%;
      width: 4px;
      position: absolute;
      left: 0;
    }

    .toast-content {
      flex: 1;
      margin-left: 16px;
    }

    .toast-message {
      margin: 0;
      font-size: 0.9rem;
      font-family: 'Inter', system-ui, sans-serif;
      font-weight: 500;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      transition: color 0.2s;
    }

    .toast-close:hover {
      color: white;
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
