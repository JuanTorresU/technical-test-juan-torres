import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'catalog', pathMatch: 'full' },
  { 
    path: 'catalog', 
    loadChildren: () => import('./features/catalog/catalog.routes').then(m => m.CATALOG_ROUTES)
  }
];
