import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';

/** Token de inyección para abstraer el acceso al saldo del usuario */
export const BALANCE_REPOSITORY = new InjectionToken<BalanceRepository>('BalanceRepository');

/** Contrato para obtener el saldo disponible */
export interface BalanceRepository {
  getBalance(): Observable<{ balance: number }>;
}
