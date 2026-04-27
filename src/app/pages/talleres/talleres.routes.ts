import { Routes } from '@angular/router';

export const TalleresRoutes: Routes = [
  {
    path: 'historial',
    loadComponent: () =>
      import('./historial-incidentes/historial-incidentes').then(
        (m) => m.HistorialIncidentesComponent
      ),
    data: { title: 'Historial de Incidentes' },
  },
  {
    path: 'ordenes-servicio',
    loadComponent: () =>
      import('./ordenes-servicio/ordenes-servicio').then(
        (m) => m.OrdenesServicioComponent
      ),
    data: { title: 'Órdenes de Servicio' },
  },
];
