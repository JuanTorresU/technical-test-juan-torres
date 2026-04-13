# Plataforma de Gestión de Fondos

> Este repositorio no corresponde a código oficial de ninguna entidad financiera, unicamente corresponde a una prueba técnica personal.

SPA para simulación de inversión en fondos (FPV, FIC). Suscripción, cancelación, portafolio activo e historial de transacciones.

**URL desplegada:** [https://main.d2bvyk6wah0lop.amplifyapp.com/](https://main.d2bvyk6wah0lop.amplifyapp.com/)

## Stack

Angular 21 (standalone, zoneless) · TypeScript strict · Signals para estado · SCSS · AWS Amplify

## Decisiones técnicas

- **Repository Pattern & DI:** `InjectionToken` para desacoplar el origen de datos del store, facilitando pruebas e intercambio de fuentes.
- **Mock de API:** Uso de **Mockfly** para simular rápidamente el backend y servir los datos.
- **Estado Reactivo (Signals):** Store 100% zoneless con Angular 21 (`signal`, `computed`, `rxResource`). Sin NgRx; RxJS limitado a peticiones HTTP.
- **Tipado Estricto (OperationResult):** Proyecto libre de `any`. Uniones discriminadas para el manejo predecible de errores a nivel del compilador.
- **Persistencia Local:** Almacenamiento en `localStorage` con rehidratación al inicio y **debounce** para evitar llamadas excesivas de escritura.
- **Entornos:** Archivos `environment.ts` independientes para separar configuración local y de producción en AWS.


## Ejecución local

```bash
npm install
npm run start        # http://localhost:4200/
```

## Tests

```bash
npm run test
```

Cobertura: store de estado, componentes de features, pipe de moneda, servicio de persistencia.

## Deploy

AWS Amplify conectado a la rama `main` con CI/CD automático. Config de build en `amplify.yml`.
