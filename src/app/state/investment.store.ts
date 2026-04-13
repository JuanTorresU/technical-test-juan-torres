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

@Injectable({
  providedIn: 'root'
})
export class InvestmentStore {
  private readonly fundRepository = inject(FUND_REPOSITORY);
  private readonly balanceRepository = inject(BALANCE_REPOSITORY);
  private readonly persistenceService = inject(PersistenceService);

  private readonly FALLBACK_BALANCE = 0;

  private getPersistedBalance(): number | null {
    return this.persistenceService.read<number | null>('BALANCE', null);
  }

  // Declarative Resource for fetching
  private readonly balanceResource = rxResource({
    stream: () => this.balanceRepository.getBalance()
  });

  // Writable Signals (State)
  readonly balance = signal<number>(this.getPersistedBalance() ?? 0);
  readonly subscriptions = signal<ActiveSubscription[]>(this.persistenceService.read<ActiveSubscription[]>('SUBSCRIPTIONS', []));
  readonly transactions = signal<Transaction[]>(this.persistenceService.read<Transaction[]>('TRANSACTIONS', []));
  // rxResource automatically handles fetching
  private readonly fundsResource = rxResource({
    stream: () => this.fundRepository.getFunds(),
    defaultValue: [] as Fund[]
  });

  readonly funds = computed(() => {
    if (this.fundsResource.error()) return [];
    return this.fundsResource.value() || [];
  });
  readonly loading = computed(() => this.fundsResource.isLoading());
  readonly error = computed(() => {
    const err = this.fundsResource.error();
    return err ? (err instanceof Error ? err.message : 'Error loading funds. Please try again.') : null;
  });

  constructor() {
    // Hidratar desde API solo si no hay dato persistido
    effect(() => {
      const api = this.balanceResource.value()?.balance;
      if (api !== undefined && this.getPersistedBalance() === null) {
        this.balance.set(api);
      }

      const err = this.balanceResource.error();
      if (err && this.getPersistedBalance() === null) {
        console.error('Error fetching initial balance from API:', err);
      }
    });

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

  // Computed Signals
  readonly subscribedFundIds = computed(() =>
    new Set(this.subscriptions().map(sub => sub.fund.id))
  );

  readonly availableFunds = computed(() => {
    const subscribedSet = this.subscribedFundIds();
    return this.funds().filter(fund => !subscribedSet.has(fund.id));
  });

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

  // Actions
  loadFunds(): void {
    this.fundsResource.reload();
  }

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

    // Deduct balance
    this.balance.update(b => b - amount);

    // Add active subscription
    const newSubscription: ActiveSubscription = {
      fund,
      amount,
      notification,
      subscribedAt: timestamp
    };
    this.subscriptions.update(subs => [...subs, newSubscription]);

    // Log transaction
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

  cancelSubscription(fundId: number): OperationResult {
    const subscription = this.subscriptions().find(s => s.fund.id === fundId);

    if (!subscription) {
      return { success: false, error: 'NOT_FOUND' };
    }

    const timestamp = new Date().toISOString();

    // Reintegrate balance
    this.balance.update(b => b + subscription.amount);

    // Remove subscription
    this.subscriptions.update(subs => subs.filter(s => s.fund.id !== fundId));

    // Log transaction cancellation
    const newTransaction: Transaction = {
      id: this.generateId(),
      fundId: subscription.fund.id,
      fundName: subscription.fund.name,
      type: 'cancellation',
      amount: subscription.amount,
      notification: subscription.notification, // Fallback to last known method
      createdAt: timestamp
    };
    this.transactions.update(txs => [newTransaction, ...txs]);

    return { success: true };
  }
}
