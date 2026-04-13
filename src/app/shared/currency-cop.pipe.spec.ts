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
    expect(pipe.transform(500000)).toContain('500');
    expect(pipe.transform(500000)).toContain('COP');
    expect(pipe.transform(0)).toContain('0');
    expect(pipe.transform(0)).toContain('COP');
    expect(pipe.transform(1234567.89)).toContain('234');
    expect(pipe.transform(1234567.89)).toContain('COP');
  });

  it('should format valid numeric strings correctly', () => {
    expect(pipe.transform('150000')).toContain('150');
    expect(pipe.transform('150000')).toContain('COP');
  });

  it('should fallback to COP $0 for null, undefined or invalid values', () => {
    expect(pipe.transform(null)).toBe('COP $0');
    expect(pipe.transform(undefined)).toBe('COP $0');
    expect(pipe.transform('not a number')).toBe('COP $0');
    expect(pipe.transform(NaN)).toBe('COP $0');
  });
});
