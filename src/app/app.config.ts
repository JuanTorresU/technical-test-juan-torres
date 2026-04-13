import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { FUND_REPOSITORY } from './core/repositories/fund.repository';
import { MockFundRepository } from './core/repositories/mock-fund.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    { provide: FUND_REPOSITORY, useClass: MockFundRepository }
  ]
};
