export interface TallerRegistrar {
  nombre: string;
  telefono: string;
  direccion: string;
  latitud: number;
  longitud: number;
  username: string;
  password: string;
}

export interface TallerSalida {
  id: number;
  nombre: string;
  telefono: string;
  direccion: string;
  latitud: number;
  longitud: number;
  usuario_id: number;
}
