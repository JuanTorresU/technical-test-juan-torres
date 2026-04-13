import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FundRepository } from './fund.repository';
import { Fund } from '../models/fund.model';
import { API_URL } from '../tokens/api.token';

/** Implementación HTTP del repositorio de fondos */
@Injectable()
export class ApiFundRepository implements FundRepository {
  private http = inject(HttpClient);
  private baseUrl = inject(API_URL);

  getFunds(): Observable<Fund[]> {
    return this.http.get<Fund[]>(`${this.baseUrl}/funds`);
  }
}
