import { InjectionToken } from '@angular/core';

/** Token que provee la URL base de la API desde la configuración de entorno */
export const API_URL = new InjectionToken<string>('API_URL');
