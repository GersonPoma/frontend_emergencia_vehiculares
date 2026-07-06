export interface TallerRegistrar {
  nombre: string;
  telefono: string;
  direccion: string;
  latitud: number;
  longitud: number;
  username: string;
  password: string;
}

export interface TallerActualizar {
  nombre?: string;
  telefono?: string;
  direccion?: string;
  hora_apertura?: string | null;
  hora_cierre?: string | null;
  latitud?: number;
  longitud?: number;
  disponible?: boolean;
}

export interface TallerEstadoActualizar {
  disponible: boolean;
}

export interface TallerSalida {
  id: number;
  nombre: string;
  telefono: string;
  direccion: string;
  hora_apertura: string;
  hora_cierre: string;
  latitud: number;
  longitud: number;
  disponible: boolean;
  usuario_id: number;
}
