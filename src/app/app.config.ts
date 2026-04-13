import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { FUND_REPOSITORY } from './core/repositories/fund.repository';
import { ApiFundRepository } from './core/repositories/api-fund.repository';
import { BALANCE_REPOSITORY } from './core/repositories/balance.repository';
import { ApiBalanceRepository } from './core/repositories/api-balance.repository';
import { API_URL } from './core/tokens/api.token';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    { provide: API_URL, useValue: environment.apiUrl },
    { provide: FUND_REPOSITORY, useClass: ApiFundRepository },
    { provide: BALANCE_REPOSITORY, useClass: ApiBalanceRepository }
  ]
};
