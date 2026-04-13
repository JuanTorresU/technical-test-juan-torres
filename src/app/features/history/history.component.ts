import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { InvestmentStore } from '../../state/investment.store';
import { CurrencyCopPipe } from '../../shared/currency-cop.pipe';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, CurrencyCopPipe, IconComponent],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
/** Vista del historial de transacciones (suscripciones y cancelaciones) */
export class HistoryComponent {
  readonly store = inject(InvestmentStore);
}
