import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvestmentStore } from '../../state/investment.store';
import { ActiveSubscription } from '../../core/models/fund.model';
import { CurrencyCopPipe } from '../../shared/currency-cop.pipe';
import { ToastComponent } from '../../shared/toast.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CurrencyCopPipe, ToastComponent, ConfirmDialogComponent],
  providers: [CurrencyCopPipe],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent {
  readonly store = inject(InvestmentStore);
  private currencyPipe = inject(CurrencyCopPipe);

  // Status del ConfirmDialog
  showConfirmDialog = signal(false);
  fundToCancel = signal<ActiveSubscription | null>(null);

  // Status del Toast
  toastVisible = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error' | 'info'>('info');

  isCancelling = signal(false);

  readonly confirmMessage = computed(() => {
    const sub = this.fundToCancel();
    if (!sub) return '';
    const amount = this.currencyPipe.transform(sub.amount);
    return `¿Estás seguro que deseas cancelar tu fondo ${sub.fund.name}? El monto de ${amount} será reintegrado a tu saldo disponible inmediatamente.`;
  });

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

  executeCancellation() {
    if (this.isCancelling()) return;
    this.isCancelling.set(true);

    const sub = this.fundToCancel();
    if (!sub) {
      this.isCancelling.set(false);
      return;
    }

    // Remove dialog upfront smoothly
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
