import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';

export const PagesRoutes: Routes = [
  {
    path: '',
    component: StarterComponent,
    data: {
      title: 'Starter',
      urls: [
        { title: 'Dashboard', url: '/' },
        { title: 'Starter' },
      ],
    },
  },
  {
    path: 'cuentas',
    loadChildren: () =>
      import('./cuentas/cuentas.routes').then((m) => m.SeguridadRoutes),
  },
];
