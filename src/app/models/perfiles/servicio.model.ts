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
