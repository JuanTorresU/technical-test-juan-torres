import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div class="backdrop" (click)="onCancel()">
        <div class="dialog" (click)="$event.stopPropagation()">
          <header class="dialog-header">
            <h3>{{ title() }}</h3>
          </header>
          <div class="dialog-content">
            <p>{{ message() }}</p>
          </div>
          <footer class="dialog-footer">
            <button class="btn btn-secondary" (click)="onCancel()">Cancelar</button>
            <button class="btn btn-primary" (click)="onConfirm()">Confirmar</button>
          </footer>
        </div>
      </div>
    }
  `,
  styles: [`
    .backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease-out;
    }

    .dialog {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      width: 90%;
      max-width: 400px;
      overflow: hidden;
      animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .dialog-header {
      padding: 20px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      background: rgba(255, 255, 255, 0.02);
    }

    .dialog-header h3 {
      margin: 0;
      color: #f8fafc;
      font-size: 1.1rem;
      font-weight: 600;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .dialog-content {
      padding: 24px;
      color: #cbd5e1;
      font-size: 0.95rem;
      line-height: 1.5;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .dialog-content p {
      margin: 0;
    }

    .dialog-footer {
      padding: 16px 24px;
      background: rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .btn {
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      font-family: 'Inter', system-ui, sans-serif;
      transition: all 0.2s;
      border: none;
    }

    .btn-secondary {
      background: transparent;
      color: #94a3b8;
      border: 1px solid rgba(148, 163, 184, 0.2);
    }

    .btn-secondary:hover {
      background: rgba(148, 163, 184, 0.1);
      color: #f8fafc;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
      transform: translateY(-1px);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleUp {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class ConfirmDialogComponent {
  title = input.required<string>();
  message = input.required<string>();
  visible = input<boolean>(false);
  
  confirmed = output<void>();
  cancelled = output<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}
