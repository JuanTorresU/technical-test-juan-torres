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

El despliegue está pensado y configurado para conectarse directamente a la rama de GitHub/GitLab/Bitbucket vía **AWS Amplify Hosting**. 

Para facilitar el despliegue automático, se ha incluido el archivo `amplify.yml` en la raíz del proyecto. Este archivo contiene la configuración necesaria para instalar dependencias y construir el proyecto:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist/technical-test-funds-app/browser
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Paso a paso del Deploy:
1. Sube este repositorio a un proveedor compatible (ej. GitHub, GitLab).
2. Entra a la consola de **AWS Amplify** y selecciona **Host web app**.
3. Conecta el repositorio e indica la rama principal (`main` o `master`).
4. Amplify detectará automáticamente el archivo `amplify.yml`.
5. Procede a crear la aplicación y espera a que termine el build y el deploy inicial.

### Configuración de Rewrites (Importante para la SPA):
Dado que es una Single Page Application, debes configurar una regla de **Rewrites and redirects** en la consola de Amplify para evitar errores `404` al recargar páginas o acceder a rutas directamente:

1. Ve a "App settings" > "Rewrites and redirects".
2. Añade la siguiente regla:
   - **Source address:** `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>`
   - **Target address:** `/index.html`
   - **Type:** `200 (Rewrite)`

---

## URL Desplegada
*Pendiente.*  *(Reemplazar con la URL generada por AWS Amplify)*
