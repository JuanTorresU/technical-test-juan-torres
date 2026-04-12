import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyCop',
  standalone: true
})
export class CurrencyCopPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return 'COP $0';
    }

    const formatter = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });

    // Forzar el formato COP $ para alinear con el requerimiento.
    // Intl con 'es-CO' en algunos browsers da "$ 500.000", ajustamos para asegurar "COP $500.000".
    const formattedStr = formatter.format(Number(value));
    return `COP ${formattedStr}`.replace('COP COP', 'COP');
  }
}
