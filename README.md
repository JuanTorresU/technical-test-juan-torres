# Plataforma de Gestión de Fondos

> Este repositorio no corresponde a código oficial de ninguna entidad financiera, unicamente corresponde a una prueba técnica personal.

Aplicación SPA para la simulación de inversión y gestión en distintos fondos de inversión (FPV, FIC). Permite suscribirse a fondos, cancelar suscripciones, consultar el portafolio activo y revisar el historial de transacciones.

**URL desplegada:** [https://main.d2bvyk6wah0lop.amplifyapp.com/](https://main.d2bvyk6wah0lop.amplifyapp.com/)

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Angular 21 (Standalone Components) |
| Lenguaje | TypeScript 5+ (strict mode) |
| Estado | Angular Signals (`signal`, `computed`, `effect`, `rxResource`) |
| Estilos | SCSS |
| API | REST (consumida vía `HttpClient` + repositorios) |
| Persistencia local | `localStorage` (saldo y suscripciones) |
| Hosting | AWS Amplify |

## Arquitectura del Proyecto

```
src/app/
├── core/                        # Capa de dominio e infraestructura
│   ├── models/                  # Entidades y tipos de negocio (Fund, Transaction, OperationResult)
│   ├── repositories/            # Interfaces (puertos) e implementaciones (adaptadores)
│   │   ├── fund.repository.ts           # Puerto: interfaz FundRepository
│   │   ├── api-fund.repository.ts       # Adaptador: implementación HTTP
│   │   ├── balance.repository.ts        # Puerto: interfaz BalanceRepository
│   │   └── api-balance.repository.ts    # Adaptador: implementación HTTP
│   ├── services/                # Servicios de infraestructura (PersistenceService)
│   └── tokens/                  # InjectionTokens para desacoplar dependencias
├── features/                    # Componentes de página (lazy-loaded)
│   ├── catalog/                 # Listado de fondos disponibles y suscripción
│   ├── portfolio/               # Fondos activos del usuario
│   └── history/                 # Historial de transacciones
├── shared/                      # Componentes y pipes reutilizables
│   ├── icon.component.ts
│   ├── confirm-dialog.component.ts
│   ├── toast.component.ts
│   └── currency-cop.pipe.ts
├── state/
│   └── investment.store.ts      # Store global basado en Signals
└── app.routes.ts                # Rutas con lazy loading por componente
```

### Patrones aplicados

- **Repository Pattern con InjectionTokens:** Los repositorios se definen como interfaces (`FundRepository`, `BalanceRepository`) y se inyectan vía `InjectionToken`. Las implementaciones concretas (`ApiFundRepository`, `ApiBalanceRepository`) se registran en `app.config.ts`, permitiendo intercambiar la fuente de datos sin tocar la lógica de negocio.
- **Store reactivo propio con Signals:** `InvestmentStore` centraliza el estado usando `signal`, `computed` y `rxResource`. No se usa NgRx ni BehaviorSubject para estado — RxJS se reserva exclusivamente para la integración asíncrona con la API (`rxResource`, `HttpClient`).
- **Tipado estricto de negocio:** Sin `any`. Las operaciones retornan `OperationResult` (union discriminada `{ success: true } | { success: false; error: OperationError }`), haciendo explícitos los casos de error (`INSUFFICIENT_BALANCE`, `ALREADY_SUBSCRIBED`, `BELOW_MINIMUM`, `NOT_FOUND`).
- **Environments:** Configuración por entorno (`environment.ts` / `environment.development.ts`) para apuntar a distintas URLs de API.

## Ejecución Local

```bash
npm install
npm run start        # http://localhost:4200/
```

## Tests

```bash
npm run test
```

Cobertura de pruebas unitarias:
- `investment.store.spec.ts` — Store de estado (suscripciones, cancelaciones, validaciones de negocio)
- `catalog.component.spec.ts` — Vista de catálogo de fondos
- `portfolio.component.spec.ts` — Vista de portafolio activo
- `history.component.spec.ts` — Vista de historial de transacciones
- `currency-cop.pipe.spec.ts` — Pipe de formato de moneda COP
- `persistence.service.spec.ts` — Servicio de persistencia en localStorage

## Deploy

Desplegado en **AWS Amplify** conectado directamente a la rama `main`. La configuración de build está en `amplify.yml` en la raíz del proyecto.
