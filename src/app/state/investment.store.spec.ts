import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { InvestmentStore } from './investment.store';
import { FUND_REPOSITORY, FundRepository } from '../core/repositories/fund.repository';
import { PersistenceService } from '../core/services/persistence.service';
import { Fund } from '../core/models/fund.model';
import { INITIAL_BALANCE } from '../core/data/funds.mock';

describe('InvestmentStore', () => {
  let store: InvestmentStore;
  let mockFundRepository: jasmine.SpyObj<FundRepository>;
  let mockPersistenceService: jasmine.SpyObj<PersistenceService>;

  const mockFunds: Fund[] = [
    { id: 1, name: 'Fund A', minimumAmount: 50000, category: 'FPV' },
    { id: 2, name: 'Fund B', minimumAmount: 100000, category: 'FIC' }
  ];

  beforeEach(() => {
    mockFundRepository = jasmine.createSpyObj('FundRepository', ['getFunds']);
    // Setup default mock return
    mockFundRepository.getFunds.and.returnValue(of(mockFunds));

    mockPersistenceService = jasmine.createSpyObj('PersistenceService', ['read', 'write', 'clearItem', 'clearAll']);
    
    // Setup default persistence behavior
    mockPersistenceService.read.and.callFake((key: any, defaultValue: any) => {
      if (key === 'BALANCE') return INITIAL_BALANCE;
      if (key === 'SUBSCRIPTIONS') return [];
      if (key === 'TRANSACTIONS') return [];
      return defaultValue;
    });

    TestBed.configureTestingModule({
      providers: [
        InvestmentStore,
        { provide: FUND_REPOSITORY, useValue: mockFundRepository },
        { provide: PersistenceService, useValue: mockPersistenceService }
      ]
    });

    store = TestBed.inject(InvestmentStore);
  });

  afterEach(() => {
    store.ngOnDestroy();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('loadFunds', () => {
    it('should successfully load funds (carga de fondos exitosa)', () => {
      store.loadFunds();
      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.funds()).toEqual(mockFunds);
    });

    it('should handle error when loading funds (error al cargar fondos)', () => {
      mockFundRepository.getFunds.and.returnValue(throwError(() => new Error('API Error')));
      store.loadFunds();
      expect(store.loading()).toBeFalse();
      expect(store.error()).toBe('Error loading funds. Please try again.');
      expect(store.funds()).toEqual([]);
    });
  });

  describe('subscriptions', () => {
    let testFund: Fund;

    beforeEach(() => {
      store.loadFunds();
      testFund = store.funds()[0]; // minimumAmount: 50000
    });

    it('should successfully subscribe to a fund (suscripcion exitosa)', () => {
      const result = store.subscribeTo(testFund, 100000, 'email');
      
      expect(result).toEqual({ success: true });
      expect(store.balance()).toBe(INITIAL_BALANCE - 100000);
      expect(store.subscriptions().length).toBe(1);
      expect(store.subscriptions()[0].fund.id).toBe(testFund.id);
      expect(store.transactions().length).toBe(1);
      expect(store.transactions()[0].type).toBe('subscription');
    });

    it('should fail if balance is insufficient (error por saldo insuficiente)', () => {
      const amount = INITIAL_BALANCE + 1;
      const result = store.subscribeTo(testFund, amount, 'sms');
      
      expect(result).toEqual({ success: false, error: 'INSUFFICIENT_BALANCE' });
      expect(store.balance()).toBe(INITIAL_BALANCE);
      expect(store.subscriptions().length).toBe(0);
    });

    it('should fail if amount is below minimum (error por monto menor al minimo)', () => {
      const amount = testFund.minimumAmount - 1;
      const result = store.subscribeTo(testFund, amount, 'email');
      
      expect(result).toEqual({ success: false, error: 'BELOW_MINIMUM' });
      expect(store.balance()).toBe(INITIAL_BALANCE);
      expect(store.subscriptions().length).toBe(0);
    });

    it('should fail if already subscribed (error por suscripcion duplicada)', () => {
      store.subscribeTo(testFund, 100000, 'email');
      
      const result = store.subscribeTo(testFund, 60000, 'sms');
      
      expect(result).toEqual({ success: false, error: 'ALREADY_SUBSCRIBED' });
      expect(store.subscriptions().length).toBe(1); // Still 1
    });
  });

  describe('cancellations', () => {
    let testFund: Fund;

    beforeEach(() => {
      store.loadFunds();
      testFund = store.funds()[0];
      store.subscribeTo(testFund, 100000, 'sms');
    });

    it('should successfully cancel a subscription (cancelacion exitosa)', () => {
      const result = store.cancelSubscription(testFund.id);
      
      expect(result).toEqual({ success: true });
      expect(store.balance()).toBe(INITIAL_BALANCE);
      expect(store.subscriptions().length).toBe(0);
      
      // Should have 1 subscription and 1 cancellation transaction
      const transactions = store.transactions();
      expect(transactions.length).toBe(2);
      expect(transactions.some(t => t.type === 'cancellation')).toBeTrue();
      expect(transactions.some(t => t.type === 'subscription')).toBeTrue();
    });

    it('should fail if cancelling non-existent subscription (error al cancelar fondo inexistente)', () => {
      const nonSubscribedFundId = 999;
      const result = store.cancelSubscription(nonSubscribedFundId);
      
      expect(result).toEqual({ success: false, error: 'NOT_FOUND' });
      expect(store.subscriptions().length).toBe(1); // Still subscribed to original
    });
  });

  describe('availableFunds computation', () => {
    it('should exclude subscribed funds (availableFunds excluye fondos suscritos)', () => {
      store.loadFunds();
      const initialAvailable = store.availableFunds();
      expect(initialAvailable.length).toBe(2);

      store.subscribeTo(mockFunds[0], 50000, 'email');
      
      const updatedAvailable = store.availableFunds();
      expect(updatedAvailable.length).toBe(1);
      expect(updatedAvailable[0].id).toBe(mockFunds[1].id);
    });
  });

  describe('sortedTransactions computation', () => {
    it('should return transactions sorted by date descending', () => {
      store.loadFunds();
      store.subscribeTo(mockFunds[0], 50000, 'email');
      store.cancelSubscription(mockFunds[0].id);
      
      const sorted = store.sortedTransactions();
      expect(sorted.length).toBe(2);
      expect(new Date(sorted[0].createdAt).getTime()).toBeGreaterThanOrEqual(new Date(sorted[1].createdAt).getTime());
    });
  });

  describe('persistence effects', () => {
    it('should write to localStorage with debounce when state changes', fakeAsync(() => {
      // Ignore initial execution of effects
      mockPersistenceService.write.calls.reset();
      
      store.balance.set(100);
      TestBed.flushEffects();
      
      expect(mockPersistenceService.write).not.toHaveBeenCalled();
      
      tick(300);
      
      expect(mockPersistenceService.write).toHaveBeenCalledWith('BALANCE', 100);
    }));
  });
});
