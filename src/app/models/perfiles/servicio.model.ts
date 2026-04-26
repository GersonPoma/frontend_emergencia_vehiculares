export interface Servicio {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  taller_id: number;
}

export interface ServicioCrear {
  nombre: string;
  categoria: string;
  precio: number;
  taller_id: number;
}

export interface ServicioActualizar {
  nombre?: string;
  categoria?: string;
  precio?: number;
}
