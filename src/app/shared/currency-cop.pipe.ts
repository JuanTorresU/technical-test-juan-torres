import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyCop'
})
export class CurrencyCopPipe implements PipeTransform {
  // Formatter cacheado para evitar reinstanciación en cada transform
  private static formatter = new Intl.NumberFormat('es-CO', {
    style: 'decimal',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return 'COP $0';
    }

    // Formatear directamente sin depender de reemplazos frágiles de string
    const formattedStr = CurrencyCopPipe.formatter.format(Number(value));
    return `COP $${formattedStr}`;
  }
}
