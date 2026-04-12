import { Routes } from '@angular/router';
import { RegistrarTallerComponent } from './taller/registrar-taller';
import { TecnicoComponent } from './tecnico/tecnico';
import { ServicioComponent } from './servicio/servicio';

// Rutas públicas (sin sidebar)
export const PerfilesPublicRoutes: Routes = [
  {
    path: '',
    component: RegistrarTallerComponent,
    data: { title: 'Registrar Taller' }
  }
];

// Rutas protegidas (con sidebar)
export const PerfilesRoutes: Routes = [
  {
    path: 'tecnicos',
    component: TecnicoComponent,
    data: {
      title: 'Gestión de Técnicos',
      urls: [
        { title: 'Perfiles', url: '/perfiles' },
        { title: 'Técnicos' }
      ]
    }
  },
  {
    path: 'servicios',
    component: ServicioComponent,
    data: {
      title: 'Gestión de Servicios',
      urls: [
        { title: 'Perfiles', url: '/perfiles' },
        { title: 'Servicios' }
      ]
    }
  }
];
