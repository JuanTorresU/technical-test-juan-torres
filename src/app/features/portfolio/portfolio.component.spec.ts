import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioComponent } from './portfolio.component';
import { InvestmentStore } from '../../state/investment.store';
import { signal } from '@angular/core';

describe('PortfolioComponent', () => {
  let component: PortfolioComponent;
  let fixture: ComponentFixture<PortfolioComponent>;
  let storeMock: any;

  beforeEach(async () => {
    storeMock = {
      subscriptions: signal([]),
      cancelSubscription: jasmine.createSpy('cancelSubscription').and.returnValue({ success: true })
    };

    await TestBed.configureTestingModule({
      imports: [PortfolioComponent],
      providers: [
        { provide: InvestmentStore, useValue: storeMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create initial UI with empty state', () => {
    expect(component).toBeTruthy();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
  });

  it('should render subscriptions grid when there are active funds', () => {
    storeMock.subscriptions.set([
      {
        fund: { id: 1, name: 'Fund A', category: 'FPV' },
        amount: 50000,
        notification: 'email',
        subscribedAt: new Date().toISOString()
      }
    ]);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeNull();
    expect(compiled.querySelector('.responsive-table')).toBeTruthy();
    expect(compiled.querySelectorAll('tbody tr').length).toBe(1);
    expect(compiled.textContent).toContain('Fund A');
  });

  it('should open confirmation dialog and subsequently cancel fund via store', () => {
    const activeSub = {
      fund: { id: 1, name: 'Fund A' },
      amount: 50000,
      notification: 'sms',
      subscribedAt: new Date().toISOString()
    };
    
    // Open Dialog
    component.openConfirm(activeSub as any);
    expect(component.showConfirmDialog()).toBeTrue();
    expect(component.fundToCancel()).toEqual(activeSub);
    
    // Execute cancellation
    component.executeCancellation();
    
    expect(component.showConfirmDialog()).toBeFalse();
    expect(storeMock.cancelSubscription).toHaveBeenCalledWith(1);
    expect(component.toastVisible()).toBeTrue();
    expect(component.toastType()).toBe('success');
  });
});
