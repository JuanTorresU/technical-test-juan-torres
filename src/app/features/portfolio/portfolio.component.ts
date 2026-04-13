import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { InvestmentStore } from '../../state/investment.store';
import { ActiveSubscription } from '../../core/models/fund.model';
import { CurrencyCopPipe } from '../../shared/currency-cop.pipe';
import { ToastComponent } from '../../shared/toast.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-portfolio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, CurrencyCopPipe, ToastComponent, ConfirmDialogComponent, IconComponent],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
/**
 * Portafolio del usuario.
 * Muestra las suscripciones activas y permite cancelarlas
 * con un diálogo de confirmación previo.
 */
export class PortfolioComponent {
  readonly store = inject(InvestmentStore);

  // Estado del diálogo de confirmación
  showConfirmDialog = signal(false);
  fundToCancel = signal<ActiveSubscription | null>(null);

  // Estado del toast de notificaciones
  toastVisible = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error' | 'info'>('info');

  isCancelling = signal(false);


  openConfirm(sub: ActiveSubscription) {
    this.fundToCancel.set(sub);
    this.showConfirmDialog.set(true);
  }

  cancelDialog() {
    this.showConfirmDialog.set(false);
    this.fundToCancel.set(null);
  }

  showToast(message: string, type: 'success' | 'error' | 'info') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastVisible.set(true);
  }

  /** Ejecuta la cancelación tras confirmación del usuario */
  executeCancellation() {
    if (this.isCancelling()) return;
    this.isCancelling.set(true);

    const sub = this.fundToCancel();
    if (!sub) {
      this.isCancelling.set(false);
      return;
    }

    // Cerrar diálogo antes de procesar para transición fluida
    this.showConfirmDialog.set(false);
    
    const result = this.store.cancelSubscription(sub.fund.id);

    if (result.success) {
      this.showToast(`¡Has cancelado exitosamente tu suscripción a ${sub.fund.name}! El monto ha sido devuelto a tu saldo.`, 'success');
    } else {
      const errorMsg = result.error === 'NOT_FOUND' 
        ? 'No se encontró la participación activa.' 
        : 'Ocurrió un error técnico al cancelar tu suscripción.';
      this.showToast(errorMsg, 'error');
    }
    
    this.fundToCancel.set(null);
    this.isCancelling.set(false);
  }
}
