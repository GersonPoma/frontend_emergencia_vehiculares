import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  // Rutas SIN sidebar (BlankComponent) - Login y Registro
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'login',
        loadChildren: () =>
          import('./pages/cuentas/cuentas.routes').then((m) => m.SeguridadAuthRoutes),
      },
      {
        path: 'registrar-taller',
        loadChildren: () =>
          import('./pages/perfiles/perfiles.routes').then((m) => m.PerfilesPublicRoutes),
      },
    ],
  },
  // Rutas CON sidebar (FullComponent) - Dashboard y Administración
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.PagesRoutes),
      },
      {
        path: 'cuentas',
        loadChildren: () =>
          import('./pages/cuentas/cuentas.routes').then((m) => m.SeguridadRoutes),
      },
      {
        path: 'perfiles',
        loadChildren: () =>
          import('./pages/perfiles/perfiles.routes').then((m) => m.PerfilesRoutes),
      },
      {
        path: 'ui-components',
        loadChildren: () =>
          import('./pages/ui-components/ui-components.routes').then(
            (m) => m.UiComponentsRoutes
          ),
      },
      {
        path: 'extra',
        loadChildren: () =>
          import('./pages/extra/extra.routes').then((m) => m.ExtraRoutes),
      },
      {
        path: 'notificaciones',
        loadComponent: () =>
          import('./pages/notificaciones/notificaciones').then((m) => m.NotificacionesComponent),
        data: { title: 'Notificaciones' }
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
