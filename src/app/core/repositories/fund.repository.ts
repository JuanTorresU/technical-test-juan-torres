import { Observable } from 'rxjs';
import { Fund } from '../models/fund.model';
import { InjectionToken } from '@angular/core';

/** Token de inyección para abstraer el acceso a datos de fondos */
export const FUND_REPOSITORY = new InjectionToken<FundRepository>('FundRepository');

/** Contrato para obtener el listado de fondos disponibles */
export interface FundRepository {
  getFunds(): Observable<Fund[]>;
}
