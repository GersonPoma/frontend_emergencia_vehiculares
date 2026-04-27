export interface Usuario {
  id: number;
  username: string;
  rol_id: number;
}

export interface UsuarioCrear {
  username: string;
  password: string;
  rol_id: number;
}

export interface UsuarioActualizar {
  username?: string;
  password?: string;
  rol_id?: number;
}
