import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {
  // Llaves de localStorage
  private readonly KEYS = {
    BALANCE: 'fm_balance',
    SUBSCRIPTIONS: 'fm_subscriptions',
    TRANSACTIONS: 'fm_transactions'
  };

  // Retorna defaultValue si no existe o si el dato está corrupto
  read<T>(key: 'BALANCE' | 'SUBSCRIPTIONS' | 'TRANSACTIONS', defaultValue: T): T {
    const lookupKey = this.KEYS[key];
    try {
      const storedItem = localStorage.getItem(lookupKey);
      if (storedItem === null) {
        return defaultValue;
      }
      const parsed = JSON.parse(storedItem);
      if (key === 'BALANCE' && typeof parsed !== 'number') throw new Error('Invalid schema');
      if ((key === 'SUBSCRIPTIONS' || key === 'TRANSACTIONS') && !Array.isArray(parsed)) throw new Error('Invalid schema');

      return parsed as T;
    } catch {
      this.clearItem(key);
      return defaultValue;
    }
  }

  write<T>(key: 'BALANCE' | 'SUBSCRIPTIONS' | 'TRANSACTIONS', value: T): void {
    const lookupKey = this.KEYS[key];
    try {
      localStorage.setItem(lookupKey, JSON.stringify(value));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearItem(key);
        try {
          localStorage.setItem(lookupKey, JSON.stringify(value));
        } catch {
          this.clearAll();
        }
      }
    }
  }

  clearItem(key: 'BALANCE' | 'SUBSCRIPTIONS' | 'TRANSACTIONS'): void {
    localStorage.removeItem(this.KEYS[key]);
  }

  clearAll(): void {
    Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
  }
}
