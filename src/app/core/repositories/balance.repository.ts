import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';

export const BALANCE_REPOSITORY = new InjectionToken<BalanceRepository>('BalanceRepository');

export interface BalanceRepository {
  getBalance(): Observable<{ balance: number }>;
}
