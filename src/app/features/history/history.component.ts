import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvestmentStore } from '../../state/investment.store';
import { CurrencyCopPipe } from '../../shared/currency-cop.pipe';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, CurrencyCopPipe],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent {
  readonly store = inject(InvestmentStore);
}
