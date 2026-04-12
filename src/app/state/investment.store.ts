import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { finalize, catchError, EMPTY } from 'rxjs';
import { FundRepository } from '../core/repositories/fund.repository';
import { PersistenceService } from '../core/services/persistence.service';
import { 
  Fund, 
  ActiveSubscription, 
  Transaction, 
  OperationResult, 
  NotificationMethod 
} from '../core/models/fund.model';
import { INITIAL_BALANCE } from '../core/data/funds.mock';

@Injectable({
  providedIn: 'root'
})
export class InvestmentStore {
  private readonly fundRepository = inject(FundRepository);
  private readonly persistenceService = inject(PersistenceService);

  // Writable Signals (State)
  readonly balance = signal<number>(this.persistenceService.read<number>('BALANCE', INITIAL_BALANCE));
  readonly subscriptions = signal<ActiveSubscription[]>(this.persistenceService.read<ActiveSubscription[]>('SUBSCRIPTIONS', []));
  readonly transactions = signal<Transaction[]>(this.persistenceService.read<Transaction[]>('TRANSACTIONS', []));
  readonly funds = signal<Fund[]>([]);
  
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  constructor() {
    // Effects for Persistence
    effect(() => {
      this.persistenceService.write('BALANCE', this.balance());
    });

    effect(() => {
      this.persistenceService.write('SUBSCRIPTIONS', this.subscriptions());
    });

    effect(() => {
      this.persistenceService.write('TRANSACTIONS', this.transactions());
    });
  }

  // Computed Signals
  readonly subscribedFundIds = computed(() => 
    this.subscriptions().map(sub => sub.fund.id)
  );

  readonly availableFunds = computed(() => {
    const subscribedSet = new Set(this.subscribedFundIds());
    return this.funds().filter(fund => !subscribedSet.has(fund.id));
  });

  // Actions
  loadFunds(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.fundRepository.getFunds().pipe(
      catchError(err => {
        this.error.set('Error loading funds. Please try again.');
        return EMPTY;
      }),
      finalize(() => this.loading.set(false))
    ).subscribe(data => {
      this.funds.set(data);
    });
  }

  subscribeTo(fund: Fund, amount: number, notification: NotificationMethod): OperationResult {
    if (amount < fund.minimumAmount) {
      return { success: false, error: 'BELOW_MINIMUM' };
    }
    
    if (this.balance() < amount) {
      return { success: false, error: 'INSUFFICIENT_BALANCE' };
    }

    if (this.subscribedFundIds().includes(fund.id)) {
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
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
