import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FUND_REPOSITORY } from '../core/repositories/fund.repository';
import { BALANCE_REPOSITORY } from '../core/repositories/balance.repository';
import { PersistenceService } from '../core/services/persistence.service';
import {
  Fund,
  ActiveSubscription,
  Transaction,
  OperationResult,
  NotificationMethod
} from '../core/models/fund.model';

/**
 * Store central de inversiones.
 * Gestiona el estado reactivo de saldo, suscripciones y transacciones
 * usando Angular Signals, con persistencia automática en localStorage.
 */
@Injectable({
  providedIn: 'root'
})
export class InvestmentStore {
  private readonly fundRepository = inject(FUND_REPOSITORY);
  private readonly balanceRepository = inject(BALANCE_REPOSITORY);
  private readonly persistenceService = inject(PersistenceService);

  private getPersistedBalance(): number | null {
    return this.persistenceService.read<number | null>('BALANCE', null);
  }

  // Recurso declarativo para obtener el saldo inicial desde la API
  private readonly balanceResource = rxResource({
    stream: () => this.balanceRepository.getBalance()
  });

  // Estado principal (signals escribibles)
  readonly balance = signal<number>(this.getPersistedBalance() ?? 0);
  readonly subscriptions = signal<ActiveSubscription[]>(this.persistenceService.read<ActiveSubscription[]>('SUBSCRIPTIONS', []));
  readonly transactions = signal<Transaction[]>(this.persistenceService.read<Transaction[]>('TRANSACTIONS', []));

  // Recurso declarativo para obtener el catálogo de fondos
  private readonly fundsResource = rxResource({
    stream: () => this.fundRepository.getFunds(),
    defaultValue: [] as Fund[]
  });

  // Estado derivado (signals computadas de solo lectura)
  readonly funds = computed(() => {
    if (this.fundsResource.error()) return [];
    return this.fundsResource.value() || [];
  });
  readonly loading = computed(() => this.fundsResource.isLoading());
  readonly balanceLoading = computed(() => this.balanceResource.isLoading());
  readonly error = computed(() => {
    const err = this.fundsResource.error();
    return err ? (err instanceof Error ? err.message : 'Error loading funds. Please try again.') : null;
  });

  constructor() {
    // Si no hay saldo en localStorage, sincronizamos con la API
    if (this.getPersistedBalance() === null) {
      effect(() => {
        const val = this.balanceResource.value()?.balance;
        if (val !== undefined) this.balance.set(val);
      });
    }

    // Persistir estado en localStorage con debounce de 300ms
    effect((onCleanup) => {
      const b = this.balance();
      const s = this.subscriptions();
      const t = this.transactions();

      const id = setTimeout(() => {
        this.persistenceService.write('BALANCE', b);
        this.persistenceService.write('SUBSCRIPTIONS', s);
        this.persistenceService.write('TRANSACTIONS', t);
      }, 300);
      onCleanup(() => clearTimeout(id));
    });
  }

  /** IDs de fondos a los que el usuario ya está suscrito */
  readonly subscribedFundIds = computed(() =>
    new Set(this.subscriptions().map(sub => sub.fund.id))
  );

  /** Fondos del catálogo que aún no tienen suscripción activa */
  readonly availableFunds = computed(() => {
    const subscribedSet = this.subscribedFundIds();
    return this.funds().filter(fund => !subscribedSet.has(fund.id));
  });

  /** Transacciones ordenadas de más reciente a más antigua */
  readonly sortedTransactions = computed(() =>
    [...this.transactions()].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );

  private generateId(): string {
    return typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // ── Acciones ──

  /** Recarga el catálogo de fondos desde la API */
  loadFunds(): void {
    this.fundsResource.reload();
  }

  /** Suscribe al usuario a un fondo: valida reglas de negocio, descuenta saldo y registra la transacción */
  subscribeTo(fund: Fund, amount: number, notification: NotificationMethod): OperationResult {
    if (!Number.isFinite(amount) || isNaN(amount) || amount <= 0) {
      return { success: false, error: 'BELOW_MINIMUM' };
    }

    if (amount < fund.minimumAmount) {
      return { success: false, error: 'BELOW_MINIMUM' };
    }

    if (this.balance() < amount) {
      return { success: false, error: 'INSUFFICIENT_BALANCE' };
    }

    if (this.subscribedFundIds().has(fund.id)) {
      return { success: false, error: 'ALREADY_SUBSCRIBED' };
    }

    const timestamp = new Date().toISOString();

    // Descontar saldo
    this.balance.update(b => b - amount);

    // Registrar suscripción activa
    const newSubscription: ActiveSubscription = {
      fund,
      amount,
      notification,
      subscribedAt: timestamp
    };
    this.subscriptions.update(subs => [...subs, newSubscription]);

    // Registrar transacción en el historial
    const newTransaction: Transaction = {
      id: this.generateId(),
      fundId: fund.id,
      fundName: fund.name,
      type: 'subscription',
      amount,
      notification,
      createdAt: timestamp
    };
    this.transactions.update(txs => [newTransaction, ...txs]);

    return { success: true };
  }

  /** Cancela una suscripción: reintegra el saldo y registra la cancelación */
  cancelSubscription(fundId: number): OperationResult {
    const subscription = this.subscriptions().find(s => s.fund.id === fundId);

    if (!subscription) {
      return { success: false, error: 'NOT_FOUND' };
    }

    const timestamp = new Date().toISOString();

    // Reintegrar saldo
    this.balance.update(b => b + subscription.amount);

    // Eliminar suscripción activa
    this.subscriptions.update(subs => subs.filter(s => s.fund.id !== fundId));

    // Registrar cancelación en el historial
    const newTransaction: Transaction = {
      id: this.generateId(),
      fundId: subscription.fund.id,
      fundName: subscription.fund.name,
      type: 'cancellation',
      amount: subscription.amount,
      notification: subscription.notification,
      createdAt: timestamp
    };
    this.transactions.update(txs => [newTransaction, ...txs]);

    return { success: true };
  }
}
