import { TestBed } from '@angular/core/testing';
import { PersistenceService } from './persistence.service';

describe('PersistenceService', () => {
  let service: PersistenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersistenceService);

    // Limpiar localStorage antes de cada prueba
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('read / write', () => {
    it('should write data to localStorage under correct key', () => {
      service.write('BALANCE', 500000);
      expect(localStorage.getItem('fm_balance')).toBe('500000');
    });

    it('should read existing data from localStorage correctly', () => {
      localStorage.setItem('fm_balance', '200000');
      const balance = service.read<number>('BALANCE', 0);
      expect(balance).toBe(200000);
    });

    it('should return default value if key does not exist', () => {
      const balance = service.read<number>('BALANCE', 100000);
      expect(balance).toBe(100000);
    });

    it('should handle corrupted JSON and return default value', () => {
      // JSON malformado
      localStorage.setItem('fm_subscriptions', '{ wrong_format }');
      const subs = service.read<any[]>('SUBSCRIPTIONS', []);
      expect(subs).toEqual([]);
      // Además debe limpiar esa llave corrupta
      expect(localStorage.getItem('fm_subscriptions')).toBeNull();
    });
  });

  describe('QuotaExceededError handling', () => {
    it('should clear all cache if QuotaExceededError is thrown during write', () => {
      // Mock de setItem para forzar el error
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const err = new DOMException('QuotaExceededError for test', 'QuotaExceededError');
        throw err;
      });

      // Insertamos una llave válida suelta para validar que el clearAll() funcione
      vi.spyOn(service, 'clearAll').mockImplementation(vi.fn());

      service.write('TRANSACTIONS', []);
      
      expect(service.clearAll).toHaveBeenCalled();
    });

    it('should silently ignore non-quota write errors', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Some other error'); });
      vi.spyOn(service, 'clearAll').mockImplementation(vi.fn());
      
      expect(() => service.write('BALANCE', 0)).not.toThrow();
      expect(service.clearAll).not.toHaveBeenCalled();
    });
  });

  describe('clearItem and clearAll', () => {
    it('should clear specific key correctly', () => {
      localStorage.setItem('fm_balance', '100');
      localStorage.setItem('fm_subscriptions', '[]');

      service.clearItem('BALANCE');
      
      expect(localStorage.getItem('fm_balance')).toBeNull();
      expect(localStorage.getItem('fm_subscriptions')).toBe('[]');
    });

    it('should clear all service keys correctly', () => {
      localStorage.setItem('fm_balance', '100');
      localStorage.setItem('fm_subscriptions', '[]');
      localStorage.setItem('fm_transactions', '[]');
      localStorage.setItem('other_key', 'should remain');

      service.clearAll();
      
      expect(localStorage.getItem('fm_balance')).toBeNull();
      expect(localStorage.getItem('fm_subscriptions')).toBeNull();
      expect(localStorage.getItem('fm_transactions')).toBeNull();
      expect(localStorage.getItem('other_key')).toBe('should remain');
    });
  });
});
