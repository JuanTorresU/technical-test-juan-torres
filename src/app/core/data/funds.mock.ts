import { Fund } from '../models/fund.model';

export const INITIAL_BALANCE = 500_000;

export const FUNDS_MOCK: Fund[] = [
  { id: 1, name: 'FPV_RECAUDADORA', minimumAmount: 75_000, category: 'FPV' },
  { id: 2, name: 'FPV_ECOPETROL_SIM', minimumAmount: 125_000, category: 'FPV' },
  { id: 3, name: 'FIC_DEUDA_PRIVADA', minimumAmount: 50_000, category: 'FIC' },
  { id: 4, name: 'FIC_ACCIONES', minimumAmount: 250_000, category: 'FIC' },
  { id: 5, name: 'FPV_DINAMICA', minimumAmount: 100_000, category: 'FPV' },
];
