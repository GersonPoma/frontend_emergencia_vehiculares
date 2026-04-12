# Frontend - Emergencia Vehicular

Aplicación frontend desarrollada con **Angular 19** y **Angular Material** para la gestión del sistema de emergencia vehicular. Incluye módulos de autenticación, gestión de cuentas (usuarios y roles), perfiles de talleres, técnicos y servicios.

---

## Tabla de Contenidos

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración de Entorno](#configuración-de-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Sistema de Rutas](#sistema-de-rutas)
- [Módulos Implementados](#módulos-implementados)
- [Modelos](#modelos)
- [Servicios](#servicios)
- [Sidebar / Navegación](#sidebar--navegación)
- [Cómo Agregar Nuevos Módulos](#cómo-agregar-nuevos-módulos)

---

## Requisitos

- **Node.js** v18+
- **npm** v9+
- **Angular CLI** v19

Verificar versiones instaladas:

```bash
node --version
npm --version
ng version
```

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd frontend_emergencia_vehiculares
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar servidor de desarrollo

```bash
ng serve
# o
npm start
```

La aplicación estará disponible en `http://localhost:4200`

### 4. Compilar para producción

```bash
ng build --configuration production
```

---

## Configuración de Entorno

Los archivos de entorno se encuentran en `src/environments/`.

### Desarrollo — `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8000'
};
```

### Producción — `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.ejemplo.com'
};
```

El `ConfigService` usa `apiBaseUrl` para construir todas las URLs de la API:

```typescript
// src/app/services/config.service.ts
getApiUrl('tecnicos') // → 'http://localhost:8000/tecnicos'
```

Para cambiar la URL del backend en desarrollo, edita `environment.ts`.

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── layouts/
│   │   ├── full/                    # Layout con sidebar (rutas protegidas)
│   │   │   └── sidebar/
│   │   │       ├── sidebar-data.ts  # Items del menú de navegación
│   │   │       └── nav-item/        # Componente de ítem del menú
│   │   └── blank/                   # Layout sin sidebar (login, registro)
│   │
│   ├── models/                      # Interfaces TypeScript
│   │   ├── pagination.model.ts
│   │   ├── cuentas/
│   │   │   ├── login.model.ts
│   │   │   ├── Usuario.model.ts
│   │   │   ├── rol.model.ts
│   │   │   ├── privilegio.model.ts
│   │   │   └── permisos.model.ts
│   │   └── perfiles/
│   │       ├── taller.model.ts
│   │       ├── tecnico.model.ts
│   │       └── servicio.model.ts
│   │
│   ├── pages/                       # Páginas / módulos
│   │   ├── cuentas/
│   │   │   ├── cuentas.routes.ts
│   │   │   ├── autenticacion/
│   │   │   ├── usuario/
│   │   │   │   ├── crear-usuario/
│   │   │   │   └── eliminar-usuario/
│   │   │   └── rol/
│   │   │       ├── crear-rol/
│   │   │       ├── eliminar-rol/
│   │   │       └── gestionar-privilegios/
│   │   ├── perfiles/
│   │   │   ├── perfiles.routes.ts
│   │   │   ├── taller/              # Registro público de taller
│   │   │   ├── tecnico/
│   │   │   │   ├── crear-tecnico/
│   │   │   │   └── eliminar-tecnico/
│   │   │   └── servicio/
│   │   │       ├── crear-servicio/
│   │   │       └── eliminar-servicio/
│   │   ├── extra/
│   │   ├── ui-components/
│   │   └── pages.routes.ts
│   │
│   ├── services/
│   │   ├── api.service.ts           # CRUD genérico
│   │   ├── auth.service.ts          # Autenticación y sesión
│   │   └── config.service.ts        # URLs y configuración
│   │
│   ├── app.routes.ts                # Rutas raíz
│   └── app.config.ts
│
├── environments/
│   ├── environment.ts               # Desarrollo
│   └── environment.prod.ts          # Producción
└── styles.scss
```

---

## Sistema de Rutas

### Rutas raíz — `app.routes.ts`

```
/                       → redirige a /login

BlankComponent (sin sidebar):
  /login                → Autenticación
  /registrar-taller     → Registro público de taller

FullComponent (con sidebar):
  /cuentas/usuarios     → Gestión de usuarios
  /cuentas/roles        → Gestión de roles
  /perfiles/tecnicos    → Gestión de técnicos
  /perfiles/servicios   → Gestión de servicios del taller

/**                     → redirige a /login
```

### Módulo Cuentas — `pages/cuentas/cuentas.routes.ts`

| Exportación | Ruta | Componente |
|---|---|---|
| `SeguridadAuthRoutes` | `/login` | `Autenticacion` |
| `SeguridadRoutes` | `/cuentas/usuarios` | `UsuarioComponent` |
| `SeguridadRoutes` | `/cuentas/roles` | `RolComponent` |

### Módulo Perfiles — `pages/perfiles/perfiles.routes.ts`

| Exportación | Ruta | Componente |
|---|---|---|
| `PerfilesPublicRoutes` | `/registrar-taller` | `RegistrarTallerComponent` |
| `PerfilesRoutes` | `/perfiles/tecnicos` | `TecnicoComponent` |
| `PerfilesRoutes` | `/perfiles/servicios` | `ServicioComponent` |

---

## Módulos Implementados

### Autenticación (`/login`)

- Login con `username` y `password`
- Guarda en `localStorage`: `access_token`, `id_usuario`, `username`, `rol`, `id_taller`, `id_perfil`
- El `AuthService` restaura el estado completo al recargar la página (incluye `id_taller` e `id_perfil`)

### Usuarios (`/cuentas/usuarios`)

CRUD completo de usuarios del sistema.

**Endpoints backend:**
- `GET usuarios/` — listar con paginación
- `POST usuarios/` — crear
- `PUT usuarios/{id}/` — actualizar
- `DELETE usuarios/{id}/` — eliminar

### Roles (`/cuentas/roles`)

Gestión de roles y asignación de privilegios.

**Endpoints backend:**
- `GET roles/` — listar
- `POST roles/` — crear
- `PUT roles/{id}/` — actualizar
- `DELETE roles/{id}/` — eliminar

### Registro de Taller (`/registrar-taller`)

Formulario público (sin login) para registrar un nuevo taller con selección de ubicación en mapa.

**Campos:** nombre, teléfono, dirección, latitud, longitud, username, password

**Endpoint backend:**
- `POST talleres/` — registrar taller

### Técnicos (`/perfiles/tecnicos`)

Gestión de técnicos del taller autenticado. El `id_taller` se obtiene automáticamente del estado de sesión.

**Endpoints backend:**
- `GET tecnicos/taller/{tallerId}` — listar técnicos del taller (con paginación)
- `POST tecnicos/` — crear técnico (requiere `taller_id`)
- `PUT tecnicos/{id}/` — actualizar (nombre, apellido, teléfono)
- `DELETE tecnicos/{id}/` — eliminar

**Campos al crear:** nombre, apellido, teléfono, username, password, taller_id

### Servicios del Taller (`/perfiles/servicios`)

Gestión de servicios ofrecidos por el taller autenticado.

**Endpoints backend:**
- `GET servicios-taller/taller/{tallerId}` — listar servicios del taller (con paginación)
- `POST servicios-taller/` — crear servicio
- `PUT servicios-taller/{id}/` — actualizar servicio
- `DELETE servicios-taller/{id}/` — eliminar servicio

**Campos:** tipo_servicio (str), precio (float), taller_id (int)

---

## Modelos

### `pagination.model.ts`

```typescript
export interface Pagination<T> {
  datos: T[];
  total: number;
  pagina: number;
  tamanio: number;
}
```

### `cuentas/login.model.ts`

```typescript
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  id_usuario: number;
  id_perfil: number | null;
  id_taller: number | null;
  rol: string;
  privilegios: string[];
}
```

### `perfiles/tecnico.model.ts`

```typescript
export interface Tecnico {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  taller_id: number;
  usuario_id: number;
}

export interface TecnicoCrear {
  nombre: string;
  apellido: string;
  telefono: string;
  taller_id: number;
  username: string;
  password: string;
}

export interface TecnicoActualizar {
  nombre?: string;
  apellido?: string;
  telefono?: string;
}
```

### `perfiles/servicio.model.ts`

```typescript
export interface Servicio {
  id: number;
  tipo_servicio: string;
  precio: number;
  taller_id: number;
}

export interface ServicioCrear {
  tipo_servicio: string;
  precio: number;
  taller_id: number;
}

export interface ServicioActualizar {
  tipo_servicio?: string;
  precio?: number;
}
```

---

## Servicios

### `ApiService` — CRUD genérico

Todos los métodos retornan `Observable`. Úsalos siempre con `takeUntil(this.destroy$)` para evitar memory leaks.

```typescript
// Listar con paginación
getWithPagination<T>(url: string, page: number, pageSize: number): Observable<Pagination<T>>

// Listar sin paginación
getAll<T>(url: string): Observable<T[]>

// Obtener por ID
getById<T>(url: string, id: number): Observable<T>

// Crear
create<T>(url: string, data: any): Observable<T>

// Actualizar (PUT)
update<T>(url: string, id: number, data: any): Observable<T>

// Actualizar parcial (PATCH)
patch<T>(url: string, id: number, data: any): Observable<T>

// Eliminar
delete(url: string, id: number): Observable<any>
```

**Ejemplo de uso:**

```typescript
const url = this.configService.getApiUrl('tecnicos');

this.apiService.getWithPagination<Tecnico>(url, 1, 10)
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (data) => {
      this.dataSource = data.datos;
      this.totalItems = data.total;
    },
    error: (err) => console.error(err)
  });
```

### `AuthService`

Gestiona login, logout y estado de sesión. Los datos se persisten en `localStorage`.

```typescript
login(credentials: LoginRequest): Observable<LoginResponse>
logout(): Observable<void>
isAuthenticated(): boolean
getAccessToken(): string | null
getCurrentAuthState(): AuthState   // retorna id_taller, id_perfil, rol, etc.
```

**`AuthState`:**

```typescript
interface AuthState {
  isAuthenticated: boolean;
  id_usuario: number | null;
  username: string | null;
  access_token: string | null;
  rol: string | null;
  id_perfil: number | null;
  id_taller: number | null;
  privilegios: string[];
}
```

> **Importante:** `id_taller` e `id_perfil` se restauran correctamente desde `localStorage` al recargar la página. Úsalos siempre desde `getCurrentAuthState()`.

### `ConfigService`

```typescript
getApiUrl(endpoint: string): string
// Ejemplo: getApiUrl('tecnicos') → 'http://localhost:8000/tecnicos'
```

---

## Sidebar / Navegación

El menú de navegación se configura en `src/app/layouts/full/sidebar/sidebar-data.ts`.

Los íconos usan la librería **Iconify** con el set **Solar** (`solar:nombre-del-icono`).

**Estructura actual del menú:**

```typescript
export const navItems: NavItem[] = [
  { navCap: 'Cuentas' },
  { displayName: 'Usuarios',  iconName: 'solar:user-id-line-duotone',               route: '/cuentas/usuarios' },
  { displayName: 'Roles',     iconName: 'solar:lock-password-unlocked-line-duotone', route: '/cuentas/roles' },

  { navCap: 'Técnicos' },
  { displayName: 'Técnicos',  iconName: 'solar:user-hands-line-duotone',              route: '/perfiles/tecnicos' },
  { displayName: 'Servicios', iconName: 'solar:settings-minimalistic-line-duotone',   route: '/perfiles/servicios' },
];
```

**Cómo agregar un nuevo ítem:**

```typescript
{
  displayName: 'Mi Módulo',
  iconName: 'solar:nombre-icono-line-duotone',
  route: '/mi-modulo/lista',
}
```

Para íconos válidos del set Solar consultar: https://icon-sets.iconify.design/solar/

---

## Cómo Agregar Nuevos Módulos

Sigue el patrón de `tecnico` o `servicio` como referencia.

### Paso 1: Crear el modelo

```
src/app/models/perfiles/mi-entidad.model.ts
```

```typescript
export interface MiEntidad {
  id: number;
  campo: string;
  taller_id: number;
}

export interface MiEntidadCrear {
  campo: string;
  taller_id: number;
}

export interface MiEntidadActualizar {
  campo?: string;
}
```

### Paso 2: Crear la estructura de carpetas

```
src/app/pages/perfiles/mi-entidad/
├── mi-entidad.ts
├── mi-entidad.html
├── mi-entidad.scss
├── crear-mi-entidad/
│   ├── crear-mi-entidad.ts
│   └── crear-mi-entidad.html
└── eliminar-mi-entidad/
    └── eliminar-mi-entidad.ts
```

### Paso 3: Registrar la ruta

En `src/app/pages/perfiles/perfiles.routes.ts`:

```typescript
import { MiEntidadComponent } from './mi-entidad/mi-entidad';

export const PerfilesRoutes: Routes = [
  // ... rutas existentes ...
  {
    path: 'mi-entidad',
    component: MiEntidadComponent,
    data: { title: 'Mi Entidad' }
  }
];
```

### Paso 4: Agregar al sidebar

En `src/app/layouts/full/sidebar/sidebar-data.ts`:

```typescript
{
  displayName: 'Mi Entidad',
  iconName: 'solar:nombre-icono-line-duotone',
  route: '/perfiles/mi-entidad',
}
```

### Paso 5: Obtener el tallerId en el componente

```typescript
ngOnInit(): void {
  this.tallerId = this.authService.getCurrentAuthState().id_taller;

  if (!this.tallerId) {
    this.snackBar.open('No tienes un taller asignado', 'Cerrar', { duration: 5000 });
    return;
  }

  this.apiUrl = this.configService.getApiUrl(`mi-endpoint/taller/${this.tallerId}`);
  this.loadData();
}
```

---

**Última actualización:** 2026-04-12
**Versión:** 1.0.0
