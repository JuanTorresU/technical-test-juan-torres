import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoryComponent } from './history.component';
import { InvestmentStore } from '../../state/investment.store';
import { signal } from '@angular/core';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;
  let storeMock: any;

  beforeEach(async () => {
    storeMock = {
      sortedTransactions: signal([])
    };

    await TestBed.configureTestingModule({
      imports: [HistoryComponent],
      providers: [
        { provide: InvestmentStore, useValue: storeMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and show empty state by default', () => {
    expect(component).toBeTruthy();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
  });

  it('should render transaction history list properly', () => {
    storeMock.sortedTransactions.set([
      {
        id: 'tx1',
        fundId: 1,
        fundName: 'Fund A',
        type: 'subscription',
        amount: 250000,
        notification: 'email',
        createdAt: new Date().toISOString()
      },
      {
        id: 'tx2',
        fundId: 2,
        fundName: 'Fund B',
        type: 'cancellation',
        amount: 50000,
        notification: 'sms',
        createdAt: new Date().toISOString()
      }
    ]);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeNull();
    expect(compiled.querySelectorAll('.responsive-table tbody tr').length).toBe(2);
    expect(compiled.textContent).toContain('Fund A');
    expect(compiled.textContent).toContain('Fund B');
  });
});
