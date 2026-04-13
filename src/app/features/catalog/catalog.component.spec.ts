import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogComponent } from './catalog.component';
import { InvestmentStore } from '../../state/investment.store';
import { signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

describe('CatalogComponent', () => {
  let component: CatalogComponent;
  let fixture: ComponentFixture<CatalogComponent>;
  let storeMock: any;

  beforeEach(async () => {
    storeMock = {
      funds: signal([
        { id: 1, name: 'Fund A', minimumAmount: 50000, category: 'FPV' },
        { id: 2, name: 'Fund B', minimumAmount: 75000, category: 'FIC' }
      ]),
      availableFunds: signal([
        { id: 1, name: 'Fund A', minimumAmount: 50000, category: 'FPV' },
        { id: 2, name: 'Fund B', minimumAmount: 75000, category: 'FIC' }
      ]),
      balance: signal(500000),
      loading: signal(false),
      error: signal(null),
      loadFunds: jasmine.createSpy('loadFunds'),
      subscribeTo: jasmine.createSpy('subscribeTo').and.returnValue({ success: true })
    };

    await TestBed.configureTestingModule({
      imports: [CatalogComponent, ReactiveFormsModule],
      providers: [
        { provide: InvestmentStore, useValue: storeMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadFunds on init if funds list is empty', () => {
    storeMock.funds.set([]);
    component.ngOnInit();
    expect(storeMock.loadFunds).toHaveBeenCalled();
  });

  it('should open modal and initialize form when selecting a fund', () => {
    const fund = storeMock.funds()[0];
    component.openSubscribeModal(fund);
    
    expect(component.isModalOpen()).toBeTrue();
    expect(component.selectedFund()).toEqual(fund);
    expect(component.subscribeForm.get('amount')?.value).toBe(fund.minimumAmount);
  });

  it('should not allow submission if form is invalid (e.g. below minimum or empty notification)', async () => {
    const fund = storeMock.funds()[0];
    component.openSubscribeModal(fund);
    
    // amount is minimum, but notification is empty by default -> invalid
    expect(component.subscribeForm.invalid).toBeTrue();
    
    await component.onSubmit();
    
    expect(storeMock.subscribeTo).not.toHaveBeenCalled();
    expect(component.subscribeForm.touched).toBeTrue();
    expect(component.isProcessing()).toBeFalse();
  });

  it('should call store.subscribeTo and close modal on successful form submission', async () => {
    const fund = storeMock.funds()[0];
    component.openSubscribeModal(fund);
    
    component.subscribeForm.patchValue({
      amount: 100000,
      notification: 'email'
    });
    
    expect(component.subscribeForm.valid).toBeTrue();
    
    const submitPromise = component.onSubmit();
    
    expect(component.isProcessing()).toBeTrue();
    
    await submitPromise;
    
    expect(storeMock.subscribeTo).toHaveBeenCalledWith(fund, 100000, 'email');
    expect(component.isModalOpen()).toBeFalse();
    expect(component.toastVisible()).toBeTrue();
    expect(component.toastType()).toBe('success');
  });
});
