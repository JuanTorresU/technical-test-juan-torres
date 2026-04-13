# Plataforma de Gestión de Fondos

> Este repositorio no corresponde a código oficial de ninguna entidad financiera, unicamente corresponde a una prueba técnica personal.

SPA para simulación de inversión en fondos (FPV, FIC). Suscripción, cancelación, portafolio activo e historial de transacciones.

**URL desplegada:** [https://main.d2bvyk6wah0lop.amplifyapp.com/](https://main.d2bvyk6wah0lop.amplifyapp.com/)

## Stack

Angular 21 (standalone, zoneless) · TypeScript strict · Signals para estado · SCSS · AWS Amplify

## Decisiones técnicas

- Repository pattern con `InjectionToken` para desacoplar la fuente de datos del store.
- Estado global con Signals (`signal`, `computed`, `rxResource`). Sin NgRx — RxJS solo para la capa HTTP.
- Tipado estricto sin `any`. Operaciones retornan `OperationResult` (union discriminada con errores tipados).
- Persistencia en `localStorage` con rehidratación al iniciar y debounce al escribir.
- Environments separados para desarrollo y producción (`environment.ts`).

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
