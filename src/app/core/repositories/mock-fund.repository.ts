import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { FundRepository } from './fund.repository';
import { FUNDS_MOCK } from '../data/funds.mock';
import { Fund } from '../models/fund.model';

@Injectable({
  providedIn: 'root'
})
export class MockFundRepository extends FundRepository {
  override getFunds(): Observable<Fund[]> {
    return of(FUNDS_MOCK).pipe(delay(600));
  }
}
