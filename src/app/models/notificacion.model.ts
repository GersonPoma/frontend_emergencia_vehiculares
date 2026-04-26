export interface Notificacion {
  id: number;
  titulo: string;
  cuerpo: string;
  tipo: 'asignacion' | 'info';
  leida: boolean;
  fecha: string;
  datos?: { incidente_id?: number };
}
