import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BalanceRepository } from './balance.repository';
import { API_URL } from '../tokens/api.token';

/** Implementación HTTP del repositorio de saldo */
@Injectable()
export class ApiBalanceRepository implements BalanceRepository {
  private http = inject(HttpClient);
  private baseUrl = inject(API_URL);

  getBalance(): Observable<{ balance: number }> {
    return this.http.get<{ balance: number }>(`${this.baseUrl}/balance`);
  }
}
