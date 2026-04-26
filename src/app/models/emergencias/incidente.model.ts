export type EstadoIncidente = 'Pendiente' | 'En proceso' | 'Atendido' | 'Cancelado';

export type PrioridadIncidente = 'Alta' | 'Media' | 'Baja' | 'Incierta';

export interface Incidente {
  id: number;
  latitud: number;
  longitud: number;
  fecha_hora: string;
  estado: EstadoIncidente;
  prioridad: PrioridadIncidente;
  usuario_id: number;
}
