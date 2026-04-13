import { Observable } from 'rxjs';
import { Fund } from '../models/fund.model';
import { InjectionToken } from '@angular/core';

export const FUND_REPOSITORY = new InjectionToken<FundRepository>('FundRepository');

export interface FundRepository {
  getFunds(): Observable<Fund[]>;
}
