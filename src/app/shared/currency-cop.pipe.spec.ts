import { CurrencyCopPipe } from './currency-cop.pipe';

describe('CurrencyCopPipe', () => {
  let pipe: CurrencyCopPipe;

  beforeEach(() => {
    pipe = new CurrencyCopPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format valid numbers correctly', () => {
    // Note: The exact string behavior depends on node/browser environment, 
    // but standard Intl formatter for 'es-CO' returns points for thousands.
    // '500.000' or '500000' sometimes differs by node version.
    // Assuming es-CO logic generates points.
    expect(pipe.transform(500000)).toBe('COP $500.000');
    expect(pipe.transform(0)).toBe('COP $0');
    expect(pipe.transform(1234567.89)).toBe('COP $1.234.568'); // Rounding maxFractionDigits: 0
  });

  it('should format valid numeric strings correctly', () => {
    expect(pipe.transform('150000')).toBe('COP $150.000');
  });

  it('should fallback to COP $0 for null, undefined or invalid values', () => {
    expect(pipe.transform(null)).toBe('COP $0');
    expect(pipe.transform(undefined)).toBe('COP $0');
    expect(pipe.transform('not a number')).toBe('COP $0');
    expect(pipe.transform(NaN)).toBe('COP $0');
  });
});
