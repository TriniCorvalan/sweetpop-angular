# SweetPop Angular

Tienda de dulces en Angular 21. Incluye catálogo por categorías, armado de cajas, carrito, autenticación por roles y CRUD de inventario contra **json-server**.

## Requisitos

- Node.js 20+
- npm 11+
- Docker y Docker Compose (opcional, para despliegue local en contenedores)

## Instalación

```bash
npm install
```

## Desarrollo local

La app y la API de inventario son procesos separados. Para usar el inventario hace falta tener **ambos** en ejecución.

### 1. API (json-server)

Sirve el recurso `inventory` desde `db.json` en el puerto **3000**:

```bash
npm run api
```

Endpoint: `http://localhost:3000/inventory`

### 2. Frontend (Angular)

```bash
npm start
```

Abrir [http://localhost:4200/](http://localhost:4200/). La app se recarga al cambiar el código fuente.

> Sin `npm run api`, el catálogo y el resto de la UI funcionan; el módulo de inventario mostrará error de conexión.

## Scripts útiles

| Comando | Descripción |
| --- | --- |
| `npm start` | Servidor de desarrollo (`ng serve`) |
| `npm run api` | API REST local con json-server |
| `npm run build` | Build de producción en `dist/` |
| `npm test` | Tests unitarios con Vitest |
| `npm run compodoc` | Genera documentación en `documentation/` |
| `npm run compodoc:serve` | Genera y sirve Compodoc en el navegador |

## Docker

Levanta la app compilada (NGINX en el puerto **8080**) y json-server (puerto **3000**):

```bash
docker compose up --build
```

| Servicio | URL |
| --- | --- |
| Angular (NGINX) | [http://localhost:8080/](http://localhost:8080/) |
| API inventario | [http://localhost:3000/inventory](http://localhost:3000/inventory) |

`db.json` se monta como volumen, así que los cambios de inventario persisten en el host.

Para detener:

```bash
docker compose down
```

## Roles y rutas principales

| Ruta | Acceso |
| --- | --- |
| `/`, catálogo (`/dulces`, `/gomitas`, `/chocolates`, …), `/cajas` | Público |
| `/inicio-sesion`, `/registro`, `/recuperar-contrasena` | Solo invitados |
| `/carrito`, `/perfil` | Usuario autenticado (`user`) |
| `/inventario`, `/inventario/nuevo`, `/inventario/:id` | Admin |
| `/clientes` | Admin |

## Stack

- Angular 21 + Bootstrap 5
- json-server (API de inventario)
- Vitest (tests)
- Compodoc (documentación)
- Docker multi-stage + NGINX (producción local)
