import { Component, inject, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { InvestmentStore } from '../../state/investment.store';
import { CurrencyCopPipe } from '../../shared/currency-cop.pipe';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, CurrencyCopPipe, DatePipe],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent {
  readonly store = inject(InvestmentStore);

  // Derivación Pura de State: Toma el signal bruto y produce una array inmutable
  // ordenado descendentemente por la estampa de tiempo
  readonly sortedTransactions = computed(() => {
    // Clonamos para mutar superficialmente el sort sin corromper el ReadonlySignal base
    const txs = [...this.store.transactions()]; 
    return txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });
}
