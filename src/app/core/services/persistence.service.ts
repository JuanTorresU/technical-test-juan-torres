import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {
  private readonly KEYS = {
    BALANCE: 'fm_balance',
    SUBSCRIPTIONS: 'fm_subscriptions',
    TRANSACTIONS: 'fm_transactions'
  };

  /**
   * Lee datos del localStorage para la llave dada o retorna la semilla 'defaultValue' en caso de no existir o corromperse.
   */
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

  /**
   * Persiste directamente los datos convirtiendo el objecto a string, si falla no corrompe la UI.
   */
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

  /**
   * Utilidad para limpiar local individualmente.
   */
  clearItem(key: 'BALANCE' | 'SUBSCRIPTIONS' | 'TRANSACTIONS'): void {
    localStorage.removeItem(this.KEYS[key]);
  }

  /**
   * Resetea la infraestructura de cache de fondos completa.
   */
  clearAll(): void {
    Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
  }
}
