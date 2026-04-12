import { Injectable, signal, computed, inject, OnDestroy, effect } from '@angular/core';
import { finalize, catchError, EMPTY, debounceTime, Subject, takeUntil } from 'rxjs';
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
export class InvestmentStore implements OnDestroy {
  private readonly fundRepository = inject(FundRepository);
  private readonly persistenceService = inject(PersistenceService);

  // RxJS Subjects para control de Memory Leaks y Debounce de localStorage
  private readonly destroy$ = new Subject<void>();
  private readonly balance$ = new Subject<number>();
  private readonly subs$ = new Subject<ActiveSubscription[]>();
  private readonly txs$ = new Subject<Transaction[]>();

  // Writable Signals (State)
  readonly balance = signal<number>(this.persistenceService.read<number>('BALANCE', INITIAL_BALANCE));
  readonly subscriptions = signal<ActiveSubscription[]>(this.persistenceService.read<ActiveSubscription[]>('SUBSCRIPTIONS', []));
  readonly transactions = signal<Transaction[]>(this.persistenceService.read<Transaction[]>('TRANSACTIONS', []));
  readonly funds = signal<Fund[]>([]);
  
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  constructor() {
    // Pipelines para no asfixiar el disco
    this.balance$.pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((val: number) => this.persistenceService.write('BALANCE', val));

    this.subs$.pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((val: ActiveSubscription[]) => this.persistenceService.write('SUBSCRIPTIONS', val));

    this.txs$.pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((val: Transaction[]) => this.persistenceService.write('TRANSACTIONS', val));

    // Autodetectar cambios en el signal para enviarlos por el pipeline
    effect(() => { this.balance$.next(this.balance()); });
    effect(() => { this.subs$.next(this.subscriptions()); });
    effect(() => { this.txs$.next(this.transactions()); });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Computed Signals
  readonly subscribedFundIds = computed(() => 
    this.subscriptions().map(sub => sub.fund.id)
  );

  readonly availableFunds = computed(() => {
    const subscribedSet = new Set(this.subscribedFundIds());
    return this.funds().filter(fund => !subscribedSet.has(fund.id));
  });

  private generateId(): string {
    return typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15);
  }

  // Actions
  loadFunds(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.fundRepository.getFunds().pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        this.error.set('Error loading funds. Please try again.');
        return EMPTY;
      }),
      finalize(() => this.loading.set(false))
    ).subscribe((data: Fund[]) => {
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
