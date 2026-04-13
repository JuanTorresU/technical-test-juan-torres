import { Component, ChangeDetectionStrategy, input, output, model } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div class="modal-backdrop" (click)="onCancel()">
        <div class="modal-content" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" tabindex="-1">
          <div class="modal-header">
            <div>
              <h3>{{ title() }}</h3>
            </div>
            <button class="close-btn" (click)="onCancel()" aria-label="Cerrar">
              <span aria-hidden="true" style="font-size: 1.25rem;">&times;</span>
            </button>
          </div>
          <div class="modal-body" style="padding: 16px 24px 24px;">
            <p style="margin: 0; color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5;">{{ message() }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-cancel" (click)="onCancel()">{{ cancelText() }}</button>
            <button class="btn btn-submit" style="background-color: var(--danger);" (click)="onConfirm()">{{ confirmText() }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .btn-submit:hover {
      background-color: #d32f2f !important;
      box-shadow: 0 2px 12px rgba(244, 67, 54, 0.3) !important;
    }
  `]
})
/** Diálogo modal de confirmación reutilizable con título, mensaje y acciones confirmar/cancelar */
export class ConfirmDialogComponent {
  title = input.required<string>();
  message = input.required<string>();
  confirmText = input<string>('Confirmar');
  cancelText = input<string>('Cancelar');
  visible = model<boolean>(false);
  
  confirmed = output<void>();
  cancelled = output<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}
