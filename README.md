# Plataforma de Gestión de Fondos

> Este repositorio no corresponde a código oficial de ninguna entidad financiera, unicamente corresponde a una prueba técnica personal.

Aplicación SPA (Single Page Application) para la simulación de inversión y gestión en distintos fondos (FPV, FIC). 
Desarrollada como prueba técnica.

## Stack Tecnológico
- **Framework:** Angular 17+ (Standalone Components)
- **Lenguaje:** TypeScript 5+ (Tipado estricto)
- **Estilos:** SCSS (Vanilla CSS para diseño premium oscuro)
- **Estado Global:** Angular Signals (`signal`, `computed`, `effect`)
- **Persistencia:** `localStorage`
- **Hosting:** AWS Amplify

## Decisiones Técnicas Principales
- **Arquitectura Standalone:** No se utilizan `NgModules`. Los componentes son independientes y eficientes.
- **Store de Negocio Propio:** Todo el estado de la aplicación vive en un store (`InvestmentStore`) basado íntegramente en la reactividad de Signals, evitando externalizar el control con librerías pesadas o `BehaviorSubject`/`RxJS` para estado puro. RxJS se reservó únicamente para integración asíncrona.
- **Reglas Strict:** Sin uso de `any` ni `void`/`boolean` como retorno difuso en reglas de negocio; se opta siempre por validaciones explícitas de negocio en dos capas y tipos que envuelven la respuesta y los posibles errores (`OperationResult`, `OperationError`).

## Instrucciones de Ejecución Local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar el servidor local:
   ```bash
   npm run start
   ```
   > También equivalente a `ng serve`. La aplicación estará disponible en `http://localhost:4200/`.

## Instrucciones de Test
Ejecutar la suite de pruebas unitarias implementada (ej. `investment.store.spec.ts`) usando:
```bash
npm run test
```

## Configuración y Deploy a AWS Amplify
El despliegue está pensado y configurado para conectarse directamente a la rama via AWS Amplify. 
Paso principal: Conectar el repositorio y utilizar las siguientes especificaciones base:
- **Build Command:** `npm run build`
- **Base Directory:** `dist/technical-test-funds-app/browser` (o según se verifique el build en Angular 17).
La plataforma configurará automáticamente el Rewrite 200 hacia `index.html`.

## URL Desplegada
*Pendiente.*
