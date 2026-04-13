import { Routes } from '@angular/router';

/** Rutas principales con carga diferida (lazy loading) por feature */
export const routes: Routes = [
  { path: '', redirectTo: 'catalog', pathMatch: 'full' },
  { 
    path: 'catalog', 
    loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent)
  },
  {
    path: 'portfolio',
    loadComponent: () => import('./features/portfolio/portfolio.component').then(m => m.PortfolioComponent)
  },
  {
    path: 'history',
    loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent)
  }
];
