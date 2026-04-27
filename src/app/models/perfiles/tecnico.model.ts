export interface Tecnico {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  taller_id: number;
  usuario_id: number;
}

export interface TecnicoCrear {
  nombre: string;
  apellido: string;
  telefono: string;
  taller_id: number;
  username: string;
  password: string;
}

export interface TecnicoActualizar {
  nombre?: string;
  apellido?: string;
  telefono?: string;
}
