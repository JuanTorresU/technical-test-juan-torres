import { Component, OnInit, OnDestroy, inject, signal, HostListener, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InvestmentStore } from '../../state/investment.store';
import { Fund } from '../../core/models/fund.model';
import { CurrencyCopPipe } from '../../shared/currency-cop.pipe';
import { ToastComponent } from '../../shared/toast.component';

const ERROR_MESSAGES: Record<string, string> = {
  INSUFFICIENT_BALANCE: 'No tienes saldo suficiente para esta operación.',
  ALREADY_SUBSCRIBED: 'Ya te encuentras suscrito a este fondo.',
  NOT_FOUND: 'Fondo no encontrado.',
  BELOW_MINIMUM: 'El monto ingresado es menor al requerido.'
};

@Component({
  selector: 'app-catalog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, CurrencyCopPipe, ToastComponent],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit, OnDestroy {
  readonly store = inject(InvestmentStore);
  private fb = inject(FormBuilder);
  private timeoutId?: ReturnType<typeof setTimeout>;

  @ViewChild('amountInput') amountInput!: ElementRef<HTMLInputElement>;

  // Local State
  isModalOpen = signal(false);
  selectedFund = signal<Fund | null>(null);
  isProcessing = signal(false);

  // Reactive Toast State via Signals
  toastVisible = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error' | 'info'>('info');

  subscribeForm: FormGroup;

  constructor() {
    this.subscribeForm = this.fb.group({
      amount: ['', [Validators.required]],
      notification: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.store.funds().length === 0) {
      this.store.loadFunds();
    }
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isModalOpen()) {
      this.closeModal();
    }
  }

  openSubscribeModal(fund: Fund) {
    this.selectedFund.set(fund);
    this.subscribeForm.reset({
      amount: fund.minimumAmount,
      notification: ''
    });

    this.subscribeForm.get('amount')?.setValidators([
      Validators.required,
      Validators.min(fund.minimumAmount),
      Validators.max(this.store.balance())
    ]);
    this.subscribeForm.get('amount')?.updateValueAndValidity();

    this.isModalOpen.set(true);

    // Focus input after render
    this.timeoutId = setTimeout(() => {
      if (this.amountInput?.nativeElement) {
        this.amountInput.nativeElement.focus();
      }
    }, 50);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedFund.set(null);
    this.subscribeForm.reset();
  }

  showToast(message: string, type: 'success' | 'error' | 'info') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastVisible.set(true);
  }

  onSubmit() {
    if (this.subscribeForm.invalid) {
      this.subscribeForm.markAllAsTouched();
      return;
    }

    const fund = this.selectedFund();
    if (!fund) return;

    this.isProcessing.set(true);

    const amount = Number(this.subscribeForm.get('amount')?.value);
    const notification = this.subscribeForm.get('notification')?.value;

    const result = this.store.subscribeTo(fund, amount, notification);

    if (result.success) {
      this.closeModal();
      this.showToast('¡Suscripción exitosa al fondo ' + fund.name + '!', 'success');
    } else {
      const errorKey = result.error;
      const errorMsg = ERROR_MESSAGES[errorKey] || 'Hubo un error inesperado al suscribirse.';
      this.showToast(errorMsg, 'error');
    }

    this.isProcessing.set(false);
  }
}
