import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { InvestmentStore } from '../../state/investment.store';
import { CurrencyCopPipe } from '../../shared/currency-cop.pipe';

@Component({
  selector: 'app-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, CurrencyCopPipe],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent {
  readonly store = inject(InvestmentStore);
}
