import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyCop',
  standalone: true
})
export class CurrencyCopPipe implements PipeTransform {
  // Cache the Intl formatter for efficiency
  private static formatter = new Intl.NumberFormat('es-CO', {
    style: 'decimal',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return 'COP $0';
    }

    // Force COP format cleanly without fragile replace strings
    const formattedStr = CurrencyCopPipe.formatter.format(Number(value));
    return `COP $${formattedStr}`;
  }
}
