export interface AsignacionPendiente {
  id: number;
  incidente_id: number;
  distancia_km: number;
  estado: 'Notificado' | 'Aceptado' | 'Rechazado';
}
