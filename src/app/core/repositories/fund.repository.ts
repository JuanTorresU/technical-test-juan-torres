import { Observable } from 'rxjs';
import { Fund } from '../models/fund.model';

export abstract class FundRepository {
  abstract getFunds(): Observable<Fund[]>;
}
